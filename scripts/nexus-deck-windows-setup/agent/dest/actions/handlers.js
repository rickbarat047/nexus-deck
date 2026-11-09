import { z } from "zod";
import { registerAction } from "./registry.js";
import { runMediaKey } from "../media/media.js";
import * as sys from "../system/system.js";
import { launchApplication } from "../applications/launcher.js";
import { spawn } from "node:child_process";
import { applicationRepository } from "../applications/repository.js";
import { logger } from "../logging/logger.js";
const ok = (message, data) => ({ status: "success", message, data });
const fail = (message) => ({ status: "failed", message });
// launch_application
registerAction({
    id: "launch_application",
    description: "Launch a registered application",
    riskLevel: "low",
    requiresConfirmation: false,
    inputSchema: z.object({ applicationId: z.string().min(1) }),
    validate: (p) => {
        const r = z.object({ applicationId: z.string().min(1) }).safeParse(p);
        if (!r.success)
            return { ok: false, reason: "invalid params" };
        const app = applicationRepository.get(r.data.applicationId);
        if (!app)
            return { ok: false, reason: "app not found" };
        if (!app.enabled)
            return { ok: false, reason: "app disabled" };
        return { ok: true, data: r.data };
    },
    execute: async (p) => {
        const { applicationId } = p;
        const app = applicationRepository.get(applicationId);
        const res = await launchApplication(app.executablePath, app.arguments);
        if (!res.ok)
            return fail(res.message);
        return ok(res.message, { pid: res.pid });
    },
    timeoutMs: 30000,
});
// media
for (const [id, key] of [
    ["media_play_pause", "play_pause"],
    ["media_next", "next"],
    ["media_previous", "previous"],
    ["volume_up", "volume_up"],
    ["volume_down", "volume_down"],
    ["volume_mute", "mute"],
]) {
    registerAction({
        id,
        description: id,
        riskLevel: "low",
        requiresConfirmation: false,
        inputSchema: z.object({}).optional(),
        validate: () => ({ ok: true, data: {} }),
        execute: async () => {
            const r = await runMediaKey(key);
            return r.ok ? ok(r.message) : fail(r.message);
        },
        timeoutMs: 10000,
    });
}
// system moderate
registerAction({
    id: "sleep_pc",
    description: "Sleep the PC",
    riskLevel: "moderate",
    requiresConfirmation: true,
    inputSchema: z.object({}).optional(),
    validate: () => ({ ok: true, data: {} }),
    execute: async (_p, ctx) => {
        if (!ctx.confirmed)
            return { status: "denied", message: "confirmation required" };
        const r = await sys.sleepPc();
        return r.ok ? ok(r.message) : fail(r.message);
    },
    timeoutMs: 15000,
});
registerAction({
    id: "open_task_manager",
    description: "Open Task Manager",
    riskLevel: "low",
    requiresConfirmation: false,
    inputSchema: z.object({}).optional(),
    validate: () => ({ ok: true, data: {} }),
    execute: async () => {
        const r = await sys.openTaskManager();
        return r.ok ? ok(r.message) : fail(r.message);
    },
    timeoutMs: 10000,
});
registerAction({
    id: "open_settings",
    description: "Open Windows Settings",
    riskLevel: "low",
    requiresConfirmation: false,
    inputSchema: z.object({}).optional(),
    validate: () => ({ ok: true, data: {} }),
    execute: async () => {
        const r = await sys.openSettings();
        return r.ok ? ok(r.message) : fail(r.message);
    },
    timeoutMs: 10000,
});
registerAction({
    id: "open_file_explorer",
    description: "Open File Explorer",
    riskLevel: "low",
    requiresConfirmation: false,
    inputSchema: z.object({}).optional(),
    validate: () => ({ ok: true, data: {} }),
    execute: async () => {
        const r = await sys.openFileExplorer();
        return r.ok ? ok(r.message) : fail(r.message);
    },
    timeoutMs: 10000,
});
registerAction({
    id: "lock_pc",
    description: "Lock the PC",
    riskLevel: "low",
    requiresConfirmation: false,
    inputSchema: z.object({}).optional(),
    validate: () => ({ ok: true, data: {} }),
    execute: async () => {
        const r = await sys.lockPc();
        return r.ok ? ok(r.message) : fail(r.message);
    },
    timeoutMs: 10000,
});
// critical
for (const [id, fn] of [
    ["restart_pc", sys.restartPc],
    ["shutdown_pc", sys.shutdownPc],
]) {
    registerAction({
        id,
        description: id,
        riskLevel: "critical",
        requiresConfirmation: true,
        inputSchema: z.object({}).optional(),
        validate: () => ({ ok: true, data: {} }),
        execute: async (_p, ctx) => {
            if (!ctx.confirmed)
                return { status: "denied", message: "confirmation required" };
            const r = await fn();
            return r.ok ? ok(r.message) : fail(r.message);
        },
        timeoutMs: 15000,
    });
}
// screenshot
registerAction({
    id: "take_screenshot",
    description: "Capture a screenshot",
    riskLevel: "moderate",
    requiresConfirmation: false,
    inputSchema: z.object({}).optional(),
    validate: () => ({ ok: true, data: {} }),
    execute: async () => {
        const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$dir = [Environment]::GetFolderPath('MyPictures')
$path = Join-Path $dir ("nexus-screenshot-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".png")
$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output $path
`;
        return new Promise((resolve) => {
            const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { shell: false, windowsHide: true });
            let out = "";
            let err = "";
            child.stdout?.on("data", (d) => (out += d.toString()));
            child.stderr?.on("data", (d) => (err += d.toString()));
            child.on("error", (e) => resolve(fail(String(e))));
            child.on("close", (code) => {
                if (code === 0)
                    resolve(ok("screenshot saved", { path: out.trim() }));
                else
                    resolve(fail(err || `exit ${code}`));
            });
        });
    },
    timeoutMs: 20000,
});
logger.info("actions registered", { count: 0 });
//# sourceMappingURL=handlers.js.map