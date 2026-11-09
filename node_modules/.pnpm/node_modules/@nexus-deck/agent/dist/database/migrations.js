import { db } from "./db.js";
const MIGRATIONS = [
    {
        id: 1,
        sql: `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      device_name TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen TEXT,
      revoked_at TEXT
    );
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      executable_path TEXT NOT NULL,
      arguments_json TEXT NOT NULL DEFAULT '[]',
      icon_path TEXT,
      category TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dashboard_pages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dashboard_buttons (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      application_id TEXT,
      action_id TEXT,
      label TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      configuration_json TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (page_id) REFERENCES dashboard_pages(id) ON DELETE CASCADE,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS action_logs (
      id TEXT PRIMARY KEY,
      device_id TEXT,
      action_id TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pairing_codes (
      code TEXT PRIMARY KEY,
      expires_at TEXT NOT NULL,
      consumed INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_devices_revoked ON devices(revoked_at);
    CREATE INDEX IF NOT EXISTS idx_buttons_page ON dashboard_buttons(page_id);
    CREATE INDEX IF NOT EXISTS idx_action_logs_created ON action_logs(created_at);
    `,
    },
];
export function runMigrations() {
    db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)`);
    const applied = new Set(db.prepare("SELECT id FROM schema_migrations").all().map((r) => r.id));
    for (const m of MIGRATIONS) {
        if (applied.has(m.id))
            continue;
        db.exec(m.sql);
        db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(m.id, new Date().toISOString());
    }
}
//# sourceMappingURL=migrations.js.map