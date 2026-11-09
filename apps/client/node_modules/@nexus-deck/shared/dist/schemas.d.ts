import { z } from "zod";
export declare const apiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodNullable<T>;
    error: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
    }, {
        code: string;
        message: string;
    }>>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodNullable<T>;
    error: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
    }, {
        code: string;
        message: string;
    }>>;
    timestamp: z.ZodString;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodNullable<T>;
    error: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
    }, {
        code: string;
        message: string;
    }>>;
    timestamp: z.ZodString;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const pairingRequestSchema: z.ZodObject<{
    pairingCode: z.ZodString;
    deviceName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pairingCode: string;
    deviceName: string;
}, {
    pairingCode: string;
    deviceName: string;
}>;
export declare const deviceNameSchema: z.ZodString;
export declare const applicationRegisterSchema: z.ZodObject<{
    name: z.ZodString;
    executablePath: z.ZodString;
    arguments: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    iconPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    executablePath: string;
    arguments: string[];
    iconPath?: string | null | undefined;
    category?: string | null | undefined;
}, {
    name: string;
    executablePath: string;
    arguments?: string[] | undefined;
    iconPath?: string | null | undefined;
    category?: string | null | undefined;
}>;
export declare const applicationUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    arguments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    iconPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    arguments?: string[] | undefined;
    iconPath?: string | null | undefined;
    category?: string | null | undefined;
    enabled?: boolean | undefined;
}, {
    name?: string | undefined;
    arguments?: string[] | undefined;
    iconPath?: string | null | undefined;
    category?: string | null | undefined;
    enabled?: boolean | undefined;
}>;
export declare const actionExecuteSchema: z.ZodObject<{
    actionId: z.ZodString;
    executionId: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    confirmed: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    actionId: string;
    executionId: string;
    params?: Record<string, unknown> | undefined;
    confirmed?: boolean | undefined;
}, {
    actionId: string;
    executionId: string;
    params?: Record<string, unknown> | undefined;
    confirmed?: boolean | undefined;
}>;
export declare const dashboardPageCreateSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const dashboardButtonCreateSchema: z.ZodObject<{
    pageId: z.ZodString;
    applicationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    label: z.ZodString;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    position: z.ZodNumber;
    configuration: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    pageId: string;
    label: string;
    position: number;
    actionId?: string | null | undefined;
    applicationId?: string | null | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    configuration?: Record<string, unknown> | undefined;
}, {
    pageId: string;
    label: string;
    position: number;
    actionId?: string | null | undefined;
    applicationId?: string | null | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    configuration?: Record<string, unknown> | undefined;
}>;
export declare const settingsUpdateSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    key: string;
    value?: unknown;
}, {
    key: string;
    value?: unknown;
}>;
export declare const metricsSubscribeSchema: z.ZodObject<{
    intervalMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    intervalMs?: number | undefined;
}, {
    intervalMs?: number | undefined;
}>;
export declare const wsClientMessageSchema: z.ZodObject<{
    type: z.ZodString;
    payload: z.ZodOptional<z.ZodUnknown>;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    payload?: unknown;
    requestId?: string | undefined;
}, {
    type: string;
    payload?: unknown;
    requestId?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map