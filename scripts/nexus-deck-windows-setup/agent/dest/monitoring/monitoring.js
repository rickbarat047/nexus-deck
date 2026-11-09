import si from "systeminformation";
import { logger } from "../logging/logger.js";
let lastNet = null;
export async function collectMetrics() {
    const [cpuLoad, cpuTemp, mem, fsSize, netStats, graphics] = await Promise.allSettled([
        si.currentLoad(),
        si.cpuTemperature(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.graphics(),
    ]);
    // CPU
    const cpuUtil = cpuLoad.status === "fulfilled" ? cpuLoad.value.currentLoad : null;
    let cpuTempC = null;
    let cpuTempSupported = false;
    let cpuTempReason = "not available";
    if (cpuTemp.status === "fulfilled") {
        const t = cpuTemp.value.main;
        if (typeof t === "number" && !Number.isNaN(t) && t > 0) {
            cpuTempC = t;
            cpuTempSupported = true;
            cpuTempReason = null;
        }
        else {
            cpuTempReason = "sensor not reported";
        }
    }
    else {
        cpuTempReason = cpuTemp.reason ? String(cpuTemp.reason) : "error";
    }
    const cpu = {
        utilization: cpuUtil !== null ? Math.round((cpuUtil ?? 0) * 10) / 10 : null,
        temperatureC: cpuTempC,
        temperatureSupported: cpuTempSupported,
        temperatureReason: cpuTempReason,
    };
    // GPU
    let gpu = { name: null, utilization: null, temperatureC: null, supported: false, reason: "not available" };
    if (graphics.status === "fulfilled") {
        const g = graphics.value.controllers?.[0];
        if (g) {
            gpu = {
                name: g.model ?? null,
                utilization: typeof g.utilizationGpu === "number" ? g.utilizationGpu : null,
                temperatureC: typeof g.temperatureGpu === "number" ? g.temperatureGpu : null,
                supported: true,
                reason: null,
            };
            if (gpu.utilization === null && gpu.temperatureC === null) {
                gpu.reason = "metrics not reported by driver";
            }
        }
        else {
            gpu.reason = "no GPU controller found";
        }
    }
    else {
        gpu.reason = graphics.reason ? String(graphics.reason) : "error";
    }
    // Memory
    const memData = mem.status === "fulfilled" ? mem.value : null;
    const memory = {
        usedBytes: memData?.used ?? 0,
        totalBytes: memData?.total ?? 0,
        utilization: memData && memData.total > 0 ? Math.round((memData.used / memData.total) * 1000) / 10 : 0,
    };
    // Disks
    const disks = [];
    if (fsSize.status === "fulfilled") {
        for (const d of fsSize.value) {
            if (!d.size)
                continue;
            disks.push({
                mount: d.mount || d.fs,
                usedBytes: d.used,
                totalBytes: d.size,
                utilization: Math.round(d.use * 10) / 10,
            });
        }
    }
    // Network
    let network = { downloadBytesPerSec: null, uploadBytesPerSec: null, supported: false, reason: "not available" };
    if (netStats.status === "fulfilled" && netStats.value.length > 0) {
        const s = netStats.value[0];
        const now = Date.now();
        if (lastNet) {
            const dt = (now - lastNet.ts) / 1000;
            if (dt > 0) {
                network = {
                    downloadBytesPerSec: Math.max(0, (s.rx_bytes - lastNet.rx) / dt),
                    uploadBytesPerSec: Math.max(0, (s.tx_bytes - lastNet.tx) / dt),
                    supported: true,
                    reason: null,
                };
            }
        }
        lastNet = { rx: s.rx_bytes, tx: s.tx_bytes, ts: now };
        if (!network.supported) {
            network.reason = "collecting baseline";
        }
    }
    else if (netStats.status === "rejected") {
        network.reason = netStats.reason ? String(netStats.reason) : "error";
    }
    return {
        cpu,
        gpu,
        memory,
        disks,
        network,
        timestamp: new Date().toISOString(),
    };
}
//# sourceMappingURL=monitoring.js.map