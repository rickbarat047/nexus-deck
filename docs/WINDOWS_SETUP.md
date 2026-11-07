# Windows Setup

1. Install Node.js 20+.
2. Clone repository.
3. Run `pnpm install`.
4. Build shared: `pnpm --filter @nexus-deck/shared build`.
5. Build agent: `pnpm --filter @nexus-deck/agent build`.
6. Start agent: `node apps/agent/dist/index.js` (dev: set NEXUS_DEV_MODE=true).
7. Note LAN address and pairing code printed in console.
8. Allow port in Windows Firewall for the agent.