import { beforeEach, describe, expect, it } from 'bun:test';
import {
  TELEMETRY_RATE_LIMIT_MAX,
  TELEMETRY_RATE_LIMIT_WINDOW_MS,
} from '@/lib/telemetry/constants';
import { checkRateLimit, resetRateLimit } from '@/lib/telemetry/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it('allows requests up to the limit', () => {
    for (let i = 0; i < TELEMETRY_RATE_LIMIT_MAX; i++) {
      expect(checkRateLimit('1.2.3.4', 1000)).toBe(true);
    }
  });

  it('rejects the request past the limit within the same window', () => {
    for (let i = 0; i < TELEMETRY_RATE_LIMIT_MAX; i++) {
      checkRateLimit('1.2.3.4', 1000);
    }
    expect(checkRateLimit('1.2.3.4', 1000)).toBe(false);
  });

  it('starts a fresh window once the previous one expires', () => {
    for (let i = 0; i < TELEMETRY_RATE_LIMIT_MAX; i++) {
      checkRateLimit('1.2.3.4', 1000);
    }
    expect(checkRateLimit('1.2.3.4', 1000)).toBe(false);

    const afterReset = 1000 + TELEMETRY_RATE_LIMIT_WINDOW_MS;
    expect(checkRateLimit('1.2.3.4', afterReset)).toBe(true);
  });

  it('tracks each client key independently', () => {
    for (let i = 0; i < TELEMETRY_RATE_LIMIT_MAX; i++) {
      checkRateLimit('1.2.3.4', 1000);
    }
    expect(checkRateLimit('1.2.3.4', 1000)).toBe(false);
    expect(checkRateLimit('5.6.7.8', 1000)).toBe(true);
  });
});
