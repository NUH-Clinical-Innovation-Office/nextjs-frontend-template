/**
 * Enforces server-owned identity attributes on browser-supplied OTLP/JSON.
 *
 * Protobuf remains opaque and relies on the collector's resource processor; the
 * browser SDK exports JSON, so this guard applies to normal browser traffic.
 */

type OtlpKeyValue = {
  key: string;
  value: Record<string, unknown>;
};

type OtlpResource = {
  attributes?: OtlpKeyValue[];
};

type OtlpResourceEntry = {
  resource?: OtlpResource;
};

type OtlpEnvelope = {
  resourceSpans?: OtlpResourceEntry[];
  resourceMetrics?: OtlpResourceEntry[];
  resourceLogs?: OtlpResourceEntry[];
};

export type EnforcedAttributes = {
  serviceName: string;
  environment: string;
  tenant: string;
};

const setAttribute = (attrs: OtlpKeyValue[], key: string, value: string): void => {
  const stringValue = { stringValue: value };
  const existing = attrs.find((a) => a.key === key);
  if (existing) {
    existing.value = stringValue;
  } else {
    attrs.push({ key, value: stringValue });
  }
};

const enforceOnResourceEntries = (
  entries: OtlpResourceEntry[] | undefined,
  attrs: EnforcedAttributes,
): void => {
  if (!entries) return;
  for (const entry of entries) {
    entry.resource ??= {};
    entry.resource.attributes ??= [];
    setAttribute(entry.resource.attributes, 'service.name', attrs.serviceName);
    setAttribute(entry.resource.attributes, 'deployment.environment', attrs.environment);
    setAttribute(entry.resource.attributes, 'tenant', attrs.tenant);
  }
};

/**
 * Rewrites resource attributes on an OTLP/JSON body.
 *
 * @returns The re-serialized JSON body with enforced attributes, or `null` if
 *   the body is not parseable OTLP/JSON (caller forwards the original bytes).
 */
export const enforceJsonResourceAttributes = (
  body: ArrayBuffer,
  attrs: EnforcedAttributes,
): Uint8Array | null => {
  let parsed: OtlpEnvelope;
  try {
    parsed = JSON.parse(new TextDecoder().decode(body)) as OtlpEnvelope;
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  enforceOnResourceEntries(parsed.resourceSpans, attrs);
  enforceOnResourceEntries(parsed.resourceMetrics, attrs);
  enforceOnResourceEntries(parsed.resourceLogs, attrs);

  return new TextEncoder().encode(JSON.stringify(parsed));
};
