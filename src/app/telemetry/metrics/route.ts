import type { NextRequest } from 'next/server';
import { forwardTelemetryData } from '@/lib/telemetry/proxy';

export const POST = (request: NextRequest) => {
  return forwardTelemetryData(request, 'metrics');
};
