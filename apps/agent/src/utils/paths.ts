import { existsSync } from "node:fs";
import { isAbsolute, resolve, normalize } from "node:path";

export function validateExecutablePath(p: string): { ok: boolean; reason?: string; resolved?: string } {
  if (typeof p !== "string" || p.length === 0 || p.length > 1024) {
    return { ok: false, reason: "invalid length" };
  }
  if (!isAbsolute(p)) {
    return { ok: false, reason: "path must be absolute" };
  }
  const resolved = normalize(resolve(p));
  // Block traversal attempts
  if (resolved.includes("..")) {
    return { ok: false, reason: "path traversal not allowed" };
  }
  if (!existsSync(resolved)) {
    return { ok: false, reason: "target does not exist" };
  }
  return { ok: true, resolved };
}

export function isAllowedExtension(p: string): boolean {
  const lower = p.toLowerCase();
  return lower.endsWith(".exe") || lower.endsWith(".lnk") || lower.endsWith(".bat") || lower.endsWith(".cmd");
}