import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../server/server.js";
import { runMigrations } from "../database/migrations.js";
import "../actions/handlers.js";

describe("health", () => {
  let fastify: any;
  beforeAll(async () => {
    process.env.NEXUS_DEV_MODE = "true";
    process.env.NEXUS_DATA_DIR = "C:/nexus/apps/agent/agent-data-test";
    runMigrations();
    const b = await buildServer();
    fastify = b.fastify;
    await fastify.register((await import("../api/health.js")).healthRoutes);
    await fastify.ready();
  });
  afterAll(async () => {
    await fastify.close();
  });
  it("returns ok", async () => {
    const res = await fastify.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ok");
  });
});