import { useDashboardStore } from "../../stores/dashboardStore";
import { Home, Gamepad2, Briefcase, Music, Settings as Cog, Monitor, Plus } from "lucide-react";

const LABELS: Record<string, string> = {
  home: "Home",
  gaming: "Games",
  work: "Work",
  media: "Media",
  system: "System",
  monitor: "PC Status",
};

const ICONS: Record<string, any> = {
  home: Home,
  gaming: Gamepad2,
  work: Briefcase,
  media: Music,
  system: Cog,
  monitor: Monitor,
};

export default function BottomNav() {
  const { pages, currentPageId, setPage } = useDashboardStore();
  return (
    <nav className="flex gap-2 overflow-x-auto px-3 py-2 bg-bg-secondary border-t border-card-elevated">
      {pages.map((p) => {
        const Icon = ICONS[p.id] ?? Plus;
        const active = p.id === currentPageId;
        return (
          <button
            key={p.id}
            onClick={() => setPage(p.id)}
            className={`flex flex-col items-center min-w-[64px] px-2 py-1.5 rounded-xl transition ${active ? "text-accent" : "text-text-secondary"}`}
          >
            <Icon size={20} />
            <span className="text-[10px] mt-0.5 font-medium">{LABELS[p.id] ?? p.name}</span>
          </button>
        );
      })}
    </nav>
  );
}