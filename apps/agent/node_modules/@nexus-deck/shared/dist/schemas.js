import { z } from "zod";
export const apiResponseSchema = (dataSchema) => z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: z.object({ code: z.string(), message: z.string() }).nullable(),
    timestamp: z.string(),
});
export const pairingRequestSchema = z.object({
    pairingCode: z.string().min(4).max(12),
    deviceName: z.string().min(1).max(64),
});
export const deviceNameSchema = z.string().min(1).max(64);
export const applicationRegisterSchema = z.object({
    name: z.string().min(1).max(128),
    executablePath: z.string().min(1).max(1024),
    arguments: z.array(z.string().max(256)).max(32).default([]),
    iconPath: z.string().max(1024).nullable().optional(),
    category: z.string().max(64).nullable().optional(),
});
export const applicationUpdateSchema = z.object({
    name: z.string().min(1).max(128).optional(),
    arguments: z.array(z.string().max(256)).max(32).optional(),
    iconPath: z.string().max(1024).nullable().optional(),
    category: z.string().max(64).nullable().optional(),
    enabled: z.boolean().optional(),
});
export const actionExecuteSchema = z.object({
    actionId: z.string().min(1).max(64),
    executionId: z.string().uuid(),
    params: z.record(z.unknown()).optional(),
    confirmed: z.boolean().optional(),
});
export const dashboardPageCreateSchema = z.object({
    name: z.string().min(1).max(64),
});
export const dashboardButtonCreateSchema = z.object({
    pageId: z.string().min(1),
    applicationId: z.string().nullable().optional(),
    actionId: z.string().nullable().optional(),
    label: z.string().min(1).max(64),
    icon: z.string().max(256).nullable().optional(),
    color: z.string().max(32).nullable().optional(),
    position: z.number().int().min(0),
    configuration: z.record(z.unknown()).optional(),
});
export const settingsUpdateSchema = z.object({
    key: z.string().min(1).max(64),
    value: z.unknown(),
});
export const metricsSubscribeSchema = z.object({
    intervalMs: z.number().int().min(1000).max(60000).optional(),
});
export const wsClientMessageSchema = z.object({
    type: z.string().min(1).max(64),
    payload: z.unknown().optional(),
    requestId: z.string().uuid().optional(),
});
//# sourceMappingURL=schemas.js.map