import { spawn } from "node:child_process";
import { validateExecutablePath } from "../utils/paths.js";
import { logger } from "../logging/logger.js";
export async function launchApplication(executablePath, args = []) {
    const v = validateExecutablePath(executablePath);
    if (!v.ok || !v.resolved) {
        return { ok: false, message: v.reason ?? "invalid path" };
    }
    const resolved = v.resolved;
    const safeArgs = args.filter((a) => typeof a === "string").slice(0, 32);
    const isLnk = resolved.toLowerCase().endsWith(".lnk");
    const command = isLnk ? "explorer.exe" : resolved;
    const commandArgs = isLnk ? [resolved, ...safeArgs] : safeArgs;
    try {
        const child = spawn(command, commandArgs, {
            shell: false,
            detached: true,
            stdio: "ignore",
        });
        child.unref();
        // Shortcut (.lnk) files launch via explorer.exe, which exits (often code 1)
        // after spawning the target app asynchronously. Treat .lnk spawn as success.
        if (isLnk) {
            logger.info("launched shortcut application", { path: resolved, pid: child.pid });
            return { ok: true, message: "launched", pid: child.pid ?? 0 };
        }
        // For direct executables, give a moment to fail synchronously
        await new Promise((resolve) => setTimeout(resolve, 250));
        if (child.exitCode !== null && child.exitCode !== 0) {
            return { ok: false, message: `process exited with code ${child.exitCode}` };
        }
        logger.info("launched application", { path: resolved, pid: child.pid });
        return { ok: true, message: "launched", pid: child.pid ?? 0 };
    }
    catch (err) {
        logger.error("launch failed", { error: String(err) });
        return { ok: false, message: String(err) };
    }
}
//# sourceMappingURL=launcher.js.map