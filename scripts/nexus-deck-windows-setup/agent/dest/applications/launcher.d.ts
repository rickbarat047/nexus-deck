export interface LaunchResult {
    ok: boolean;
    message: string;
    pid?: number;
}
export declare function launchApplication(executablePath: string, args?: string[]): Promise<LaunchResult>;
//# sourceMappingURL=launcher.d.ts.map