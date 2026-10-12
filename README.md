# Loadoutry

Build guides that explain the math. Live: https://nishnash07.github.io/loadoutry/

- `app/` Next.js 15 (App Router, static export) + Tailwind 4
- `lib/cd/` Crimson Desert data: items (+10 stats), abyss gears, builds, stat curves decoded from the game's `statusinfo` table
- `components/cd/` in-game style equipment panel, stat bars, curve chart, attack-vs-crit calculator
- `public/icons/cd/` in-game item icons (webp)

```bash
npm install
npm run dev
```

Deploys to GitHub Pages on push via `.github/workflows/deploy.yml` (`NEXT_PUBLIC_BASE_PATH=/loadoutry`).

Fan project. Crimson Desert is © Pearl Abyss; item icons belong to them.
