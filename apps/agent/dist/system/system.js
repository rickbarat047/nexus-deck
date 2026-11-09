import { spawn } from "node:child_process";
export function runFixedExecutable(exe, args) {
    return new Promise((resolve) => {
        const child = spawn(exe, args, { shell: false, windowsHide: true });
        let stderr = "";
        child.stderr?.on("data", (d) => (stderr += d.toString()));
        child.on("error", (e) => resolve({ ok: false, message: String(e) }));
        child.on("close", (code) => {
            // Some tools return nonzero but still succeed; treat 0/undefined as ok
            if (code === 0 || code === null)
                resolve({ ok: true, message: "ok" });
            else
                resolve({ ok: false, message: stderr || `exit ${code}` });
        });
    });
}
export async function lockPc() {
    return runFixedExecutable("rundll32.exe", ["user32.dll,LockWorkStation"]);
}
export async function sleepPc() {
    return runFixedExecutable("rundll32.exe", ["powrprof.dll,SetSuspendState", "0,1,0"]);
}
export async function restartPc() {
    return runFixedExecutable("shutdown.exe", ["/r", "/t", "5", "/c", "NEXUS DECK restart"]);
}
export async function shutdownPc() {
    return runFixedExecutable("shutdown.exe", ["/s", "/t", "5", "/c", "NEXUS DECK shutdown"]);
}
export async function openTaskManager() {
    return runFixedExecutable("taskmgr.exe", []);
}
export async function openSettings() {
    return runFixedExecutable("explorer.exe", ["ms-settings:"]);
}
export async function openFileExplorer() {
    return runFixedExecutable("explorer.exe", []);
}
//# sourceMappingURL=system.js.map