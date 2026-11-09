import { authMiddleware } from "../security/auth.js";
import { db } from "../database/db.js";
import { ok } from "../utils/response.js";
import { settingsUpdateSchema } from "@nexus-deck/shared";
export async function settingsRoutes(fastify) {
    fastify.get("/api/v1/settings", { preHandler: authMiddleware }, async () => {
        const rows = db.prepare("SELECT key, value, updated_at FROM settings").all();
        const obj = {};
        for (const r of rows) {
            try {
                obj[r.key] = JSON.parse(r.value);
            }
            catch {
                obj[r.key] = r.value;
            }
        }
        return ok(obj);
    });
    fastify.put("/api/v1/settings", { preHandler: authMiddleware }, async (req, reply) => {
        const parsed = settingsUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            reply.code(400);
            return { success: false, data: null, error: { code: "INVALID_REQUEST", message: parsed.error.message }, timestamp: new Date().toISOString() };
        }
        const { key, value } = parsed.data;
        const now = new Date().toISOString();
        db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").run(key, JSON.stringify(value), now);
        return ok({ key, value });
    });
}
//# sourceMappingURL=settings.js.map