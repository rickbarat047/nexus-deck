# NEXUS DECK

YOUR PC. YOUR PHONE. ONE CONTROL CENTER.

NEXUS DECK transforms an Android phone into a customizable wireless control deck for a Windows PC over the local Wi-Fi network.

## Features
- Launch registered Windows applications
- Custom dashboard buttons and pages
- Media and volume controls
- System controls with confirmation
- Live PC monitoring
- QR-based device pairing
- PWA installable on Android

## Structure
- apps/client: Android PWA
- apps/agent: Windows companion agent
- packages/shared: shared types and schemas

## Development
```bash
pnpm install
pnpm --filter @nexus-deck/shared build
pnpm --filter @nexus-deck/agent dev
pnpm --filter @nexus-deck/client dev
```

## Agent (Windows)
Set `NEXUS_DEV_MODE=true` for local HTTP testing. For production, provide `NEXUS_CERT_PATH` and `NEXUS_KEY_PATH` (HTTPS).

## Security
- Token-based auth, hashed tokens in SQLite
- Allowlisted actions only
- No arbitrary shell execution

See docs/ for setup and troubleshooting.