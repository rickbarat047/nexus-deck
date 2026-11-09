export const API_VERSION = "v1";
export const API_PREFIX = "/api/v1";

export const DEFAULT_GRID_SIZE = 4;
export const MIN_GRID_SIZE = 2;
export const MAX_GRID_SIZE = 8;

export const PAIRING_CODE_TTL_MS = 5 * 60 * 1000;
export const ACCESS_TOKEN_BYTES = 32;

export const METRICS_DEFAULT_INTERVAL_MS = 2000;
export const METRICS_MIN_INTERVAL_MS = 1000;

export const ACTION_TIMEOUT_MS = 30000;

export const RISK_LEVELS = {
  LOW: "low",
  MODERATE: "moderate",
  CRITICAL: "critical",
} as const;

export const DEFAULT_PAGES = [
  { id: "home", name: "Home", sortOrder: 0 },
  { id: "gaming", name: "Gaming", sortOrder: 1 },
  { id: "work", name: "Work", sortOrder: 2 },
  { id: "media", name: "Media", sortOrder: 3 },
  { id: "system", name: "System", sortOrder: 4 },
  { id: "monitor", name: "Monitor", sortOrder: 5 },
] as const;

export const COLOR_PALETTE = {
  background: "#080A0D",
  secondaryBackground: "#101419",
  card: "#171D23",
  elevatedCard: "#202830",
  primaryAccent: "#A3FF55",
  secondaryAccent: "#74D936",
  primaryText: "#F5F7F8",
  secondaryText: "#8B949E",
  danger: "#FF5555",
  success: "#55DB91",
} as const;