# Cloudflare Pages Build Troubleshooting

If the Pages deployment fails, check the build logs first:

**Cloudflare Dashboard → Workers & Pages → Your Project → Deployments → Click the failed deployment → View logs**

## Common fixes

### Fix 1: Install pnpm in the build environment

Cloudflare Pages doesn't always have pnpm pre-installed. Update your build settings:

- **Build command:** `npm install -g pnpm@10 && pnpm install && pnpm --filter @nexus-deck/client build`
- **Build output directory:** `apps/client/dist`
- **Root directory:** `/`

### Fix 2: Remove wrangler.toml (Pages doesn't need it)

Cloudflare Pages uses dashboard settings, not wrangler.toml. If wrangler.toml is causing conflicts, delete it:

```bash
rm wrangler.toml
git commit -m "Remove wrangler.toml"
git push origin main
```

Then configure everything in the Cloudflare Pages dashboard under **Settings → Builds & deployments**.

### Fix 3: Use a simpler build command

If the monorepo filter is causing issues, try:

- **Build command:** `cd apps/client && pnpm install && pnpm build`
- **Build output directory:** `apps/client/dist`

### Fix 4: Check Node version

Cloudflare Pages uses Node 18+ by default. If you need a specific version, add a `.node-version` file:

```
20
```

## Alternative: Deploy manually

If Cloudflare Pages keeps failing, you can build locally and deploy via Wrangler:

```bash
# Install wrangler
npm install -g wrangler

# Build the client
cd C:\nexus
pnpm --filter @nexus-deck/client build

# Deploy to Pages
wrangler pages deploy apps/client/dist --project-name nexus-deck
```

Or use GitHub Pages instead (free, works well with static sites):

1. Push to GitHub
2. Enable GitHub Pages in repo settings
3. Use GitHub Actions to build and deploy `apps/client/dist`