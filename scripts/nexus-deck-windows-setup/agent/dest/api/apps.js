import { z } from "zod";
import { applicationRepository } from "../applications/repository.js";
import { discoverApplications } from "../applications/discovery.js";
import { authMiddleware } from "../security/auth.js";
import { ok, fail } from "../utils/response.js";
import { applicationRegisterSchema, applicationUpdateSchema } from "@nexus-deck/shared";
export async function appRoutes(fastify) {
    fastify.get("/api/v1/apps", { preHandler: authMiddleware }, async () => {
        return ok(applicationRepository.list());
    });
    fastify.post("/api/v1/apps/register", { preHandler: authMiddleware }, async (req, reply) => {
        const parsed = applicationRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            reply.code(400);
            return fail("INVALID_REQUEST", parsed.error.message);
        }
        const { name, executablePath, arguments: args, iconPath, category } = parsed.data;
        // validate path
        const { validateExecutablePath } = await import("../utils/paths.js");
        const v = validateExecutablePath(executablePath);
        if (!v.ok) {
            reply.code(400);
            return fail("PATH_INVALID", v.reason ?? "invalid path");
        }
        const app = applicationRepository.create({
            name,
            executablePath: v.resolved,
            arguments: args,
            iconPath: iconPath ?? null,
            category: category ?? null,
            source: "manual",
        });
        return ok(app);
    });
    fastify.put("/api/v1/apps/:id", { preHandler: authMiddleware }, async (req, reply) => {
        const id = req.params.id;
        const parsed = applicationUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            reply.code(400);
            return fail("INVALID_REQUEST", parsed.error.message);
        }
        const upd = {};
        if (parsed.data.name !== undefined)
            upd.name = parsed.data.name;
        if (parsed.data.arguments !== undefined)
            upd.arguments = parsed.data.arguments;
        if (parsed.data.iconPath !== undefined)
            upd.iconPath = parsed.data.iconPath;
        if (parsed.data.category !== undefined)
            upd.category = parsed.data.category;
        if (parsed.data.enabled !== undefined)
            upd.enabled = parsed.data.enabled;
        const updated = applicationRepository.update(id, upd);
        if (!updated) {
            reply.code(404);
            return fail("APP_NOT_FOUND", "application not found");
        }
        return ok(updated);
    });
    fastify.delete("/api/v1/apps/:id", { preHandler: authMiddleware }, async (req, reply) => {
        const id = req.params.id;
        const deleted = applicationRepository.delete(id);
        if (!deleted) {
            reply.code(404);
            return fail("APP_NOT_FOUND", "application not found");
        }
        return ok({ deleted: true });
    });
    // discovery trigger
    fastify.post("/api/v1/apps/discover", { preHandler: authMiddleware }, async () => {
        const discovered = discoverApplications();
        let added = 0;
        const existing = new Set(applicationRepository.list().map((a) => a.name.toLowerCase()));
        for (const d of discovered) {
            if (existing.has(d.name.toLowerCase()))
                continue;
            applicationRepository.create({
                name: d.name,
                executablePath: d.executablePath,
                arguments: [],
                iconPath: d.iconPath,
                category: d.category,
                source: "discovered",
            });
            added++;
        }
        return ok({ discovered: discovered.length, added });
    });
}
//# sourceMappingURL=apps.js.map