import { db } from "../database/db.js";
import { generatePairingCode, generateAccessToken, hashToken, verifyToken } from "../security/tokens.js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logging/logger.js";
import { PAIRING_CODE_TTL_MS } from "@nexus-deck/shared";

export interface PairingCodeRecord {
  code: string;
  expiresAt: string;
}

export function createPairingCode(): PairingCodeRecord {
  const code = generatePairingCode();
  const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS).toISOString();
  db.prepare("INSERT INTO pairing_codes (code, expires_at, consumed) VALUES (?,?,0)").run(code, expiresAt);
  logger.info("pairing code created", { expiresAt });
  return { code, expiresAt };
}

export function validatePairingCode(code: string): boolean {
  const row = db.prepare("SELECT * FROM pairing_codes WHERE code = ?").get(code) as
    | { code: string; expires_at: string; consumed: number }
    | undefined;
  if (!row) return false;
  if (row.consumed === 1) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  return true;
}

export function consumePairingCode(code: string): void {
  db.prepare("UPDATE pairing_codes SET consumed = 1 WHERE code = ?").run(code);
}

export function issueDeviceToken(deviceName: string, code: string): { deviceId: string; accessToken: string } | null {
  if (!validatePairingCode(code)) return null;
  consumePairingCode(code);
  const deviceId = uuidv4();
  const accessToken = generateAccessToken();
  const tokenHash = hashToken(accessToken);
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO devices (id, device_name, token_hash, created_at, last_seen, revoked_at) VALUES (?,?,?,?,?,?)",
  ).run(deviceId, deviceName, tokenHash, now, now, null);
  logger.info("device paired", { deviceId, deviceName });
  return { deviceId, accessToken };
}

export function verifyDeviceToken(token: string): { id: string; deviceName: string } | null {
  const rows = db.prepare("SELECT id, device_name, token_hash, revoked_at FROM devices").all() as Array<{
    id: string;
    device_name: string;
    token_hash: string;
    revoked_at: string | null;
  }>;
  for (const r of rows) {
    if (r.revoked_at) continue;
    if (verifyToken(token, r.token_hash)) {
      db.prepare("UPDATE devices SET last_seen = ? WHERE id = ?").run(new Date().toISOString(), r.id);
      return { id: r.id, deviceName: r.device_name };
    }
  }
  return null;
}

export function revokeDevice(id: string): boolean {
  const r = db.prepare("UPDATE devices SET revoked_at = ? WHERE id = ?").run(new Date().toISOString(), id);
  return r.changes > 0;
}

export function listDevices() {
  return db
    .prepare("SELECT id, device_name, created_at, last_seen, revoked_at FROM devices ORDER BY created_at DESC")
    .all() as Array<{ id: string; device_name: string; created_at: string; last_seen: string | null; revoked_at: string | null }>;
}