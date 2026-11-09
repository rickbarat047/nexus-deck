export interface DiscoveredApp {
    id: string;
    name: string;
    executablePath: string;
    iconPath: string | null;
    category: string | null;
    source: "discovered";
}
export declare function discoverApplications(): DiscoveredApp[];
//# sourceMappingURL=discovery.d.ts.map