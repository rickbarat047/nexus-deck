import { z } from "zod";
const ConfigSchema = z.object({
    port: z.number().int().min(1).max(65535).default(8443),
    host: z.string().default(""),
    dataDir: z.string().default(process.cwd()),
    certPath: z.string().optional(),
    keyPath: z.string().optional(),
    devMode: z.boolean().default(false),
    monitoringIntervalMs: z.number().int().min(1000).max(60000).default(2000),
});
function loadConfig() {
    return ConfigSchema.parse({
        port: process.env.NEXUS_PORT ? Number(process.env.NEXUS_PORT) : undefined,
        host: process.env.NEXUS_HOST,
        dataDir: process.env.NEXUS_DATA_DIR,
        certPath: process.env.NEXUS_CERT_PATH,
        keyPath: process.env.NEXUS_KEY_PATH,
        devMode: process.env.NEXUS_DEV_MODE === "true",
        monitoringIntervalMs: process.env.NEXUS_MONITORING_INTERVAL ? Number(process.env.NEXUS_MONITORING_INTERVAL) : undefined,
    });
}
export const config = loadConfig();
//# sourceMappingURL=config.js.map