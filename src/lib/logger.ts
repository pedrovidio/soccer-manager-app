declare const __DEV__: boolean;

const logsEnabled =
  process.env.EXPO_PUBLIC_ENABLE_LOGS === 'true' ||
  (typeof __DEV__ !== 'undefined' && __DEV__ && process.env.EXPO_PUBLIC_ENABLE_LOGS !== 'false');

function redact(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);

  const copy: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    copy[key] = /password|token|secret|authorization|apikey|key/i.test(key) ? '[redacted]' : redact(item);
  }
  return copy;
}

export const appLogger = {
  debug(message: string, data?: unknown) {
    if (!logsEnabled) return;
    console.log(message, redact(data));
  },
  warn(message: string, data?: unknown) {
    if (!logsEnabled) return;
    console.warn(message, redact(data));
  },
  error(message: string, error?: unknown, data?: unknown) {
    if (!logsEnabled) return;
    console.error(message, {
      ...(data && typeof data === 'object' ? (redact(data) as Record<string, unknown>) : { data: redact(data) }),
      error: formatError(error),
    });
  },
};

function formatError(error: unknown): unknown {
  if (!error || typeof error !== 'object') return error;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return redact(error);
}

