// ── Single place that turns any thrown error into text that's safe to
// show a user. Never render error.message / error.response.data straight
// into an Alert — always go through getErrorMessage() first.

export const GENERIC_ERROR_MESSAGE = 'Internal server error. Please try again later.';
const CONNECTION_ERROR_MESSAGE = 'Unable to connect. Please check your internet connection and try again.';

// Anything matching these looks like a stack trace / raw exception dump
// rather than a message written for an end user — never show it as-is.
const UNSAFE_PATTERNS = [
  /\bat\s+\S+\s*\(/, // "at Object.<anonymous> ("
  /\.(js|ts|jsx|tsx):\d+/, // file:line references
  /node_modules/i,
  /exception/i,
  /stack ?trace/i,
  /ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/,
  /SQLSTATE|syntax error at or near/i,
  /TypeError|ReferenceError|SyntaxError/,
];

const isSafeMessage = (msg) => {
  if (typeof msg !== 'string') return false;
  const trimmed = msg.trim();
  if (!trimmed || trimmed.length > 300) return false;
  return !UNSAFE_PATTERNS.some((pattern) => pattern.test(trimmed));
};

// Flattens NestJS/class-validator error shapes (string, string[], or
// [{ property, constraints }]) down to one display string.
const flattenMessage = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    const parts = raw
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry?.constraints) return Object.values(entry.constraints).join(', ');
        if (entry?.message) return flattenMessage(entry.message);
        return null;
      })
      .filter(Boolean);
    return parts.length ? parts.join('\n') : null;
  }
  if (typeof raw === 'object' && raw.message) return flattenMessage(raw.message);
  return null;
};

// error: an axios error (or anything error-shaped)
// fallback: what to show when the response has no safe message of its own
//           (e.g. a 404 with no body) — still shown to the user, so keep
//           it generic and non-technical, never the raw error.
export const getErrorMessage = (error, fallback = GENERIC_ERROR_MESSAGE) => {
  if (__DEV__) {
    console.error('[API Error]', error?.response?.status, error?.response?.data ?? error?.message ?? error);
  }

  if (!error?.response) {
    return CONNECTION_ERROR_MESSAGE;
  }

  if (error.response.status >= 500) {
    return GENERIC_ERROR_MESSAGE;
  }

  const flattened = flattenMessage(error.response.data?.message ?? error.response.data?.error);

  if (flattened && isSafeMessage(flattened)) {
    return flattened;
  }

  return fallback;
};
