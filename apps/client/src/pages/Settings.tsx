import { useConnectionStore } from "../stores/connectionStore";
import { useDashboardStore } from "../stores/dashboardStore";
import { disconnect } from "../websocket/client";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const clear = useConnectionStore((s) => s.clearCredentials);
  const reset = useDashboardStore((s) => s.resetLayout);
  const navigate = useNavigate();
  const gridSize = useDashboardStore((s) => s.gridSize);
  const setGridSize = useDashboardStore((s) => s.setGridSize);

  return (
    <div className="min-h-screen bg-bg p-4 space-y-4">
      <h1 className="text-xl font-bold text-accent">Settings</h1>
      <div className="bg-card rounded-2xl p-4 space-y-3">
        <div>
          <label className="text-sm text-text-secondary">Grid size</label>
          <input
            type="range"
            min={2}
            max={8}
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs">{gridSize} columns</span>
        </div>
        <button
          onClick={() => { reset(); }}
          className="w-full bg-card-elevated rounded-lg py-2 text-sm"
        >
          Reset layout
        </button>
        <button
          onClick={() => { clear(); disconnect(); navigate("/pair"); }}
          className="w-full bg-danger/20 text-danger rounded-lg py-2 text-sm"
        >
          Disconnect &amp; unpair
        </button>
      </div>
      <button onClick={() => navigate("/")} className="text-accent text-sm">Back to dashboard</button>
    </div>
  );
}