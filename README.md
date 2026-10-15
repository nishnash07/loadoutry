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

## Guild Wars 2 simulator

`npm run sim` compiles `lib/gw2/sim` and replays the Snow Crows benchmark logs (`lib/gw2/sim/logs`) through the discrete-event simulator, prints the accuracy per condition, runs the scripted rotation, and searches gear by replaying the same casts with alternative stats. It writes `lib/gw2/sim/results/*.json`, which the build pages render. `npm run sim -- Chronomancer confusion 20` traces one condition's stack count against the log for the first 20 seconds.
