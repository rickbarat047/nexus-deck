const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel = process.env.LOG_LEVEL ?? "info";
function shouldLog(level) {
    return LEVELS[level] >= (LEVELS[minLevel] ?? 20);
}
function fmt(level, msg, meta) {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level.toUpperCase()}] ${msg}`;
    if (meta === undefined)
        return base;
    try {
        return `${base} ${JSON.stringify(meta)}`;
    }
    catch {
        return `${base} [unserializable]`;
    }
}
export const logger = {
    debug(msg, meta) {
        if (shouldLog("debug"))
            console.debug(fmt("debug", msg, meta));
    },
    info(msg, meta) {
        if (shouldLog("info"))
            console.info(fmt("info", msg, meta));
    },
    warn(msg, meta) {
        if (shouldLog("warn"))
            console.warn(fmt("warn", msg, meta));
    },
    error(msg, meta) {
        if (shouldLog("error"))
            console.error(fmt("error", msg, meta));
    },
};
//# sourceMappingURL=logger.js.map