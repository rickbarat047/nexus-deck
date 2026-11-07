import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyDeviceToken } from "../pairing/pairing.js";

export interface AuthedRequest extends FastifyRequest {
  deviceId: string | null;
  deviceName: string | null;
}

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    reply.code(401).send({ success: false, data: null, error: { code: "INVALID_TOKEN", message: "missing token" }, timestamp: new Date().toISOString() });
    return;
  }
  const token = header.slice(7);
  const device = verifyDeviceToken(token);
  if (!device) {
    reply.code(401).send({ success: false, data: null, error: { code: "INVALID_TOKEN", message: "invalid or revoked token" }, timestamp: new Date().toISOString() });
    return;
  }
  (req as AuthedRequest).deviceId = device.id;
  (req as AuthedRequest).deviceName = device.deviceName;
}