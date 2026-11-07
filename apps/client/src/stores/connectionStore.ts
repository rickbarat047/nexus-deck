import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConnectionStatus, SystemMetrics, SystemInfo } from "@nexus-deck/shared";

interface StoredCreds {
  agentAddress: string;
  accessToken: string;
  deviceId: string;
}

interface ConnectionStore {
  status: ConnectionStatus;
  agentAddress: string | null;
  accessToken: string | null;
  deviceId: string | null;
  deviceName: string | null;
  pcName: string | null;
  systemInfo: SystemInfo | null;
  metrics: SystemMetrics | null;
  error: string | null;
  setCredentials: (c: StoredCreds) => void;
  clearCredentials: () => void;
  setStatus: (s: ConnectionStatus) => void;
  setError: (e: string | null) => void;
  setSystemInfo: (i: SystemInfo | null) => void;
  setMetrics: (m: SystemMetrics | null) => void;
  setPcName: (n: string | null) => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set) => ({
      status: "disconnected",
      agentAddress: null,
      accessToken: null,
      deviceId: null,
      deviceName: null,
      pcName: null,
      systemInfo: null,
      metrics: null,
      error: null,
      setCredentials: (c) =>
        set({ agentAddress: c.agentAddress, accessToken: c.accessToken, deviceId: c.deviceId }),
      clearCredentials: () =>
        set({ agentAddress: null, accessToken: null, deviceId: null, deviceName: null, pcName: null, systemInfo: null, metrics: null, status: "disconnected" }),
      setStatus: (s) => set({ status: s }),
      setError: (e) => set({ error: e }),
      setSystemInfo: (i) => set({ systemInfo: i }),
      setMetrics: (m) => set({ metrics: m }),
      setPcName: (n) => set({ pcName: n }),
    }),
    { name: "nexus-connection" },
  ),
);