// Shared types for NEXUS DECK

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type RiskLevel = "low" | "moderate" | "critical";

export type ActionStatus = "idle" | "running" | "success" | "failed";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  timestamp: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  createdAt: string;
  lastSeen: string | null;
  revokedAt: string | null;
}

export interface ApplicationInfo {
  id: string;
  name: string;
  executablePath: string;
  arguments: string[];
  iconPath: string | null;
  category: string | null;
  enabled: boolean;
  source: "discovered" | "manual";
  available: boolean;
}

export interface DashboardButton {
  id: string;
  pageId: string;
  applicationId: string | null;
  actionId: string | null;
  label: string;
  icon: string | null;
  color: string | null;
  position: number;
  configuration: Record<string, unknown>;
}

export interface DashboardPage {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpuModel: string;
  totalMemoryBytes: number;
  agentVersion: string;
}

export interface CpuMetrics {
  utilization: number | null;
  temperatureC: number | null;
  temperatureSupported: boolean;
  temperatureReason: string | null;
}

export interface GpuMetrics {
  name: string | null;
  utilization: number | null;
  temperatureC: number | null;
  supported: boolean;
  reason: string | null;
}

export interface MemoryMetrics {
  usedBytes: number;
  totalBytes: number;
  utilization: number;
}

export interface DiskMetrics {
  mount: string;
  usedBytes: number;
  totalBytes: number;
  utilization: number;
}

export interface NetworkMetrics {
  downloadBytesPerSec: number | null;
  uploadBytesPerSec: number | null;
  supported: boolean;
  reason: string | null;
}

export interface SystemMetrics {
  cpu: CpuMetrics;
  gpu: GpuMetrics;
  memory: MemoryMetrics;
  disks: DiskMetrics[];
  network: NetworkMetrics;
  timestamp: string;
}

export interface PairingRequest {
  pairingCode: string;
  deviceName: string;
}

export interface PairingConfirmResponse {
  deviceId: string;
  accessToken: string;
  agentAddress: string;
}

export interface ActionDefinition {
  id: string;
  description: string;
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
}

export interface ActionExecutionRequest {
  actionId: string;
  executionId: string;
  params?: Record<string, unknown>;
  confirmed?: boolean;
}

export interface ActionExecutionResult {
  executionId: string;
  actionId: string;
  status: "success" | "failed" | "denied" | "unsupported";
  message: string;
  data?: unknown;
}

export interface WsClientMessage {
  type: string;
  payload?: unknown;
  requestId?: string;
}

export interface WsServerMessage {
  type: string;
  payload?: unknown;
  requestId?: string;
  timestamp: string;
}