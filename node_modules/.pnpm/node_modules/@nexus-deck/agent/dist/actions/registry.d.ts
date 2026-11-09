import { z } from "zod";
import type { RiskLevel } from "@nexus-deck/shared";
export interface ActionContext {
    deviceId: string | null;
    confirmed: boolean;
}
export interface ActionDefinition {
    id: string;
    description: string;
    riskLevel: RiskLevel;
    requiresConfirmation: boolean;
    inputSchema: z.ZodTypeAny;
    validate: (params: unknown) => {
        ok: boolean;
        reason?: string;
        data?: unknown;
    };
    execute: (params: unknown, ctx: ActionContext) => Promise<{
        status: "success" | "failed" | "denied" | "unsupported";
        message: string;
        data?: unknown;
    }>;
    timeoutMs: number;
}
export declare function registerAction(def: ActionDefinition): void;
export declare function getAction(id: string): ActionDefinition | undefined;
export declare function listActions(): ActionDefinition[];
//# sourceMappingURL=registry.d.ts.map