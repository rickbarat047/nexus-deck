import { z } from "zod";
import { authMiddleware } from "../security/auth.js";
import { ok, fail } from "../utils/response.js";
import { getAction } from "../actions/registry.js";
import { listActions } from "../actions/registry.js";
import { actionExecuteSchema } from "@nexus-deck/shared";
import { db } from "../database/db.js";
import { v4 as uuidv4 } from "uuid";
// in-memory dedup of execution ids
const executedIds = new Set();
export async function actionRoutes(fastify) {
    fastify.get("/api/v1/actions", { preHandler: authMiddleware }, async () => {
        return ok(listActions().map((a) => ({ id: a.id, description: a.description, riskLevel: a.riskLevel, requiresConfirmation: a.requiresConfirmation })));
    });
    fastify.post("/api/v1/actions/execute", { preHandler: authMiddleware }, async (req, reply) => {
        const parsed = actionExecuteSchema.safeParse(req.body);
        if (!parsed.success) {
            reply.code(400);
            return fail("INVALID_REQUEST", parsed.error.message);
        }
        const { actionId, executionId, params, confirmed } = parsed.data;
        if (executedIds.has(executionId)) {
            return ok({ executionId, actionId, status: "success", message: "duplicate ignored" });
        }
        const action = getAction(actionId);
        if (!action) {
            reply.code(404);
            return fail("ACTION_NOT_FOUND", "unknown action");
        }
        const v = action.validate(params ?? {});
        if (!v.ok) {
            reply.code(400);
            return fail("INVALID_REQUEST", v.reason ?? "validation failed");
        }
        if (action.requiresConfirmation && !confirmed) {
            reply.code(403);
            return fail("CONFIRMATION_REQUIRED", "confirmation required");
        }
        const authed = req;
        // execute with timeout
        executedIds.add(executionId);
        try {
            const result = await Promise.race([
                action.execute(v.data ?? params ?? {}, { deviceId: authed.deviceId, confirmed: !!confirmed }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), action.timeoutMs)),
            ]);
            // log
            db.prepare("INSERT INTO action_logs (id, device_id, action_id, status, created_at) VALUES (?,?,?,?,?)").run(uuidv4(), authed.deviceId, actionId, result.status, new Date().toISOString());
            if (result.status === "denied") {
                reply.code(403);
            }
            return ok({ executionId, actionId, ...result });
        }
        catch (err) {
            executedIds.delete(executionId);
            reply.code(500);
            return fail("ACTION_FAILED", String(err));
        }
    });
}
//# sourceMappingURL=actions.js.map