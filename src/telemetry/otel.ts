import { context, trace } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ATTR_SESSION_ID } from '@opentelemetry/semantic-conventions/incubating';
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { SERVICE_NAME, SERVICE_VERSION, TELEMETRY_BASE_URL } from '@/telemetry/constants';
import { getSessionId } from '@/telemetry/identity';
import { logInfo, logWarning } from '@/telemetry/logger';

/** Batch tuning shared by the span and log processors. */
const BATCH_CONFIG = {
  maxQueueSize: 100,
  maxExportBatchSize: 10,
  scheduledDelayMillis: 5000,
} as const;

const METRIC_EXPORT_INTERVAL_MS = 60_000;

// JSON allows the proxy to enforce resource attributes before forwarding.
const EXPORTER_CONFIG = { headers: { 'Content-Type': 'application/json' } };

/**
 * Attributes correlating a signal to the current tab. Omits the key when the
 * value is unavailable rather than emitting an empty string.
 */
const correlationAttributes = (): Record<string, string> => {
  const attributes: Record<string, string> = {};
  const sessionId = getSessionId();

  if (sessionId) attributes[ATTR_SESSION_ID] = sessionId;

  return attributes;
};

/**
 * Restrict trace propagation to this origin so third parties never receive
 * internal trace IDs. Same-origin also covers the `/api/*` calls to
 * common-service, which the Next.js server proxies.
 */
const tracePropagationTargets = (): RegExp => {
  return new RegExp(`^${window.location.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
};

/**
 * Registers Core Web Vitals (LCP, INP, CLS, FCP, TTFB) as histograms and
 * annotates the active span with each reading.
 */
const initializeWebVitals = (meterProvider: MeterProvider): void => {
  const meter = meterProvider.getMeter(`${SERVICE_NAME}-web-vitals`);

  // Keys are the metric names `web-vitals` reports (`metric.name`), so they are
  // looked up directly in `record` below and must keep their uppercase spelling.
  // biome-ignore-start lint/style/useNamingConvention: web-vitals metric names
  const histograms = {
    LCP: meter.createHistogram('web_vitals.lcp', {
      description: 'Largest Contentful Paint',
      unit: 'ms',
    }),
    INP: meter.createHistogram('web_vitals.inp', {
      description: 'Interaction to Next Paint',
      unit: 'ms',
    }),
    CLS: meter.createHistogram('web_vitals.cls', {
      description: 'Cumulative Layout Shift score',
      unit: 'score',
    }),
    FCP: meter.createHistogram('web_vitals.fcp', {
      description: 'First Contentful Paint',
      unit: 'ms',
    }),
    TTFB: meter.createHistogram('web_vitals.ttfb', {
      description: 'Time to First Byte',
      unit: 'ms',
    }),
  } as const;
  // biome-ignore-end lint/style/useNamingConvention: web-vitals metric names

  const record = (metric: Metric): void => {
    const { name, value, rating, navigationType } = metric;
    const page = window.location.pathname;

    histograms[name].record(value, { page, rating, navigationType });

    if (rating === 'poor') {
      logWarning(`Poor ${name} detected`, { value, page });
    }

    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      const key = name.toLowerCase();
      activeSpan.setAttribute(`web_vitals.${key}`, value);
      activeSpan.setAttribute(`web_vitals.${key}.rating`, rating);
    }
  };

  onLCP(record);
  onINP(record);
  onCLS(record);
  onFCP(record);
  onTTFB(record);
};

/**
 * Emits a counter and a span for each App Router client-side navigation.
 *
 * Next.js navigates via `pushState`/`replaceState`, which fire no event, so
 * both are patched alongside a `popstate` listener for back/forward.
 */
const trackNavigations = (
  tracerProvider: WebTracerProvider,
  meterProvider: MeterProvider,
): void => {
  const navigationCounter = meterProvider
    .getMeter(SERVICE_NAME)
    .createCounter('navigation_events', { description: 'Number of client-side navigations' });

  let previousUrl = window.location.pathname;

  const onNavigate = (): void => {
    const currentUrl = window.location.pathname;
    if (currentUrl === previousUrl) return;

    navigationCounter.add(1, { page: currentUrl, from: previousUrl });

    const span = tracerProvider.getTracer(SERVICE_NAME, SERVICE_VERSION).startSpan('route-change', {
      attributes: {
        'page.from': previousUrl,
        'page.to': currentUrl,
        ...correlationAttributes(),
      },
    });

    context.with(trace.setSpan(context.active(), span), () => {
      logInfo('Route changed', { from: previousUrl, to: currentUrl });
    });

    span.end();
    previousUrl = currentUrl;
  };

  window.addEventListener('popstate', onNavigate);

  const { pushState, replaceState } = history;
  history.pushState = (...args) => {
    pushState.apply(history, args);
    onNavigate();
  };
  history.replaceState = (...args) => {
    replaceState.apply(history, args);
    onNavigate();
  };
};

type TelemetryResource = ReturnType<typeof defaultResource>;

const createTracerProvider = (resource: TelemetryResource): WebTracerProvider => {
  const tracerProvider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${TELEMETRY_BASE_URL}/traces`, ...EXPORTER_CONFIG }),
        BATCH_CONFIG,
      ),
    ],
  });
  tracerProvider.register();
  return tracerProvider;
};

const createMeterProvider = (resource: TelemetryResource): MeterProvider => {
  return new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${TELEMETRY_BASE_URL}/metrics`,
          ...EXPORTER_CONFIG,
        }),
        exportIntervalMillis: METRIC_EXPORT_INTERVAL_MS,
      }),
    ],
  });
};

const createLoggerProvider = (resource: TelemetryResource): LoggerProvider => {
  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: `${TELEMETRY_BASE_URL}/logs`,
          ...EXPORTER_CONFIG,
        }),
        ...BATCH_CONFIG,
      }),
    ],
  });
  logs.setGlobalLoggerProvider(loggerProvider);
  return loggerProvider;
};

const registerBrowserInstrumentations = (tracerProvider: WebTracerProvider): void => {
  registerInstrumentations({
    tracerProvider,
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: tracePropagationTargets(),
        clearTimingResources: true,
        // Instrumenting telemetry exports would recursively create spans.
        ignoreUrls: [new RegExp(`^${TELEMETRY_BASE_URL}/`)],
        applyCustomAttributesOnSpan: (span, _request, result) => {
          if (result instanceof Response) span.setAttribute('http.status_code', result.status);
          for (const [key, value] of Object.entries(correlationAttributes())) {
            span.setAttribute(key, value);
          }
        },
      }),
    ],
  });
};

const recordPageLoad = (tracerProvider: WebTracerProvider, meterProvider: MeterProvider): void => {
  const page = window.location.pathname;
  meterProvider
    .getMeter(SERVICE_NAME)
    .createCounter('page_loads', { description: 'Number of full page loads' })
    .add(1, { page });

  const pageLoadSpan = tracerProvider
    .getTracer(SERVICE_NAME, SERVICE_VERSION)
    .startSpan('page-load', {
      attributes: {
        'page.path': page,
        'page.referrer': document.referrer || 'direct',
        ...correlationAttributes(),
      },
    });

  context.with(trace.setSpan(context.active(), pageLoadSpan), () => {
    logInfo('Page loaded', { page });
  });
  window.addEventListener('load', () => pageLoadSpan.end(), { once: true });
};

const flushWhenHidden = (
  tracerProvider: WebTracerProvider,
  meterProvider: MeterProvider,
  loggerProvider: LoggerProvider,
): void => {
  // Flush before the page is hidden; unload is unreliable for bfcache pages.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void Promise.allSettled([
        tracerProvider.forceFlush(),
        meterProvider.forceFlush(),
        loggerProvider.forceFlush(),
      ]);
    }
  });
};

/** Guards against a double init if the provider effect ever re-runs. */
let initialized = false;

/**
 * Boots the browser OpenTelemetry SDK: traces, metrics and logs are exported
 * over OTLP/JSON to the same-origin `/telemetry/*` proxy.
 *
 * No-ops unless this is a production build with `NEXT_PUBLIC_OTEL_ENABLED=true`,
 * so local development never ships telemetry.
 */
export const initializeOpenTelemetry = (): void => {
  if (typeof window === 'undefined' || initialized) {
    return;
  }

  const environment = process.env.NODE_ENV ?? 'development';
  // Read straight off `process.env` rather than through `@/lib/env`: that module
  // validates the server schema (and touches server-only variables), so pulling
  // it into the browser bundle would fail validation client-side. Next.js
  // inlines NEXT_PUBLIC_* literals at build time, so this is statically replaced.
  const enabled = environment === 'production' && process.env.NEXT_PUBLIC_OTEL_ENABLED === 'true';
  if (!enabled) {
    return;
  }
  initialized = true;

  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
      'deployment.environment': environment,
    }),
  );

  const tracerProvider = createTracerProvider(resource);
  const meterProvider = createMeterProvider(resource);
  const loggerProvider = createLoggerProvider(resource);
  registerBrowserInstrumentations(tracerProvider);
  trackNavigations(tracerProvider, meterProvider);
  initializeWebVitals(meterProvider);
  recordPageLoad(tracerProvider, meterProvider);
  flushWhenHidden(tracerProvider, meterProvider, loggerProvider);
};
