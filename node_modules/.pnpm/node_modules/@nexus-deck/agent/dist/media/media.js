import { spawn } from "node:child_process";
import { z } from "zod";
const PS_SCRIPTS = {
    play_pause: `
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'
[K]::keybd_event(0xB3,0,0,[UIntPtr]::Zero); [K]::keybd_event(0xB3,0,2,[UIntPtr]::Zero)
`,
    next: `
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'
[K]::keybd_event(0xB0,0,0,[UIntPtr]::Zero); [K]::keybd_event(0xB0,0,2,[UIntPtr]::Zero)
`,
    previous: `
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'
[K]::keybd_event(0xB1,0,0,[UIntPtr]::Zero); [K]::keybd_event(0xB1,0,2,[UIntPtr]::Zero)
`,
    volume_up: `
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'
[K]::keybd_event(0xAF,0,0,[UIntPtr]::Zero); [K]::keybd_event(0xAF,0,2,[UIntPtr]::Zero)
`,
    volume_down: `
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'
[K]::keybd_event(0xAE,0,0,[UIntPtr]::Zero); [K]::keybd_event(0xAE,0,2,[UIntPtr]::Zero)
`,
    mute: `
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'
[K]::keybd_event(0xAD,0,0,[UIntPtr]::Zero); [K]::keybd_event(0xAD,0,2,[UIntPtr]::Zero)
`,
};
export function runMediaKey(scriptKey) {
    return new Promise((resolve) => {
        const script = PS_SCRIPTS[scriptKey];
        const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
            shell: false,
            windowsHide: true,
        });
        let stderr = "";
        child.stderr?.on("data", (d) => (stderr += d.toString()));
        child.on("error", (e) => resolve({ ok: false, message: String(e) }));
        child.on("close", (code) => {
            if (code === 0)
                resolve({ ok: true, message: "ok" });
            else
                resolve({ ok: false, message: stderr || `exit ${code}` });
        });
    });
}
export const mediaInputSchema = z.object({}).strict().optional();
//# sourceMappingURL=media.js.map