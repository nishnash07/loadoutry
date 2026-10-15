/**
 * Minimal discrete-event combat simulator for one player against the Special Forces golem.
 * Strikes use expected crit value (deterministic); proc chances use a seeded RNG so runs are reproducible.
 * Conditions are accrued continuously (stacks × seconds × tick), which equals the game's once-per-second ticks on average.
 * Formulas: wiki "Damage calculation", condition pages; weapon strengths from stats.ts.
 */
import { GOLEM_ARMOR, TICK, weaponStrength, type Condition } from "../stats";

export type Cond = Condition;
export interface Mods { power: number; conditionDamage: number; critChance: number; critDamage: number; conditionDuration: number; strikePct: number; condDmgPct: number; perCond: Partial<Record<Cond, number>> }
export interface Hit { weapon: string; coefficient: number; count?: number; noCrit?: boolean; strikePct?: number }
interface Stack { kind: Cond; from: number; until: number; tag: string }

export class Sim {
  t = 0;
  private events: { t: number; seq: number; fn: () => void }[] = [];
  private seq = 0;
  private rng: number;
  stacks: Stack[] = [];
  damage: Record<string, { strike: number; cond: number }> = {};
  condTotals: Record<string, number> = {};
  stackSeconds: Record<string, number> = {};
  applied: Record<string, number> = {};
  counts: Record<string, number> = {};
  procAt: Record<string, number> = {};
  readyAt: Record<string, number> = {};
  onCondition?: (kind: Cond, stacks: number) => void; // debugging hook
  onStrike?: (expectedCrits: number, hits: number) => void; // on-hit procs from gear (sigils)
  /** Current modifiers; the build script replaces this to express state-dependent bonuses. */
  mods: () => Mods;
  vuln: number;
  alacrity: number; // recharge divisor (1.25, or 1.5 with Time Marches On)
  quickness = 1 / 1.5; // activation time multiplier

  constructor(opts: { mods: () => Mods; vulnerability: number; alacrity: number; seed?: number }) {
    this.mods = opts.mods; this.vuln = 1 + opts.vulnerability / 100; this.alacrity = opts.alacrity; this.rng = opts.seed ?? 1;
  }

  /** Deterministic uniform in [0,1). */
  random() { this.rng = (this.rng * 1103515245 + 12345) & 0x7fffffff; return this.rng / 0x80000000; }

  schedule(at: number, fn: () => void) { this.events.push({ t: at, seq: this.seq++, fn }); }
  every(start: number, interval: number, n: number, fn: (i: number) => void) { for (let i = 0; i < n; i++) this.schedule(start + i * interval, () => fn(i)); }

  /** Advance to `to`, running events and accruing condition damage in order. */
  advance(to: number) {
    for (;;) {
      this.events.sort((a, b) => a.t - b.t || a.seq - b.seq);
      const next = this.events[0];
      if (!next || next.t > to) break;
      this.events.shift();
      this.accrue(Math.max(this.t, next.t));
      next.fn();
    }
    this.accrue(to);
  }
  private accrue(to: number) {
    if (to <= this.t) { this.t = Math.max(this.t, to); return; }
    const m = this.mods();
    const mult = (1 + m.condDmgPct / 100) * this.vuln;
    for (const s of this.stacks) {
      const a = Math.max(s.from, this.t), b = Math.min(s.until, to);
      if (b <= a) continue;
      const d = (b - a) * TICK[s.kind](m.conditionDamage) * mult;
      (this.damage[s.tag] ??= { strike: 0, cond: 0 }).cond += d;
      this.condTotals[s.kind] = (this.condTotals[s.kind] ?? 0) + d;
      this.stackSeconds[s.kind] = (this.stackSeconds[s.kind] ?? 0) + (b - a);
    }
    this.stacks = this.stacks.filter((s) => s.until > to);
    this.t = to;
  }

  count(tag: string, n = 1) { this.counts[tag] = (this.counts[tag] ?? 0) + n; }
  stacksOf(kind: Cond) { return this.stacks.filter((s) => s.kind === kind && s.until > this.t).length; }

  /** Expected damage of a strike (or several) right now. Returns expected number of critical hits. */
  strike(tag: string, h: Hit, extraPct = 0) {
    const m = this.mods();
    const base = (weaponStrength(h.weapon) * m.power * h.coefficient) / GOLEM_ARMOR;
    const crit = h.noCrit ? 0 : Math.min(100, m.critChance) / 100;
    const n = h.count ?? 1;
    const d = base * (1 + crit * (m.critDamage / 100 - 1)) * (1 + (m.strikePct + extraPct + (h.strikePct ?? 0)) / 100) * this.vuln * n;
    (this.damage[tag] ??= { strike: 0, cond: 0 }).strike += d;
    this.onStrike?.(crit * n, n);
    return crit * n;
  }

  /** Apply condition stacks; duration is scaled by Condition Duration plus the per-condition bonus, capped at +100%. */
  condition(tag: string, kind: Cond, stacks: number, duration: number) {
    if (stacks <= 0) return;
    this.onCondition?.(kind, stacks);
    const m = this.mods();
    const dur = duration * (1 + Math.min(100, m.conditionDuration + (m.perCond[kind] ?? 0)) / 100);
    this.applied[`${tag}:${kind}`] = (this.applied[`${tag}:${kind}`] ?? 0) + stacks * dur;
    const whole = Math.floor(stacks), frac = stacks - whole;
    for (let i = 0; i < whole; i++) this.stacks.push({ kind, from: this.t, until: this.t + dur, tag });
    if (frac > 0.001) this.stacks.push({ kind, from: this.t, until: this.t + dur * frac, tag }); // expected-value fractional stack
  }

  /** Internal-cooldown proc helper: runs fn if the proc is ready, returns whether it fired. */
  proc(name: string, icd: number, fn: () => void) {
    if ((this.procAt[name] ?? -Infinity) > this.t) return false;
    this.procAt[name] = this.t + icd; fn(); this.count(name); return true;
  }

  ready(id: string) { return (this.readyAt[id] ?? 0) <= this.t + 1e-9; }
  recharge(id: string, seconds: number) { this.readyAt[id] = this.t + seconds / this.alacrity; }

  total() { let s = 0; for (const d of Object.values(this.damage)) s += d.strike + d.cond; return s; }
  strikeTotal() { let s = 0; for (const d of Object.values(this.damage)) s += d.strike; return s; }
}
