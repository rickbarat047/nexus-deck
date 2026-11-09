import "dotenv/config";
import { buildServer } from "./server/server.js";
import { healthRoutes } from "./api/health.js";
import { systemRoutes } from "./api/system.js";
import { appRoutes } from "./api/apps.js";
import { actionRoutes } from "./api/actions.js";
import { pairingRoutes } from "./api/pairing.js";
import { deviceRoutes } from "./api/devices.js";
import { settingsRoutes } from "./api/settings.js";
import { websocketRoutes } from "./websocket/ws.js";
import { runMigrations } from "./database/migrations.js";
import { applicationRepository } from "./applications/repository.js";
import { discoverApplications } from "./applications/discovery.js";
import { createPairingCode } from "./pairing/pairing.js";
import "./actions/handlers.js"; // register actions
import { resolveBindHost } from "./utils/network.js";
import { logger } from "./logging/logger.js";
import { config } from "./config/config.js";
import qrcode from "qrcode-terminal";
async function main() {
    runMigrations();
    // seed discovered apps if empty
    const existing = applicationRepository.list();
    if (existing.length === 0) {
        const discovered = discoverApplications();
        for (const d of discovered) {
            applicationRepository.create({
                name: d.name,
                executablePath: d.executablePath,
                arguments: [],
                iconPath: d.iconPath,
                category: d.category,
                source: "discovered",
            });
        }
        logger.info("seeded discovered apps", { count: discovered.length });
    }
    const { fastify, host, https } = await buildServer();
    await fastify.register(healthRoutes);
    await fastify.register(systemRoutes);
    await fastify.register(appRoutes);
    await fastify.register(actionRoutes);
    await fastify.register(pairingRoutes);
    await fastify.register(deviceRoutes);
    await fastify.register(settingsRoutes);
    await fastify.register(websocketRoutes);
    const port = config.port;
    const bindHost = resolveBindHost(config.host, config.devMode);
    await fastify.listen({ port, host: bindHost });
    const protocol = https ? "https" : "http";
    const address = `${protocol}://${host}:${port}`;
    logger.info("NEXUS DECK agent started", { address, https });
    // generate pairing code for console QR
    const pc = createPairingCode();
    console.log("\n=== NEXUS DECK AGENT ===");
    console.log("Address:", address);
    console.log("Pairing code:", pc.code, "(expires", pc.expiresAt, ")");
    console.log("Scan QR or enter code in app.\n");
    try {
        qrcode.generate(JSON.stringify({ address, code: pc.code }), { small: true }, (qr) => console.log(qr));
    }
    catch (e) {
        logger.warn("qr generation failed", { error: String(e) });
    }
    const shutdown = async () => {
        logger.info("shutting down");
        await fastify.close();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map