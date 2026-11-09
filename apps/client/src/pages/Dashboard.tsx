import { useDashboardStore } from "../stores/dashboardStore";
import { useConnectionStore } from "../stores/connectionStore";
import { api } from "../websocket/client";
import AppTile from "../components/buttons/AppTile";
import BottomNav from "../components/navigation/BottomNav";
import MonitorView from "../components/monitoring/MonitorView";
import { Plus, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { connect } from "../websocket/client";

export default function Dashboard() {
  const { pages, buttons, currentPageId, gridSize } = useDashboardStore();
  const status = useConnectionStore((s) => s.status);
  const pcName = useConnectionStore((s) => s.pcName);
  const addButton = useDashboardStore((s) => s.addButton);
  const removeButton = useDashboardStore((s) => s.removeButton);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [newAction, setNewAction] = useState<string | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (useConnectionStore.getState().status !== "connected") return;
    api("/api/v1/apps").then(setApps).catch(() => {});
  }, [useConnectionStore.getState().status]);

  useEffect(() => {
    if (buttons.length > 0) return;
    if (apps.length === 0) return;
    const homePage = pages.find((p) => p.id === "home");
    if (!homePage) return;
    const defaults = apps.slice(0, 6).map((a, i) => ({
      id: crypto.randomUUID(),
      pageId: homePage.id,
      applicationId: a.id,
      actionId: null,
      label: a.name,
      icon: "⚡",
      color: null,
      position: i,
      configuration: {},
    }));
    defaults.forEach((b) => addButton(b as any));
  }, [apps, buttons.length, pages, addButton]);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      connect();
      setTimeout(() => setReconnecting(false), 1500);
    } catch {
      setReconnecting(false);
    }
  };

  const pageButtons = buttons
    .filter((b) => b.pageId === currentPageId)
    .sort((a, b) => a.position - b.position);

  const cols = gridSize;

  const connectionLabel = status === "connected" ? "PC Connected" : status === "connecting" ? "Connecting…" : "Your PC is offline";
  const connectionColor = status === "connected" ? "text-success" : status === "connecting" ? "text-text-secondary" : "text-danger";

  function handleAdd() {
    if (!newLabel.trim()) return;
    const app = selectedApp ? apps.find((a) => a.id === selectedApp) : null;
    const btn = {
      id: crypto.randomUUID(),
      pageId: currentPageId,
      applicationId: selectedApp ?? null,
      actionId: selectedApp ? null : newAction,
      label: newLabel.trim() || app?.name || "App",
      icon: "⚡",
      color: null,
      position: pageButtons.length,
      configuration: {},
    };
    addButton(btn as any);
    setShowAdd(false);
    setNewLabel("");
    setSelectedApp(null);
    setNewAction(null);
  }

  return (
    <div className="flex flex-col h-screen bg-bg">
      <header className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-card-elevated">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold tracking-wide">NEXUS DECK</span>
          <span className="text-xs text-text-secondary">{pcName ?? "Your PC"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {status === "connected" ? (
            <><Wifi size={16} className="text-success mr-1" /><span className="text-success">{connectionLabel}</span></>
          ) : status === "connecting" ? (
            <><RefreshCw size={16} className="text-text-secondary animate-spin mr-1" /><span className="text-text-secondary">{connectionLabel}</span></>
          ) : (
            <><WifiOff size={16} className="text-danger mr-1" /><span className="text-danger">{connectionLabel}</span></>
          )}
          {status !== "connected" && (
            <button
              onClick={handleReconnect}
              disabled={reconnecting}
              className="ml-2 py-1 px-2 rounded-lg border border-accent/30 bg-accent/5 text-accent text-xs font-medium hover:bg-accent/10 transition"
            >
              {reconnecting ? "Trying…" : "Reconnect"}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-3">
        {currentPageId === "monitor" ? (
          <MonitorView />
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {pageButtons.map((b) => (
              <AppTile key={b.id} button={b} onRemove={() => removeButton(b.id)} />
            ))}
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center justify-center rounded-2xl bg-card/30 border border-dashed border-card-elevated aspect-square text-text-secondary hover:bg-card/50 hover:text-accent transition"
            >
              <Plus size={22} />
            </button>
          </div>
        )}
      </main>

      {showAdd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-5 w-full max-w-sm space-y-4 border border-card-elevated shadow-2xl">
            <h3 className="text-accent font-bold text-lg">Add Button</h3>

            <div className="space-y-2">
              <label className="text-xs text-text-secondary block">Name</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Chrome, Notepad, Volume Up"
                className="w-full bg-bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-text-secondary block">Pick an app or action</label>
              <div className="grid grid-cols-2 gap-2">
                {apps.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedApp(selectedApp === a.id ? null : a.id)}
                    className={`px-3 py-2 rounded-lg text-xs border ${selectedApp === a.id ? "bg-accent text-black border-accent" : "bg-bg-secondary border-card-elevated text-text-secondary hover:bg-card/50"}`}
                  >
                    {a.name}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedApp(null)}
                  className={`px-3 py-2 rounded-lg text-xs border ${!selectedApp ? "bg-accent text-black border-accent" : "bg-bg-secondary border-card-elevated text-text-secondary hover:bg-card/50"}`}
                >
                  Simple Action
                </button>
              </div>
            </div>

            {selectedApp === null && (
              <div className="space-y-2">
                <label className="text-xs text-text-secondary block">What should it do?</label>
                <select
                  value={newAction ?? ""}
                  onChange={(e) => setNewAction(e.target.value || null)}
                  className="w-full bg-bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="">Choose an action</option>
                  <option value="media_play_pause">Play / Pause Music</option>
                  <option value="media_next">Next Track</option>
                  <option value="media_previous">Previous Track</option>
                  <option value="volume_up">Volume Up</option>
                  <option value="volume_down">Volume Down</option>
                  <option value="volume_mute">Mute Sound</option>
                  <option value="lock_pc">Lock PC</option>
                  <option value="sleep_pc">Sleep PC</option>
                  <option value="open_task_manager">Open Task Manager</option>
                  <option value="open_settings">Open PC Settings</option>
                  <option value="open_file_explorer">Open File Explorer</option>
                  <option value="take_screenshot">Take Screenshot</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 rounded-lg border border-card-elevated text-text-secondary hover:bg-card/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim() || (selectedApp === null && !newAction)}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${!newLabel.trim() || (selectedApp === null && !newAction) ? "bg-card/30 text-text-secondary border border-card-elevated" : "bg-accent text-black"}`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}