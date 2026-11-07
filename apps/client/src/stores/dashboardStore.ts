import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardPage, DashboardButton } from "@nexus-deck/shared";
import { DEFAULT_PAGES } from "@nexus-deck/shared";

interface DashboardStore {
  pages: DashboardPage[];
  buttons: DashboardButton[];
  currentPageId: string;
  gridSize: number;
  wallpaper: string | null;
  currentPage: () => DashboardPage | undefined;
  setPage: (id: string) => void;
  addPage: (name: string) => void;
  renamePage: (id: string, name: string) => void;
  deletePage: (id: string) => void;
  addButton: (b: DashboardButton) => void;
  updateButton: (id: string, patch: Partial<DashboardButton>) => void;
  removeButton: (id: string) => void;
  reorderButtons: (pageId: string, orderedIds: string[]) => void;
  setGridSize: (n: number) => void;
  setWallpaper: (w: string | null) => void;
  resetLayout: () => void;
}

function makeId() {
  return crypto.randomUUID();
}

const defaultPages: DashboardPage[] = DEFAULT_PAGES.map((p) => ({
  id: p.id,
  name: p.name,
  sortOrder: p.sortOrder,
  createdAt: new Date().toISOString(),
}));

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      pages: defaultPages,
      buttons: [],
      currentPageId: "home",
      gridSize: 4,
      wallpaper: null,
      currentPage: () => get().pages.find((p) => p.id === get().currentPageId),
      setPage: (id) => set({ currentPageId: id }),
      addPage: (name) =>
        set((s) => ({
          pages: [...s.pages, { id: makeId(), name, sortOrder: s.pages.length, createdAt: new Date().toISOString() }],
        })),
      renamePage: (id, name) =>
        set((s) => ({ pages: s.pages.map((p) => (p.id === id ? { ...p, name } : p)) })),
      deletePage: (id) =>
        set((s) => ({
          pages: s.pages.filter((p) => p.id !== id),
          buttons: s.buttons.filter((b) => b.pageId !== id),
          currentPageId: s.currentPageId === id ? "home" : s.currentPageId,
        })),
      addButton: (b) => set((s) => ({ buttons: [...s.buttons, b] })),
      updateButton: (id, patch) =>
        set((s) => ({ buttons: s.buttons.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      removeButton: (id) => set((s) => ({ buttons: s.buttons.filter((b) => b.id !== id) })),
      reorderButtons: (pageId, orderedIds) =>
        set((s) => ({
          buttons: s.buttons.map((b) => {
            if (b.pageId !== pageId) return b;
            const idx = orderedIds.indexOf(b.id);
            return idx >= 0 ? { ...b, position: idx } : b;
          }),
        })),
      setGridSize: (n) => set({ gridSize: n }),
      setWallpaper: (w) => set({ wallpaper: w }),
      resetLayout: () => set({ pages: defaultPages, buttons: [], currentPageId: "home", gridSize: 4, wallpaper: null }),
    }),
    { name: "nexus-dashboard" },
  ),
);