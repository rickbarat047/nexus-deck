# Deployment Guide

## Architecture (secure by design)

```
┌─────────────┐     HTTPS/WSS (local Wi-Fi)     ┌──────────────────┐
│  Android    │◄────────────────────────────────►│  Windows Agent   │
│   PWA       │   (phone on same Wi-Fi)          │  (local PC only) │
│             │                                  │                  │
│ hosted on   │                                  │ executes:        │
│ Cloudflare  │                                  │ - launch apps    │
│ Pages (free │                                  │ - media/volume   │
│ HTTPS)      │                                  │ - system actions │
└─────────────┘                                  │ - monitoring     │
                                                 └──────────────────┘
```

**Rule:** The Windows agent must NEVER be hosted publicly. It binds only to your LAN IP (or loopback in dev mode). Never forward ports on your router.

---

## Step 1: Host the frontend (free HTTPS)

### Option A: Cloudflare Pages (recommended)

1. Push this repo to GitHub
2. Go to Cloudflare Pages → Create a project → Connect your GitHub repo
3. Build settings:
   - Build command: `pnpm --filter @nexus-deck/client build`
   - Build output directory: `apps/client/dist`
   - Root directory: `/`
4. Deploy. You'll get a URL like `https://nexus-deck.pages.dev`

### Option B: GitHub Pages

1. Push repo to GitHub
2. Enable GitHub Pages in repo settings
3. Use GitHub Actions to build `apps/client` and publish `dist`

---

## Step 2: Generate local HTTPS certificate for the agent

On the Windows PC, run as Administrator:

```powershell
.\scripts\generate-cert.ps1
```

This creates:
- `C:\nexus\agent-data\nexus-agent.pem` (certificate)
- `C:\nexus\agent-data\nexus-agent-key.pem` (private key)

### Install the certificate on Android

1. Transfer `nexus-agent.pem` to your phone (email, USB, etc.)
2. On Android: Settings → Security → Encryption & credentials → Install a certificate → CA certificate
3. Select the `.pem` file and install it
4. Name it "Nexus Deck Agent"

This lets Chrome trust `https://192.168.0.191:8443` without warnings.

---

## Step 3: Start the Windows agent with HTTPS

```powershell
$env:NEXUS_DEV_MODE = $false
$env:NEXUS_CERT_PATH = "C:\nexus\agent-data\nexus-agent.pem"
$env:NEXUS_KEY_PATH  = "C:\nexus\agent-data\nexus-agent-key.pem"
node apps\agent\dist\index.js
```

The agent will print its LAN address and a pairing code. Use `https://192.168.0.191:8443` as the agent address in the app.

---

## Step 4: Connect your phone

1. Open the hosted PWA URL on your phone (e.g. `https://nexus-deck.pages.dev`)
2. Install as PWA: Chrome menu → "Add to Home screen"
3. Enter agent address: `https://192.168.0.191:8443`
4. Enter pairing code from the Windows agent
5. Pair and control your PC

---

## Security summary

- ✅ Frontend served over HTTPS (Cloudflare Pages)
- ✅ Agent-WSS connection over HTTPS with local certificate
- ✅ Agent binds only to LAN, never public internet
- ✅ Pairing codes are short-lived (5 minutes)
- ✅ Device tokens hashed in SQLite
- ✅ No arbitrary shell execution — allowlisted actions only
- ✅ No cloud execution of Windows commands