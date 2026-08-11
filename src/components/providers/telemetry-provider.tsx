'use client';

import { type PropsWithChildren, useEffect } from 'react';

/**
 * Boots the browser OpenTelemetry SDK once on mount.
 *
 * The SDK is dynamically imported so it stays out of the initial bundle, and
 * it self-disables outside production builds with `NEXT_PUBLIC_OTEL_ENABLED`
 * set — see `src/telemetry/otel.ts`.
 */
export const TelemetryProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    import('@/telemetry').catch((error) => {
      console.error('Failed to initialize OpenTelemetry', error);
    });
  }, []);

  return <>{children}</>;
};
