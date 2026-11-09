import { z } from "zod";
const registry = new Map();
export function registerAction(def) {
    registry.set(def.id, def);
}
export function getAction(id) {
    return registry.get(id);
}
export function listActions() {
    return Array.from(registry.values());
}
//# sourceMappingURL=registry.js.map