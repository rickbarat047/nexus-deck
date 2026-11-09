import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite");
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.NEXUS_DATA_DIR ?? join(process.cwd(), "agent-data");
const DB_PATH = join(DATA_DIR, "nexus.db");
mkdirSync(DATA_DIR, { recursive: true });
export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
export function getDbPath() {
    return DB_PATH;
}
//# sourceMappingURL=db.js.map