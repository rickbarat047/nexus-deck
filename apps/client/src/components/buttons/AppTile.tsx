import { motion } from "framer-motion";
import { useConnectionStore } from "../../stores/connectionStore";
import { sendLaunch, sendAction } from "../../websocket/client";
import { useState } from "react";
import type { DashboardButton } from "@nexus-deck/shared";

interface Props {
  button: DashboardButton;
  onRemove?: () => void;
}

export default function AppTile({ button, onRemove }: Props) {
  const status = useConnectionStore((s) => s.status);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = status !== "connected";
  const isCritical = button.actionId === "restart_pc" || button.actionId === "shutdown_pc";

  async function handlePress(e: React.MouseEvent) {
    if (disabled || running) return;
    if (isCritical && button.actionId && !window.confirm(`Are you sure you want to ${button.actionId.replace("_", " ")} your PC?`)) {
      setRunning(false);
      return;
    }
    setRunning(true);
    setError(null);
    try {
      if (button.applicationId) {
        sendLaunch(button.applicationId);
        setTimeout(() => setRunning(false), 800);
      } else if (button.actionId) {
        const needsConfirm = isCritical || button.actionId === "sleep_pc";
        sendAction(button.actionId, crypto.randomUUID(), button.configuration ?? {}, needsConfirm);
        setTimeout(() => setRunning(false), 800);
      }
    } catch (e) {
      setError(String(e));
      setRunning(false);
    }
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (onRemove) onRemove();
  }

  const buttonLabel = button.label || "Button";

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={handlePress}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-card p-3 aspect-square shadow-lg transition ${disabled ? "opacity-40" : "hover:bg-card-elevated"}`}
      style={{ borderColor: button.color ?? "transparent", borderWidth: button.color ? 1 : 0 }}
    >
      <div className="text-2xl">{button.icon ?? "⚡"}</div>
      <div className="text-xs font-medium text-center line-clamp-2">{buttonLabel}</div>
      {running && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && <div className="absolute bottom-1 text-[9px] text-danger">{error}</div>}
      {onRemove && (
        <button
          onClick={handleRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-danger/20 text-danger text-[10px] flex items-center justify-center hover:bg-danger"
          title="Remove"
        >
          ✕
        </button>
      )}
    </motion.button>
  );
}