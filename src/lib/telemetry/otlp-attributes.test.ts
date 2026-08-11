import { describe, expect, it } from 'bun:test';
import {
  type EnforcedAttributes,
  enforceJsonResourceAttributes,
} from '@/lib/telemetry/otlp-attributes';

const ATTRS: EnforcedAttributes = {
  serviceName: 'auth-service-frontend',
  environment: 'production',
  tenant: 'auth-service',
};

const encode = (value: unknown): ArrayBuffer => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

const decode = (bytes: Uint8Array | null) => {
  if (!bytes) throw new Error('expected a rewritten body');
  return JSON.parse(new TextDecoder().decode(bytes));
};

const attrsOf = (entry: { resource: { attributes: Array<{ key: string; value: unknown }> } }) => {
  return Object.fromEntries(entry.resource.attributes.map((a) => [a.key, a.value]));
};

describe('enforceJsonResourceAttributes', () => {
  it('overwrites a spoofed service.name', () => {
    const body = encode({
      resourceSpans: [
        { resource: { attributes: [{ key: 'service.name', value: { stringValue: 'spoofed' } }] } },
      ],
    });

    const result = decode(enforceJsonResourceAttributes(body, ATTRS));

    expect(attrsOf(result.resourceSpans[0])['service.name']).toEqual({
      stringValue: 'auth-service-frontend',
    });
  });

  it('adds the enforced attributes when the resource has none', () => {
    const body = encode({ resourceSpans: [{}] });

    const result = decode(enforceJsonResourceAttributes(body, ATTRS));

    expect(attrsOf(result.resourceSpans[0])).toEqual({
      'service.name': { stringValue: 'auth-service-frontend' },
      'deployment.environment': { stringValue: 'production' },
      tenant: { stringValue: 'auth-service' },
    });
  });

  it('enforces across all three signal envelopes', () => {
    const body = encode({
      resourceSpans: [{}],
      resourceMetrics: [{}],
      resourceLogs: [{}],
    });

    const result = decode(enforceJsonResourceAttributes(body, ATTRS));

    for (const entry of [
      result.resourceSpans[0],
      result.resourceMetrics[0],
      result.resourceLogs[0],
    ]) {
      expect(attrsOf(entry).tenant).toEqual({ stringValue: 'auth-service' });
    }
  });

  it('preserves unrelated attributes and payload fields', () => {
    const body = encode({
      resourceSpans: [
        {
          resource: { attributes: [{ key: 'browser.brand', value: { stringValue: 'chrome' } }] },
          scopeSpans: [{ spans: [{ name: 'page-load' }] }],
        },
      ],
    });

    const result = decode(enforceJsonResourceAttributes(body, ATTRS));

    expect(attrsOf(result.resourceSpans[0])['browser.brand']).toEqual({ stringValue: 'chrome' });
    expect(result.resourceSpans[0].scopeSpans[0].spans[0].name).toBe('page-load');
  });

  it('returns null for a non-JSON body so the caller forwards it unchanged', () => {
    const body = new TextEncoder().encode('\x00\x01protobuf-bytes').buffer as ArrayBuffer;

    expect(enforceJsonResourceAttributes(body, ATTRS)).toBeNull();
  });

  it('returns null for JSON that is not an object', () => {
    expect(enforceJsonResourceAttributes(encode('a string'), ATTRS)).toBeNull();
  });
});
