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
  validate: (params: unknown) => { ok: boolean; reason?: string; data?: unknown };
  execute: (params: unknown, ctx: ActionContext) => Promise<{ status: "success" | "failed" | "denied" | "unsupported"; message: string; data?: unknown }>;
  timeoutMs: number;
}

const registry = new Map<string, ActionDefinition>();

export function registerAction(def: ActionDefinition): void {
  registry.set(def.id, def);
}

export function getAction(id: string): ActionDefinition | undefined {
  return registry.get(id);
}

export function listActions(): ActionDefinition[] {
  return Array.from(registry.values());
}