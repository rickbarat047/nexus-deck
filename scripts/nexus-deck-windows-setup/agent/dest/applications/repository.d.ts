import type { ApplicationInfo } from "@nexus-deck/shared";
export declare const applicationRepository: {
    list(): ApplicationInfo[];
    get(id: string): ApplicationInfo | null;
    create(data: {
        name: string;
        executablePath: string;
        arguments?: string[];
        iconPath?: string | null;
        category?: string | null;
        source?: "discovered" | "manual";
    }): ApplicationInfo;
    update(id: string, data: Partial<{
        name: string;
        arguments: string[];
        iconPath: string | null;
        category: string | null;
        enabled: boolean;
    }>): ApplicationInfo | null;
    delete(id: string): boolean;
    seedDiscovered(): void;
};
//# sourceMappingURL=repository.d.ts.map