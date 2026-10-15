/**
 * `npm run sim [-- <BuildName> <condition> <traceSeconds>]`
 * Replays each Snow Crows log through the simulator, reports accuracy per condition, runs the scripted rotation,
 * then searches gear by replaying the same casts with alternative stats. Results land in lib/gw2/sim/results/*.json.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { chronoSim, type SimBuild } from "./chrono";
import { weaverSim } from "./weaver";
import { evaluateGear, uniform, type GearConfig, type BuildSide, type GearResult } from "./gear";
import { search, type Factory } from "./optimize";
import chronoLog from "./logs/condition-chronomancer.json";
import weaverLog from "./logs/condition-weaver.json";

interface Log { label: string; seconds: number; dps: number; damage: number; condiDamage: number; powerDamage: number; casts: { t: number; id: number; name: string }[]; skills: Record<string, { damage: number; hits: number }>; targetBuffs: Record<string, number>; states?: Record<string, [number, number][]> }
export interface Results {
  slug: string; log: { label: string; seconds: number; dps: number; damage: number };
  replay: { total: number; strike: number; strikeLog: number; conditions: Record<string, { sim: number; log: number; avgStacksSim: number; avgStacksLog: number }>; bySource: { source: string; damage: number }[]; procs: Record<string, number> };
  rotation: { seconds: number; dps: number; casts: Record<string, number> };
  gear: ReturnType<typeof search>;
  attrs: GearResult["attrs"];
}

const pct = (a: number, b: number) => `${((a / b - 1) * 100).toFixed(1).padStart(6)}%`;
const n = (x: number) => Math.round(x).toLocaleString("en-US").padStart(11);
const condName = (k: string) => (k === "poison" ? "Poison" : k[0].toUpperCase() + k.slice(1));
const stacksKey = (k: string) => (k === "poison" ? "Poisoned" : condName(k));

export function replay(make: () => SimBuild, log: Log, trace?: { kind: string; until: number }) {
  const b = make();
  const t0 = Math.min(0, log.casts[0].t, ...(b.prepull ?? []).map((p) => p.t));
  let unknown: string[] = [];
  const simAttr: Record<string, Record<string, number>> = {}; let lastCast = "none"; let lastCastT = -99;
  if (trace) b.sim.onCondition = (kind, stacks) => { const key = b.sim.t - lastCastT <= 0.7 ? lastCast : "none"; ((simAttr[kind] ??= {})[key] = (simAttr[kind]?.[key] ?? 0) + stacks); };
  for (const p of b.prepull ?? []) { b.sim.advance(p.t - t0); lastCast = p.key; lastCastT = b.sim.t; b.cast(p.key); }
  for (const c of log.casts) {
    b.sim.advance(c.t - t0); lastCast = c.name; lastCastT = b.sim.t;
    const before = trace ? b.sim.stacksOf(trace.kind as never) : 0;
    if (!b.cast(c.id)) unknown.push(c.name);
    if (trace && c.t < trace.until) {
      const after = b.sim.stacksOf(trace.kind as never);
      const lg = log.states?.[trace.kind];
      const at = (t: number) => { if (!lg) return "?"; let v = 0; for (const [ms, st] of lg) { if (ms / 1000 <= t) v = st; else break; } return String(v - 1); };
      console.log(`${c.t.toFixed(2).padStart(6)} ${c.name.padEnd(22)} sim ${String(before).padStart(3)}→${String(after).padEnd(3)} log ${at(c.t - 0.01).padStart(3)}→${at(c.t + 0.4)}`);
    }
  }
  b.sim.advance(log.seconds - t0);
  unknown = [...new Set(unknown)];
  if (trace) {
    const st = log.states?.[trace.kind] ?? [];
    const logAttr: Record<string, number> = {}; let prev = 0;
    for (const [ms, s] of st) { const d = s - prev; prev = s; if (d <= 0) continue; const t = ms / 1000; const c = [...log.casts].reverse().find((x) => t - x.t >= 0 && t - x.t <= 0.7); const k = c?.name ?? "none"; logAttr[k] = (logAttr[k] ?? 0) + d; }
    const sa = simAttr[trace.kind] ?? {};
    const keys = [...new Set([...Object.keys(logAttr), ...Object.keys(sa)])].sort((x, y) => (logAttr[y] ?? 0) - (logAttr[x] ?? 0));
    console.log(`attribution of ${trace.kind} stacks (log vs sim):`);
    for (const k of keys) console.log(`   ${k.padEnd(24)} log ${String(logAttr[k] ?? 0).padStart(4)}  sim ${String(Math.round(sa[k] ?? 0)).padStart(4)}`);
  }
  return { b, unknown };
}

function report(slug: string, factory: Factory, side: BuildSide, baseline: GearConfig, log: Log, rotationSeconds: number): Results {
  const g = evaluateGear(baseline, side);
  const make = () => factory(g, 25);
  const tr = process.argv[2]; const kind = process.argv[3];
  const { b, unknown } = replay(make, log, tr && log.label.includes(tr) ? { kind: kind ?? "torment", until: Number(process.argv[4] ?? 30) } : undefined);
  const sim = b.sim;
  console.log(`\n=== ${b.name}: replay of ${log.label}`);
  console.log(`attributes: power ${g.attrs.power} precision ${g.attrs.precision} condition damage ${g.attrs.conditionDamage} expertise ${g.attrs.expertise} crit ${g.critChance.toFixed(2)}% duration ${g.conditionDuration.toFixed(2)}%`);
  console.log(`total   sim ${n(sim.total())}  log ${n(log.damage)}  ${pct(sim.total(), log.damage)}`);
  console.log(`strike  sim ${n(sim.strikeTotal())}  log ${n(log.powerDamage)}  ${pct(sim.strikeTotal(), log.powerDamage)}`);
  const conditions: Results["replay"]["conditions"] = {};
  for (const k of Object.keys(sim.condTotals)) {
    const lg = log.skills[condName(k)]?.damage ?? 0;
    conditions[k] = { sim: sim.condTotals[k], log: lg, avgStacksSim: (sim.stackSeconds[k] ?? 0) / log.seconds, avgStacksLog: Math.max(0, (log.targetBuffs[stacksKey(k)] ?? 1) - 1) };
    console.log(`${k.padEnd(9)} sim ${n(sim.condTotals[k])}  log ${n(lg)}  ${lg ? pct(sim.condTotals[k], lg) : ""}   avg stacks ${conditions[k].avgStacksSim.toFixed(1)} vs ${conditions[k].avgStacksLog.toFixed(1)}`);
  }
  if (unknown.length) console.log("unmapped casts:", unknown.join(", "));
  const bySource = Object.entries(sim.damage).map(([source, v]) => ({ source, damage: v.strike + v.cond })).sort((a, b) => b.damage - a.damage);
  console.log("by source:", bySource.map((r) => `${r.source} ${(r.damage / sim.total() * 100).toFixed(1)}%`).join(" | "));

  const r = make(); r.rotation(rotationSeconds);
  const dps = r.sim.total() / r.sim.t;
  console.log(`--- scripted rotation ${r.sim.t.toFixed(1)}s: ${Math.round(dps).toLocaleString("en-US")} DPS (log ${log.dps.toLocaleString("en-US")}, ${pct(dps, log.dps)})`);

  const gear = search(factory, side, log, baseline);
  console.log(`--- gear search: ${gear.evaluations} replays. baseline ${Math.round(gear.baselineDps)} → best ${Math.round(gear.bestDps)} DPS (${pct(gear.bestDamage, gear.baseline)})`);
  console.log("    steps:", gear.steps.map((s) => `${s.category} ${s.from} → ${s.to} (${s.pct >= 0 ? "+" : ""}${s.pct.toFixed(2)}%)`).join("; "));
  console.log("    top marginals:", gear.marginals.slice(0, 8).map((s) => `${s.category}: ${s.to} ${s.pct >= 0 ? "+" : ""}${s.pct.toFixed(2)}%`).join(" | "));
  console.log("    worst marginals:", gear.marginals.slice(-4).map((s) => `${s.category}: ${s.to} ${s.pct.toFixed(2)}%`).join(" | "));
  return {
    slug, log: { label: log.label, seconds: log.seconds, dps: log.dps, damage: log.damage },
    replay: { total: sim.total(), strike: sim.strikeTotal(), strikeLog: log.powerDamage, conditions, bySource, procs: sim.counts },
    rotation: { seconds: r.sim.t, dps, casts: r.sim.counts }, gear, attrs: g.attrs,
  };
}

if (require.main === module) {
  const out = path.join(__dirname, "..", "..", "..", "..", "lib", "gw2", "sim", "results");
  fs.mkdirSync(out, { recursive: true });
  const chrono = report(
    "condition-chronomancer-staff-scepter-pistol",
    (g) => chronoSim({ power: g.attrs.power + 750, conditionDamage: g.attrs.conditionDamage + 750, critChance: g.critChance, critDamage: g.critDamage, conditionDuration: g.conditionDuration, gear: g.gear }),
    { attr: { conditionDamage: 180, expertise: 180, vitality: 235 } }, // Signet of Domination, Signet of Midnight, jade core
    { prefixes: uniform("Viper's"), rune: "Trapper", sigils: ["Demons", "Bursting"], food: "Cilantro and Cured Meat Flatbread", utility: "Toxic Tuning Crystal", infusions: { malign: 15, spiteful: 3, mighty: 0, precise: 0 } },
    chronoLog as unknown as Log, 86,
  );
  const weaver = report(
    "condition-weaver-pistol-warhorn",
    (g) => weaverSim({ power: g.attrs.power + 750, conditionDamage: g.attrs.conditionDamage + 750, critChance: g.critChance, critDamage: g.critDamage, conditionDuration: g.conditionDuration, gear: g.gear }),
    { attr: { precision: 180, power: 350, conditionDamage: 180, vitality: 415 }, toughnessToCondPct: 10, derivedOffsets: { precision: -180 } }, // Signet of Fire, Empowering Flame + Polyphony (fire), Burning Rage, Elemental Refreshment + jade core, Strength of Stone
    { prefixes: uniform("Viper's"), rune: "Trapper", sigils: ["Bursting", "Malice"], food: "Salsa-Topped Veggie Flatbread", utility: "Potent Master Tuning Crystal", infusions: { malign: 0, spiteful: 18, mighty: 0, precise: 0 } },
    weaverLog as unknown as Log, 87,
  );
  for (const r of [chrono, weaver]) fs.writeFileSync(path.join(out, `${r.slug}.json`), JSON.stringify(r, (k, v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v), 0));
  console.log("\nwrote results to", out);
}
