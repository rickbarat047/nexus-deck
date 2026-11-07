import { networkInterfaces } from "node:os";

export function getLanIp(): string | null {
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

export function resolveBindHost(configured: string, devMode: boolean): string {
  if (configured && configured.trim() !== "") return configured;
  const lan = getLanIp();
  if (lan) return lan;
  return devMode ? "0.0.0.0" : "127.0.0.1";
}