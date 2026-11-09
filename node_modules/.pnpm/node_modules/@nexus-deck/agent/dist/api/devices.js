import { authMiddleware } from "../security/auth.js";
import { revokeDevice, listDevices } from "../pairing/pairing.js";
import { ok, fail } from "../utils/response.js";
export async function deviceRoutes(fastify) {
    fastify.get("/api/v1/devices", { preHandler: authMiddleware }, async () => {
        return ok(listDevices());
    });
    fastify.delete("/api/v1/devices/:id", { preHandler: authMiddleware }, async (req, reply) => {
        const id = req.params.id;
        const okk = revokeDevice(id);
        if (!okk) {
            reply.code(404);
            return fail("APP_NOT_FOUND", "device not found");
        }
        return ok({ revoked: true });
    });
}
//# sourceMappingURL=devices.js.map