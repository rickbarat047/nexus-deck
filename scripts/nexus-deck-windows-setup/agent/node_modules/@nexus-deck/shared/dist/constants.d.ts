export declare const API_VERSION = "v1";
export declare const API_PREFIX = "/api/v1";
export declare const DEFAULT_GRID_SIZE = 4;
export declare const MIN_GRID_SIZE = 2;
export declare const MAX_GRID_SIZE = 8;
export declare const PAIRING_CODE_TTL_MS: number;
export declare const ACCESS_TOKEN_BYTES = 32;
export declare const METRICS_DEFAULT_INTERVAL_MS = 2000;
export declare const METRICS_MIN_INTERVAL_MS = 1000;
export declare const ACTION_TIMEOUT_MS = 30000;
export declare const RISK_LEVELS: {
    readonly LOW: "low";
    readonly MODERATE: "moderate";
    readonly CRITICAL: "critical";
};
export declare const DEFAULT_PAGES: readonly [{
    readonly id: "home";
    readonly name: "Home";
    readonly sortOrder: 0;
}, {
    readonly id: "gaming";
    readonly name: "Gaming";
    readonly sortOrder: 1;
}, {
    readonly id: "work";
    readonly name: "Work";
    readonly sortOrder: 2;
}, {
    readonly id: "media";
    readonly name: "Media";
    readonly sortOrder: 3;
}, {
    readonly id: "system";
    readonly name: "System";
    readonly sortOrder: 4;
}, {
    readonly id: "monitor";
    readonly name: "Monitor";
    readonly sortOrder: 5;
}];
export declare const COLOR_PALETTE: {
    readonly background: "#080A0D";
    readonly secondaryBackground: "#101419";
    readonly card: "#171D23";
    readonly elevatedCard: "#202830";
    readonly primaryAccent: "#A3FF55";
    readonly secondaryAccent: "#74D936";
    readonly primaryText: "#F5F7F8";
    readonly secondaryText: "#8B949E";
    readonly danger: "#FF5555";
    readonly success: "#55DB91";
};
//# sourceMappingURL=constants.d.ts.map