export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogMetadata = Record<string, unknown>;

const REDACTED = '[REDACTED]';
const MAX_DEPTH = 3;
const MAX_ENTRIES = 30;
const MAX_STRING_LENGTH = 200;
const SENSITIVE_KEY = /(pass(word|phrase)?|token|secret|authorization|cookie|session|email|phone|address|name|user|content|message|value|input|output)/i;

const truncate = (value: string): string => value.length <= MAX_STRING_LENGTH
  ? value
  : `${value.slice(0, MAX_STRING_LENGTH)}…`;

const sanitizeValue = (value: unknown, depth: number): unknown => {
  if (value === null || value === undefined || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return truncate(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'symbol' || typeof value === 'function') return `[${typeof value}]`;
  if (value instanceof Error) return { errorType: value.name };
  if (depth >= MAX_DEPTH) return '[MAX_DEPTH]';

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ENTRIES).map((entry) => sanitizeValue(entry, depth + 1));
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value).slice(0, MAX_ENTRIES)) {
      sanitized[key] = SENSITIVE_KEY.test(key) ? REDACTED : sanitizeValue(entry, depth + 1);
    }
    return sanitized;
  }

  return `[${typeof value}]`;
};

export const sanitizeLogMetadata = (metadata: LogMetadata = {}): LogMetadata => sanitizeValue(metadata, 0) as LogMetadata;

export const logEvent = (level: LogLevel, event: string, metadata: LogMetadata = {}): void => {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    event: truncate(event),
    metadata: sanitizeLogMetadata(metadata),
  };
  const serialized = JSON.stringify(record);

  switch (level) {
    case 'debug': console.debug(serialized); break;
    case 'info': console.info(serialized); break;
    case 'warn': console.warn(serialized); break;
    case 'error': console.error(serialized); break;
  }
};
