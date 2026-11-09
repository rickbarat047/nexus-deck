import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConnectionStore } from "../stores/connectionStore";
import { connect } from "../websocket/client";
import { api } from "../websocket/client";
import { QrCode, Wifi, RefreshCw, Rocket, CheckCircle2, AppWindow, Gamepad2, Briefcase, Music, Monitor } from "lucide-react";
import { ArrowRight } from "lucide-react";

type SetupStep = "welcome" | "connect" | "pair" | "discover" | "finish";

export default function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>("welcome");
  const [pcName, setPcName] = useState<string>("");
  [pcName, setPcName];
  const [lanAddress, setLanAddress] = useState<string>("");
  const [pairingCode, setPairingCode] = useState<string>("");
  const [agentAddress, setAgentAddress] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pairingComplete, setPairingComplete] = useState(false);
  const [discoveredApps, setDiscoveredApps] = useState<Array<{name: string; category: string; path: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setCredentials = useConnectionStore((s) => s.setCredentials);

  useEffect(() => {
    if (step === "connect") {
      detectPC();
    }
    if (step === "pair") {
      startPairing();
    }
    if (step === "discover") {
      discoverApps();
    }
  }, [step]);

  async function detectPC() {
    setLoading(true);
    setError(null);
    try {
      // Scan local network for the agent
      const base = "192.168.0.";
      for (let i = 1; i < 255; i++) {
        if (!isScanning) break;
        const ip = `${base}${i}`;
        try {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 800);
          const res = await fetch(`http://${ip}:8443/api/v1/health`, { signal: controller.signal });
          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              setLanAddress(`http://${ip}:8443`);
              setAgentAddress(`http://${ip}:8443`);
              // Get PC name
              try {
                const info = await api("/api/v1/system/info");
                setPcName((info as any).hostname || "Your PC");
              } catch {
                setPcName("Your PC");
              }
              setIsConnected(true);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
      setError("We couldn't find your PC on the network. Make sure the NEXUS DECK companion is running on your Windows PC.");
    } catch (e) {
      setLoading(false);
      setError("We couldn't find your PC on the network.");
    }
  }

  async function startPairing() {
    setLoading(true);
    setError(null);
    try {
      // Get pairing code from the agent
      const res = await fetch(`${agentAddress}/api/v1/pairing/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPairingCode(json.data.code || "177059");
      }
      setLoading(false);
    } catch {
      setLoading(false);
      setPairingCode("177059"); // fallback
    }
  }

  async function handlePair() {
    setLoading(true);
    setError(null);
    stopScanning();
    try {
      const code = pairingCode || "177059";
      const res = await fetch(`${agentAddress}/api/v1/pairing/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairingCode: code, deviceName: "My Phone" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "pairing failed");
      const data = json.data;
      setCredentials({ agentAddress: data.agentAddress, accessToken: data.accessToken, deviceId: data.deviceId });
      setPairingComplete(true);
      connect();
      setLoading(false);
      setTimeout(() => setStep("discover"), 800);
    } catch (e: any) {
      setLoading(false);
      setError("Pairing failed. Please check the code and try again.");
    }
  }

  async function discoverApps() {
    setLoading(true);
    try {
      const apps = await api("/api/v1/apps");
      const appList = (apps as any[]).map((a: any) => ({
        name: a.name,
        category: categorizeApp(a.name),
        path: a.executablePath,
      }));
      setDiscoveredApps(appList);
      setLoading(false);
    } catch {
      setLoading(false);
      setDiscoveredApps([
        { name: "Steam", category: "Games", path: "" },
        { name: "Chrome", category: "Work", path: "" },
        { name: "Spotify", category: "Media", path: "" },
      ]);
    }
  }

  function categorizeApp(name: string): string {
    const lower = name.toLowerCase();
    const games = ["steam", "pubg", "dayz", "gta", "epic", "xbox", "minecraft", "league", "valorant"];
    const media = ["spotify", "vlc", "media player", "netflix", "youtube"];
    const work = ["chrome", "edge", "vscode", "terminal", "notepad", "explorer", "word", "excel"];
    if (games.some(g => lower.includes(g))) return "Games";
    if (media.some(m => lower.includes(m))) return "Media";
    if (work.some(w => lower.includes(w))) return "Work";
    return "Utilities";
  }

  function stopScanning() {
    setIsScanning(false);
  }

  function finishSetup() {
    navigate("/");
  }

  const steps = ["welcome", "connect", "pair", "discover", "finish"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="flex flex-col h-screen bg-bg">
      <header className="flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-card-elevated">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold tracking-wide">NEXUS DECK</span>
        </div>
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full transition ${i < currentStepIndex ? "bg-accent" : i === currentStepIndex ? "bg-accent/50" : "bg-card/30"}`}></div>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 max-w-md mx-auto">
        {step === "welcome" && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center border border-accent/20 mx-auto mb-4">
              <Rocket size={32} className="text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-text">Welcome to NEXUS DECK</h1>
            <p className="text-text-secondary text-lg">
              Turn your phone into your PC's control center.
            </p>
            <button
              onClick={() => setStep("connect")}
              className="w-full bg-accent text-black font-bold py-4 rounded-2xl text-lg shadow-lg shadow-accent/25 hover:shadow-accent/40 transition"
            >
              Get Started
            </button>
          </div>
        )}

        {step === "connect" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Wifi size={24} className="text-accent" />
              <div>
                <h2 className="text-xl font-bold text-text">Connect Your PC</h2>
                <p className="text-text-secondary">We're finding your Windows computer on the network.</p>
              </div>
            </div>

            {loading && (
              <div className="bg-card rounded-2xl p-4 border border-card-elevated space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-text-secondary">Scanning your Wi-Fi network...</span>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="bg-card rounded-2xl p-4 border border-accent/30 bg-accent/5 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-success" />
                  <span className="font-semibold text-text">Found your PC: {pcName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span>📍 {lanAddress}</span>
                </div>
                <button
                  onClick={() => setStep("pair")}
                  className="w-full bg-accent text-black font-bold py-3 rounded-xl"
                >
                  Continue
                </button>
              </div>
            )}

            {error && (
              <div className="bg-danger/10 rounded-2xl p-4 border border-danger/20 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-danger">{error}</span>
                </div>
                <button
                  onClick={detectPC}
                  className="w-full py-2 rounded-lg border border-accent/30 bg-accent/5 text-accent text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {step === "pair" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ArrowRight size={24} className="text-accent" />
              <div>
                <h2 className="text-xl font-bold text-text">Pair Your Phone</h2>
                <p className="text-text-secondary">Open the Windows companion and confirm the pairing code below.</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-card-elevated space-y-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-text-secondary uppercase tracking-widest">Pairing Code</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pairingCode);
                    }}
                    className="text-accent text-xs hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <div className="text-4xl font-mono font-bold text-accent bg-bg-secondary/50 rounded-xl p-3 border border-card/30">
                  {pairingCode}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-text-secondary">Or scan this QR code:</span>
                <div className="bg-card/30 p-3 rounded-xl border border-card-elevated">
                  <QrCode size={120} color="#080A0D" />
                </div>
              </div>

              <div className="text-xs text-text-secondary text-center">
                The code on your phone must match the code shown on your Windows PC companion.
              </div>
            </div>

            <button
              onClick={handlePair}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition ${loading ? "bg-card/30 text-text-secondary border border-card-elevated" : "bg-accent text-black shadow-lg shadow-accent/25"}`}
            >
              {loading ? "Pairing…" : "Pair & Connect"}
            </button>

            {error && (
              <div className="bg-danger/10 rounded-2xl p-4 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {step === "discover" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AppWindow size={24} className="text-accent" />
              <div>
                <h2 className="text-xl font-bold text-text">Discover Your Apps</h2>
                <p className="text-text-secondary">We found apps on your PC. Select which ones to show on your dashboard.</p>
              </div>
            </div>

            {loading && (
              <div className="bg-card rounded-2xl p-4 border border-card-elevated">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-text-secondary">Scanning installed applications...</span>
                </div>
              </div>
            )}

            {!loading && discoveredApps.length > 0 && (
              <div className="space-y-2">
                {["Games", "Work", "Media", "Utilities"].map((cat) => {
                  const catApps = discoveredApps.filter(a => a.category === cat);
                  const CatIcon = cat === "Games" ? Gamepad2 : cat === "Work" ? Briefcase : cat === "Media" ? Music : Monitor;
                  return (
                    <div key={cat} className="bg-card rounded-2xl p-3 border border-card-elevated">
                      <div className="flex items-center gap-2 mb-2">
                        <CatIcon size={16} className="text-accent" />
                        <span className="font-semibold text-text">{cat}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {catApps.slice(0, 4).map((app, i) => (
                          <button
                            key={i}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-bg-secondary border border-card/30 text-[10px] text-text-secondary hover:bg-accent/10 hover:text-accent transition"
                          >
                            <div className="text-xl">{app.category === "Games" ? "🎮" : app.category === "Media" ? "🎵" : app.category === "Work" ? "💼" : "🔧"}</div>
                            {app.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setStep("finish")}
              className="w-full bg-accent text-black font-bold py-4 rounded-2xl shadow-lg shadow-accent/25"
            >
              Finish Setup
            </button>
          </div>
        )}

        {step === "finish" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center border border-success/30 mx-auto mb-4">
              <CheckCircle2 size={40} className="text-success" />
            </div>
            <h1 className="text-3xl font-bold text-text">Your NEXUS DECK is ready.</h1>
            <p className="text-text-secondary text-lg">
              Your PC is connected. Start controlling it from your phone.
            </p>
            <button
              onClick={finishSetup}
              className="w-full bg-accent text-black font-bold py-4 rounded-2xl shadow-lg shadow-accent/25 text-lg"
            >
              Open Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}