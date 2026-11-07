import { db } from "../database/db.js";
import { v4 as uuidv4 } from "uuid";
import type { ApplicationInfo } from "@nexus-deck/shared";

interface AppRow {
  id: string;
  name: string;
  executable_path: string;
  arguments_json: string;
  icon_path: string | null;
  category: string | null;
  enabled: number;
  source: string;
  created_at: string;
}

function rowToApp(row: AppRow): ApplicationInfo {
  return {
    id: row.id,
    name: row.name,
    executablePath: row.executable_path,
    arguments: JSON.parse(row.arguments_json || "[]"),
    iconPath: row.icon_path,
    category: row.category,
    enabled: row.enabled === 1,
    source: row.source === "discovered" ? "discovered" : "manual",
    available: true,
  };
}

export const applicationRepository = {
  list(): ApplicationInfo[] {
    const rows = db.prepare("SELECT * FROM applications ORDER BY name").all() as AppRow[];
    return rows.map(rowToApp);
  },
  get(id: string): ApplicationInfo | null {
    const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as AppRow | undefined;
    return row ? rowToApp(row) : null;
  },
  create(data: {
    name: string;
    executablePath: string;
    arguments?: string[];
    iconPath?: string | null;
    category?: string | null;
    source?: "discovered" | "manual";
  }): ApplicationInfo {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO applications (id,name,executable_path,arguments_json,icon_path,category,enabled,source,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    ).run(
      id,
      data.name,
      data.executablePath,
      JSON.stringify(data.arguments ?? []),
      data.iconPath ?? null,
      data.category ?? null,
      1,
      data.source ?? "manual",
      now,
    );
    return this.get(id)!;
  },
  update(id: string, data: Partial<{ name: string; arguments: string[]; iconPath: string | null; category: string | null; enabled: boolean }>): ApplicationInfo | null {
    const existing = this.get(id);
    if (!existing) return null;
    const fields: string[] = [];
    const vals: unknown[] = [];
    if (data.name !== undefined) { fields.push("name = ?"); vals.push(data.name); }
    if (data.arguments !== undefined) { fields.push("arguments_json = ?"); vals.push(JSON.stringify(data.arguments)); }
    if (data.iconPath !== undefined) { fields.push("icon_path = ?"); vals.push(data.iconPath); }
    if (data.category !== undefined) { fields.push("category = ?"); vals.push(data.category); }
    if (data.enabled !== undefined) { fields.push("enabled = ?"); vals.push(data.enabled ? 1 : 0); }
    if (fields.length === 0) return existing;
    vals.push(id);
    db.prepare(`UPDATE applications SET ${fields.join(", ")} WHERE id = ?`).run(...vals);
    return this.get(id);
  },
  delete(id: string): boolean {
    const r = db.prepare("DELETE FROM applications WHERE id = ?").run(id);
    return r.changes > 0;
  },
  seedDiscovered(): void {
    const count = (db.prepare("SELECT COUNT(*) as c FROM applications").get() as { c: number }).c;
    if (count > 0) return;
    // lazy import to avoid circular
  },
};