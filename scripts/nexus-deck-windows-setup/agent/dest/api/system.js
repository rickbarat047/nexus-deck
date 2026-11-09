import os from "node:os";
import { collectMetrics } from "../monitoring/monitoring.js";
import { authMiddleware } from "../security/auth.js";
import { ok, fail } from "../utils/response.js";
export async function systemRoutes(fastify) {
    fastify.get("/api/v1/system/info", { preHandler: authMiddleware }, async (req, reply) => {
        const info = {
            hostname: os.hostname(),
            platform: process.platform,
            arch: process.arch,
            cpuModel: os.cpus()[0]?.model ?? "unknown",
            totalMemoryBytes: os.totalmem(),
            agentVersion: "0.1.0",
        };
        return ok(info);
    });
    fastify.get("/api/v1/system/metrics", { preHandler: authMiddleware }, async () => {
        const m = await collectMetrics();
        return ok(m);
    });
}
//# sourceMappingURL=system.js.map