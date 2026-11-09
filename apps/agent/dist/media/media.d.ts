import { z } from "zod";
declare const PS_SCRIPTS: Record<string, string>;
export declare function runMediaKey(scriptKey: keyof typeof PS_SCRIPTS): Promise<{
    ok: boolean;
    message: string;
}>;
export declare const mediaInputSchema: z.ZodOptional<z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>>;
export {};
//# sourceMappingURL=media.d.ts.map