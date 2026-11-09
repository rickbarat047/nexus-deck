import { getLanIp } from "../utils/network.js";
export declare function buildServer(): Promise<{
    fastify: import("fastify").FastifyInstance<import("http2").Http2SecureServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse, typeof import("http2").Http2ServerRequest, typeof import("http2").Http2ServerResponse>, import("http2").Http2ServerRequest, import("http2").Http2ServerResponse<import("http2").Http2ServerRequest>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault> & PromiseLike<import("fastify").FastifyInstance<import("http2").Http2SecureServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse, typeof import("http2").Http2ServerRequest, typeof import("http2").Http2ServerResponse>, import("http2").Http2ServerRequest, import("http2").Http2ServerResponse<import("http2").Http2ServerRequest>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>> & {
        __linterBrands: "SafePromiseLike";
    };
    host: string;
    https: boolean;
}>;
export { getLanIp };
//# sourceMappingURL=server.d.ts.map