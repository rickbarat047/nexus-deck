import { db } from "../database/db.js";
import { v4 as uuidv4 } from "uuid";
function rowToApp(row) {
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
    list() {
        const rows = db.prepare("SELECT * FROM applications ORDER BY name").all();
        return rows.map(rowToApp);
    },
    get(id) {
        const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(id);
        return row ? rowToApp(row) : null;
    },
    create(data) {
        const id = uuidv4();
        const now = new Date().toISOString();
        db.prepare(`INSERT INTO applications (id,name,executable_path,arguments_json,icon_path,category,enabled,source,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`).run(id, data.name, data.executablePath, JSON.stringify(data.arguments ?? []), data.iconPath ?? null, data.category ?? null, 1, data.source ?? "manual", now);
        return this.get(id);
    },
    update(id, data) {
        const existing = this.get(id);
        if (!existing)
            return null;
        const fields = [];
        const vals = [];
        if (data.name !== undefined) {
            fields.push("name = ?");
            vals.push(data.name);
        }
        if (data.arguments !== undefined) {
            fields.push("arguments_json = ?");
            vals.push(JSON.stringify(data.arguments));
        }
        if (data.iconPath !== undefined) {
            fields.push("icon_path = ?");
            vals.push(data.iconPath);
        }
        if (data.category !== undefined) {
            fields.push("category = ?");
            vals.push(data.category);
        }
        if (data.enabled !== undefined) {
            fields.push("enabled = ?");
            vals.push(data.enabled ? 1 : 0);
        }
        if (fields.length === 0)
            return existing;
        vals.push(id);
        db.prepare(`UPDATE applications SET ${fields.join(", ")} WHERE id = ?`).run(...vals);
        return this.get(id);
    },
    delete(id) {
        const r = db.prepare("DELETE FROM applications WHERE id = ?").run(id);
        return r.changes > 0;
    },
    seedDiscovered() {
        const count = db.prepare("SELECT COUNT(*) as c FROM applications").get().c;
        if (count > 0)
            return;
        // lazy import to avoid circular
    },
};
//# sourceMappingURL=repository.js.map