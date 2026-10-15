/**
 * Gear search: replay the Snow Crows cast sequence with alternative stats. The actions are fixed (gear does not change
 * cooldowns), only attributes, duration bonuses and sigil procs change, so this isolates the gear question cleanly.
 */
import { evaluateGear, uniform, SLOTS, PREFIX_NAMES, RUNES, SIGILS, FOODS, UTILITIES, type GearConfig, type BuildSide, type GearResult, type Slot } from "./gear";
import type { SimBuild } from "./chrono";

export interface Log { seconds: number; casts: { t: number; id: number; name: string }[] }
export type Factory = (g: GearResult, might: number) => SimBuild;

export function replayDamage(make: Factory, g: GearResult, log: Log) {
  const b = make(g, 25);
  const t0 = Math.min(0, log.casts[0].t, ...(b.prepull ?? []).map((p) => p.t));
  for (const p of b.prepull ?? []) { b.sim.advance(p.t - t0); b.cast(p.key); }
  for (const c of log.casts) { b.sim.advance(c.t - t0); b.cast(c.id); }
  b.sim.advance(log.seconds - t0);
  return b.sim.total();
}

export interface Change { category: string; from: string; to: string; pct: number }
export interface SearchResult {
  baseline: number; baselineDps: number; best: GearConfig; bestDamage: number; bestDps: number;
  marginals: Change[]; // each single swap from the baseline, sorted by gain
  steps: Change[]; // the accepted swaps on the way to the best configuration
  evaluations: number;
}

export function search(make: Factory, side: BuildSide, log: Log, baseline: GearConfig): SearchResult {
  let evaluations = 0;
  const score = (cfg: GearConfig) => { evaluations++; return replayDamage(make, evaluateGear(cfg, side), log); };
  const base = score(baseline);
  const marginals: Change[] = [];
  const tryOne = (category: string, from: string, to: string, cfg: GearConfig) => { const d = score(cfg); marginals.push({ category, from, to, pct: (d / base - 1) * 100 }); };
  // marginal table: one change at a time from the baseline
  for (const p of PREFIX_NAMES) if (p !== baseline.prefixes.Helm) tryOne("Stat prefix (all pieces)", baseline.prefixes.Helm, p, { ...baseline, prefixes: uniform(p) });
  for (const r of RUNES) if (r.name !== baseline.rune) tryOne("Rune", baseline.rune, r.name, { ...baseline, rune: r.name });
  for (const s of SIGILS) for (const i of [0, 1] as const) if (!baseline.sigils.includes(s.name)) { const sig: [string, string] = [...baseline.sigils] as [string, string]; sig[i] = s.name; tryOne("Sigil", baseline.sigils[i], s.name, { ...baseline, sigils: sig }); }
  for (const f of FOODS) if (f.name !== baseline.food) tryOne("Food", baseline.food, f.name, { ...baseline, food: f.name });
  for (const u of UTILITIES) if (u.name !== baseline.utility) tryOne("Utility", baseline.utility, u.name, { ...baseline, utility: u.name });
  for (const n of [0, 9, 18]) if (n !== baseline.infusions.malign) tryOne("Infusions", `${baseline.infusions.malign} Malign / ${baseline.infusions.spiteful} Spiteful`, `${n} Malign / ${18 - n} Spiteful`, { ...baseline, infusions: { malign: n, spiteful: 18 - n, mighty: 0, precise: 0 } });
  marginals.sort((a, b) => b.pct - a.pct);

  // coordinate descent over every slot and category until nothing improves
  let cfg: GearConfig = JSON.parse(JSON.stringify(baseline)); let bestD = base; const steps: Change[] = [];
  const accept = (category: string, from: string, to: string, next: GearConfig) => { const d = score(next); if (d > bestD + 1) { steps.push({ category, from, to, pct: (d / base - 1) * 100 }); cfg = next; bestD = d; return true; } return false; };
  for (let sweep = 0; sweep < 4; sweep++) {
    let improved = false;
    for (const slot of SLOTS) for (const p of PREFIX_NAMES) if (p !== cfg.prefixes[slot]) improved = accept(`Prefix: ${slot}`, cfg.prefixes[slot], p, { ...cfg, prefixes: { ...cfg.prefixes, [slot]: p } as Record<Slot, string> }) || improved;
    for (const r of RUNES) if (r.name !== cfg.rune) improved = accept("Rune", cfg.rune, r.name, { ...cfg, rune: r.name }) || improved;
    for (const i of [0, 1] as const) for (const s of SIGILS) if (!cfg.sigils.includes(s.name)) { const sig: [string, string] = [...cfg.sigils] as [string, string]; sig[i] = s.name; improved = accept("Sigil", cfg.sigils[i], s.name, { ...cfg, sigils: sig }) || improved; }
    for (const f of FOODS) if (f.name !== cfg.food) improved = accept("Food", cfg.food, f.name, { ...cfg, food: f.name }) || improved;
    for (const u of UTILITIES) if (u.name !== cfg.utility) improved = accept("Utility", cfg.utility, u.name, { ...cfg, utility: u.name }) || improved;
    for (let n = 0; n <= 18; n += 3) for (const kind of ["malign", "spiteful", "mighty", "precise"] as const) {
      const inf = { malign: 0, spiteful: 0, mighty: 0, precise: 0 }; inf[kind] = n; const rest = 18 - n; inf[kind === "malign" ? "spiteful" : "malign"] += rest;
      if (JSON.stringify(inf) !== JSON.stringify(cfg.infusions)) improved = accept("Infusions", JSON.stringify(cfg.infusions), JSON.stringify(inf), { ...cfg, infusions: inf }) || improved;
    }
    if (!improved) break;
  }
  return { baseline: base, baselineDps: base / log.seconds, best: cfg, bestDamage: bestD, bestDps: bestD / log.seconds, marginals, steps, evaluations };
}
