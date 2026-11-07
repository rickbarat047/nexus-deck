type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel = (process.env.LOG_LEVEL as Level) ?? "info";

function shouldLog(level: Level): boolean {
  return LEVELS[level] >= (LEVELS[minLevel] ?? 20);
}

function fmt(level: Level, msg: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  if (meta === undefined) return base;
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return `${base} [unserializable]`;
  }
}

export const logger = {
  debug(msg: string, meta?: unknown) {
    if (shouldLog("debug")) console.debug(fmt("debug", msg, meta));
  },
  info(msg: string, meta?: unknown) {
    if (shouldLog("info")) console.info(fmt("info", msg, meta));
  },
  warn(msg: string, meta?: unknown) {
    if (shouldLog("warn")) console.warn(fmt("warn", msg, meta));
  },
  error(msg: string, meta?: unknown) {
    if (shouldLog("error")) console.error(fmt("error", msg, meta));
  },
};