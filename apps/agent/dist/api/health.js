import { ok } from "../utils/response.js";
export async function healthRoutes(fastify) {
    fastify.get("/api/v1/health", async () => ok({ status: "ok", version: "0.1.0" }));
}
//# sourceMappingURL=health.js.map