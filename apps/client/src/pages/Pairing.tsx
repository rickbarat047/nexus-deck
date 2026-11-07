import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConnectionStore } from "../stores/connectionStore";
import { connect } from "../websocket/client";
import { Wifi, RefreshCw, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function Pairing() {
  const [address, setAddress] = useState("http://192.168.0.191:8443");
  const [code, setCode] = useState("");
  const [deviceName, setDeviceName] = useState("Nexus Phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [foundAddress, setFoundAddress] = useState<string | null>(null);
  const navigate = useNavigate();
  const setCredentials = useConnectionStore((s) => s.setCredentials);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function scanNetwork() {
    setScanning(true);
    setError(null);
    setFoundAddress(null);

    const base = "192.168.0.";
    const ports = [8443];
    const timeout = 1200;

    for (let i = 1; i < 255; i++) {
      if (!scanning) break;
      const ip = `${base}${i}`;
      for (const port of ports) {
        try {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), timeout);
          const res = await fetch(`http://${ip}:${port}/api/v1/health`, {
            signal: controller.signal,
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              setFoundAddress(`http://${ip}:${port}`);
              setAddress(`http://${ip}:${port}`);
              setScanning(false);
              return;
            }
          }
        } catch {
          // ignore - host not reachable
        }
      }
    }
    setScanning(false);
  }

  function startScan() {
    if (timerRef.current) clearInterval(timerRef.current);
    scanNetwork();
    // keep scanning in background every 10s
    timerRef.current = window.setInterval(scanNetwork, 10000);
  }

  function stopScan() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setScanning(false);
  }

  async function handlePair() {
    setLoading(true);
    setError(null);
    stopScan();
    try {
      const res = await fetch(`${address}/api/v1/pairing/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairingCode: code, deviceName }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "pairing failed");
      const data = json.data;
      setCredentials({ agentAddress: data.agentAddress, accessToken: data.accessToken, deviceId: data.deviceId });
      connect();
      navigate("/");
    } catch (e: any) {
      setLoading(false);
      setError(e.message ?? "pairing failed");
      startScan();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg p-6">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
          <Wifi size={24} className="text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-accent tracking-wide">NEXUS DECK</h1>
        <p className="text-text-secondary text-sm">Pair with your Windows PC</p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {/* PC address */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-card-elevated">
          <Wifi size={16} className="text-text-secondary" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="PC address (e.g. 192.168.0.191:8443)"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {/* Pairing code */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-card-elevated">
          <ShieldCheck size={16} className="text-text-secondary" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            placeholder="000000"
            className="flex-1 bg-transparent text-sm font-mono outline-none uppercase tracking-widest"
          />
        </div>

        {/* Device name */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-card-elevated">
          <ArrowRight size={16} className="text-text-secondary" />
          <input
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Your phone name"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {foundAddress && (
          <button
            onClick={() => setAddress(foundAddress!)}
            className="w-full py-2 text-xs text-accent bg-accent/10 rounded-lg border border-accent/20 hover:bg-accent/20 transition"
          >
            ✨ Use detected PC: {foundAddress}
          </button>
        )}

        <button
          onClick={handlePair}
          disabled={loading || !address || !code}
          className={`w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition ${loading || (!address || !code) ? "bg-card/30 text-text-secondary border border-card-elevated" : "bg-accent text-black"}`}
        >
          {loading ? "Pairing…" : "Pair & Connect"}
        </button>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-danger/10 rounded-lg border border-danger/20">
            <AlertCircle size={14} className="text-danger" />
            <span className="text-xs text-danger">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={scanning ? stopScan : startScan}
            className="flex-1 py-2 rounded-lg border border-card-elevated bg-card/30 text-xs text-text-secondary hover:bg-card/50 transition"
          >
            {scanning ? "Stop scan" : <><RefreshCw size={14} className="mr-1" /> Scan local network</>}
          </button>
          <span className="text-[10px] text-text-secondary">
            {scanning ? "Scanning…" : "Same Wi-Fi required"}
          </span>
        </div>

        <p className="text-[10px] text-text-secondary text-center">
          Make sure your PC and phone are on the same Wi-Fi. Pairing code shows on the Windows companion.
        </p>
      </div>

      {scanning && (
        <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary animate-pulse">
          <RefreshCw size={12} className="animate-spin" />
          Scanning local network for PC…
        </div>
      )}
    </div>
  );
}