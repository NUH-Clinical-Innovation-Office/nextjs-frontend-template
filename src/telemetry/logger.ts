import type { Attributes } from '@opentelemetry/api';
import { context, trace } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { SERVICE_NAME, SERVICE_VERSION } from '@/telemetry/constants';

/**
 * Get the current logger instance from the global LoggerProvider.
 *
 * Before `initializeOpenTelemetry` runs (or when telemetry is disabled) this
 * resolves to the API's no-op provider, so `emit` is a cheap no-op rather than
 * an error.
 */
const getLogger = () => {
  return logs.getLoggerProvider().getLogger(SERVICE_NAME, SERVICE_VERSION);
};

/**
 * Emits a log record stamped with the active trace context so logs and spans
 * can be correlated in Grafana.
 */
const emitLog = (
  severityNumber: SeverityNumber,
  severityText: string,
  body: string,
  attributes?: Attributes,
): void => {
  const spanContext = trace.getSpan(context.active())?.spanContext();

  getLogger().emit({
    severityNumber,
    severityText,
    body,
    attributes: {
      ...attributes,
      // Use the OpenTelemetry attribute names for correlation fields. These are
      // wire-format keys read by the collector and Grafana, so they keep their
      // snake_case spelling rather than the repo's camelCase convention.
      // biome-ignore-start lint/style/useNamingConvention: OpenTelemetry wire format
      ...(spanContext && {
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
        trace_flags: spanContext.traceFlags,
      }),
      // biome-ignore-end lint/style/useNamingConvention: OpenTelemetry wire format
    },
  });
};

export const logInfo = (message: string, attributes?: Attributes): void => {
  emitLog(SeverityNumber.INFO, 'INFO', message, attributes);
};

export const logWarning = (message: string, attributes?: Attributes): void => {
  emitLog(SeverityNumber.WARN, 'WARN', message, attributes);
};

export const logError = (message: string, attributes?: Attributes): void => {
  emitLog(SeverityNumber.ERROR, 'ERROR', message, attributes);
};

export const logDebug = (message: string, attributes?: Attributes): void => {
  emitLog(SeverityNumber.DEBUG, 'DEBUG', message, attributes);
};
