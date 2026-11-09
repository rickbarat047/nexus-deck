import Fastify from "fastify";
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { readFileSync, existsSync } from "node:fs";
import { config } from "../config/config.js";
import { resolveBindHost, getLanIp } from "../utils/network.js";
import { logger } from "../logging/logger.js";
export async function buildServer() {
    const host = resolveBindHost(config.host, config.devMode);
    const httpsOpts = config.certPath && config.keyPath && existsSync(config.certPath) && existsSync(config.keyPath)
        ? { key: readFileSync(config.keyPath), cert: readFileSync(config.certPath) }
        : null;
    const fastify = Fastify({
        logger: false,
        https: httpsOpts ?? undefined,
        bodyLimit: 1024 * 1024, // 1MB
    });
    await fastify.register(cors, { origin: true, credentials: true });
    await fastify.register(rateLimit, { max: 100, timeWindow: "1 minute" });
    await fastify.register(websocket);
    fastify.decorate("agentHost", host);
    return { fastify, host, https: !!httpsOpts };
}
export { getLanIp };
//# sourceMappingURL=server.js.map