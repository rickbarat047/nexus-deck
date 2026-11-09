import type { FastifyRequest, FastifyReply } from "fastify";
export interface AuthedRequest extends FastifyRequest {
    deviceId: string | null;
    deviceName: string | null;
}
export declare function authMiddleware(req: FastifyRequest, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=auth.d.ts.map