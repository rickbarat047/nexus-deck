import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createPairingCode, issueDeviceToken } from "../pairing/pairing.js";
import { ok, fail } from "../utils/response.js";
import { pairingRequestSchema } from "@nexus-deck/shared";
import { getLanIp } from "../server/server.js";
import { config } from "../config/config.js";

export async function pairingRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post("/api/v1/pairing/request", async (req, reply) => {
    // no auth required; returns a fresh pairing code? Actually code generated on Windows side.
    // This endpoint allows client to request a code display? We'll just return server info.
    const ip = getLanIp();
    return ok({ address: ip, port: (fastify.server.address() as any)?.port });
  });

  fastify.post("/api/v1/pairing/confirm", async (req, reply) => {
    const parsed = pairingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400);
      return fail("INVALID_REQUEST", parsed.error.message);
    }
    const { pairingCode, deviceName } = parsed.data;
    const issued = issueDeviceToken(deviceName, pairingCode);
    if (!issued) {
      reply.code(400);
      return fail("PAIRING_EXPIRED", "pairing code invalid or expired");
    }
    const ip = getLanIp();
    const port = (fastify.server.address() as any)?.port;
    const protocol = config.devMode ? "http" : "https";
    return ok({ deviceId: issued.deviceId, accessToken: issued.accessToken, agentAddress: `${protocol}://${ip}:${port}` });
  });
}

// helper to create code via separate endpoint for Windows UI
export function createPairingCodeNow() {
  return createPairingCode();
}