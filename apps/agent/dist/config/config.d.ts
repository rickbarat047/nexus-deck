import { z } from "zod";
declare const ConfigSchema: z.ZodObject<{
    port: z.ZodDefault<z.ZodNumber>;
    host: z.ZodDefault<z.ZodString>;
    dataDir: z.ZodDefault<z.ZodString>;
    certPath: z.ZodOptional<z.ZodString>;
    keyPath: z.ZodOptional<z.ZodString>;
    devMode: z.ZodDefault<z.ZodBoolean>;
    monitoringIntervalMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    port: number;
    host: string;
    dataDir: string;
    devMode: boolean;
    monitoringIntervalMs: number;
    certPath?: string | undefined;
    keyPath?: string | undefined;
}, {
    port?: number | undefined;
    host?: string | undefined;
    dataDir?: string | undefined;
    certPath?: string | undefined;
    keyPath?: string | undefined;
    devMode?: boolean | undefined;
    monitoringIntervalMs?: number | undefined;
}>;
export type AgentConfig = z.infer<typeof ConfigSchema>;
export declare const config: {
    port: number;
    host: string;
    dataDir: string;
    devMode: boolean;
    monitoringIntervalMs: number;
    certPath?: string | undefined;
    keyPath?: string | undefined;
};
export {};
//# sourceMappingURL=config.d.ts.map