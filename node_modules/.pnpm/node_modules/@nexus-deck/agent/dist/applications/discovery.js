import { readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { homedir } from "node:os";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logging/logger.js";
const START_MENU_PATHS = [
    join(process.env.PROGRAMDATA ?? "C:\\ProgramData", "Microsoft", "Windows", "Start Menu", "Programs"),
    join(homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs"),
];
function walk(dir, depth = 0, out = []) {
    if (depth > 4 || !existsSync(dir))
        return out;
    let entries;
    try {
        entries = readdirSync(dir);
    }
    catch {
        return out;
    }
    for (const e of entries) {
        const full = join(dir, e);
        let st;
        try {
            st = statSync(full);
        }
        catch {
            continue;
        }
        if (st.isDirectory()) {
            walk(full, depth + 1, out);
        }
        else if (st.isFile()) {
            const ext = extname(e).toLowerCase();
            if (ext === ".lnk" || ext === ".exe")
                out.push(full);
        }
    }
    return out;
}
export function discoverApplications() {
    const found = [];
    const seen = new Set();
    for (const base of START_MENU_PATHS) {
        const files = walk(base);
        for (const f of files) {
            const name = basename(f, extname(f));
            if (seen.has(name.toLowerCase()))
                continue;
            seen.add(name.toLowerCase());
            found.push({
                id: uuidv4(),
                name,
                executablePath: f,
                iconPath: null,
                category: null,
                source: "discovered",
            });
        }
    }
    logger.info("discovered applications", { count: found.length });
    return found;
}
//# sourceMappingURL=discovery.js.map