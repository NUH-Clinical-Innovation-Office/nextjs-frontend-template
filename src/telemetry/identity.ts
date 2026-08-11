/**
 * Session correlation ID for telemetry.
 *
 * Kept separate from `otel.ts` so callers can read the session ID without
 * importing the OpenTelemetry SDK and pulling it into their bundle. The value
 * lives in `sessionStorage`, so it is scoped to the tab and cleared when the
 * tab closes.
 */

const SESSION_ID_KEY = 'otel_session_id';

/**
 * Returns the current tab's session ID, creating one on first use.
 *
 * @returns The session ID, or an empty string during SSR.
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};
