import { spawn } from "node:child_process";
import { z } from "zod";

const PS_SCRIPTS: Record<string, string> = {
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

export function runMediaKey(scriptKey: keyof typeof PS_SCRIPTS): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    const script = PS_SCRIPTS[scriptKey]!;
    const child: any = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      shell: false,
      windowsHide: true,
    });
    let stderr = "";
    child.stderr?.on("data", (d: any) => (stderr += d.toString()));
    child.on("error", (e: any) => resolve({ ok: false, message: String(e) }));
    child.on("close", (code: any) => {
      if (code === 0) resolve({ ok: true, message: "ok" });
      else resolve({ ok: false, message: stderr || `exit ${code}` });
    });
  });
}

export const mediaInputSchema = z.object({}).strict().optional();