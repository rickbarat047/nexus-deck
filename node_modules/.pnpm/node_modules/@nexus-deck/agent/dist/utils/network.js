import { networkInterfaces } from "node:os";
export function getLanIp() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] ?? []) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return null;
}
export function resolveBindHost(configured, devMode) {
    if (configured && configured.trim() !== "")
        return configured;
    const lan = getLanIp();
    if (lan)
        return lan;
    return devMode ? "0.0.0.0" : "127.0.0.1";
}
//# sourceMappingURL=network.js.map