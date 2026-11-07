import type { FastifyInstance } from "fastify";
import { ok } from "../utils/response.js";

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/api/v1/health", async () => ok({ status: "ok", version: "0.1.0" }));
}