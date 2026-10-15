/**
 * Condition Chronomancer (Staff / Scepter & Pistol) scripted for the simulator.
 * Numbers: wiki PvE skill facts (see lib/gw2/builds/condition-chronomancer.ts) and cast durations measured
 * from the Snow Crows log (they include quickness). Clone attack cadence is the wiki's "about 1 second between attacks".
 */
import { Sim, type Mods } from "./engine";

export interface ChronoStats { power: number; conditionDamage: number; critChance: number; critDamage: number; conditionDuration: number; gear?: GearMods }
/** Gear-derived percentage modifiers (sigils, runes, food) applied on top of the traits scripted inside each build. */
export interface GearMods { perCond?: Partial<Record<"burning" | "bleeding" | "torment" | "confusion" | "poison", number>>; condDmgPct?: number; strikePct?: number; critPct?: number; onStrike?: (sim: Sim, crits: number, hits: number) => void }
export interface SimBuild { name: string; sim: Sim; cast(id: number | string): boolean; rotation(seconds: number): void; prepull?: { t: number; key: string }[] }

type Weapon = "staff" | "scepter";
interface Clone { weapon: Weapon; alive: boolean }

export function chronoSim(st: ChronoStats, seed = 1): SimBuild {
  const g: GearMods = st.gear ?? { perCond: { torment: 20 }, condDmgPct: 5 }; // Snow Crows gear: Sigil of Demons, Sigil of Bursting
  const S = { set: "staff" as Weapon, clones: [] as Clone[], compounding: [] as number[], midnightDownUntil: -1, splitAmmo: 2, splitNextAt: 0, cs: null as null | { readyAt: Record<string, number>; splitAmmo: number; splitNextAt: number; until: number } };
  const sim: Sim = new Sim({
    vulnerability: 25, alacrity: 1.5, seed,
    mods: (): Mods => {
      const cp = S.compounding.filter((x) => x > sim.t).length;
      return {
        power: st.power, conditionDamage: st.conditionDamage, critChance: st.critChance + 25 + 15 + (g.critPct ?? 0), critDamage: st.critDamage,
        conditionDuration: st.conditionDuration - (S.midnightDownUntil > sim.t ? 12 : 0), // Signet of Midnight passive (+180 Expertise) is off for 20 s after its active
        strikePct: cp + (g.strikePct ?? 0), condDmgPct: cp + (g.condDmgPct ?? 0), perCond: { confusion: 25, ...Object.fromEntries(Object.entries(g.perCond ?? {}).map(([k, v]) => [k, (v ?? 0) + (k === "confusion" ? 25 : 0)])) },
      };
    },
  });
  if (g.onStrike) sim.onStrike = (c, h) => g.onStrike!(sim, c, h);
  const CAST: Record<string, number> = { warlock: 0.87, duelist: 0.55, images: 1.84, counter: 0.12, counterspell: 0.6, bolt: 0.43, blast: 0.52, clone: 0.83, bullet: 0.45, storm: 0.48, winds: 0.75, ether: 0.92 };
  const CD: Record<string, number> = { warlock: 12, duelist: 16, images: 9, counterspell: 6, bullet: 20, storm: 20, armor: 16, retreat: 8, mirror: 25, ether: 30, midnight: 20, timesink: 38 * 0.85, distortion: 50 * 0.85, cs: 105, swap: 10 };

  const illusion = () => { S.compounding.push(sim.t + 8); if (S.compounding.length > 5) S.compounding.shift(); };
  // Ineptitude's 3 s interval only applies to enemies with defiance bars; the golem has none, so every blind is 2 confusion.
  const blind = () => { sim.condition("Ineptitude", "confusion", 2, 5); sim.count("Ineptitude"); };
  const disable = () => { if (sim.stacksOf("torment") >= 5 || sim.stacksOf("confusion") >= 5) sim.proc("Relic of Akeem", 10, () => { sim.condition("Relic of Akeem", "confusion", 2, 10); sim.condition("Relic of Akeem", "torment", 2, 10); }); };
  const sharper = (tag: string, crits: number) => sim.condition(tag, "bleeding", crits, 5);

  function addClone(weapon: Weapon) {
    if (S.clones.length >= 3) { S.clones[0].alive = false; S.clones.shift(); }
    const c: Clone = { weapon, alive: true }; S.clones.push(c); illusion();
    const attack = () => {
      if (!c.alive) return;
      if (c.weapon === "staff") { sim.condition("Clones", "torment", 1, 2); sim.condition("Clones", "confusion", 1, 2); sharper("Clones", sim.mods().critChance / 100 * 2); sim.count("Clone Winds of Chaos"); }
      else { sim.condition("Clones", "torment", 1, 2); sharper("Clones", sim.mods().critChance / 100); sim.count("Clone Ether Bolt"); }
      sim.schedule(sim.t + (c.weapon === "staff" ? 1.75 : 1.5), attack);
    };
    sim.schedule(sim.t + 1, attack);
  }
  /** Shatters hit once per clone plus once from the mesmer's own position (benchmarks are played in melee range). Returns the hit count. */
  function shatter(tag: string): number {
    const n = S.clones.length;
    for (const c of S.clones) c.alive = false;
    S.clones = [];
    if (n >= 3) addClone(S.set); // Illusionary Reversion
    sim.count(tag);
    if (n === 0) return 0;
    sim.condition("Maim the Disillusioned", "torment", n + 1, 6);
    return n + 1;
  }
  function phantasmWarlock() {
    for (let p = 0; p < 2; p++) {
      const at = sim.t + CAST.warlock; // Mage Strike lands as the cast ends; each of its 3 strikes applies 2 torment (log: +6 per attack)
      illusion();
      sim.schedule(at, () => { const c = sim.strike("Phantasmal Warlock", { weapon: "Illusionary Warlock", coefficient: 0.15, count: 3 }); sim.condition("Phantasmal Warlock", "torment", 6, 4); sharper("Phantasmal Warlock", c); });
      sim.schedule(at + 2.5, () => { illusion(); const c = sim.strike("Phantasmal Warlock", { weapon: "Illusionary Warlock", coefficient: 0.15 * 1.05, count: 3 }); sim.condition("Phantasmal Warlock", "torment", 6, 4); sharper("Phantasmal Warlock", c); });
      sim.schedule(at + 5, () => addClone("staff"));
    }
  }
  function phantasmDuelist() {
    const start = sim.t + CAST.duelist + 0.5;
    illusion();
    const volley = (t0: number, mult: number) => sim.every(t0, 0.2, 8, () => { const c = sim.strike("Phantasmal Duelist", { weapon: "Illusionary Duelist", coefficient: 0.115 * mult }); sim.condition("Phantasmal Duelist", "bleeding", 1, 4); sharper("Phantasmal Duelist", c); });
    volley(start, 1); sim.schedule(start + 2, illusion); volley(start + 2, 1.05); sim.schedule(start + 4, () => addClone("scepter"));
  }

  // Skill table: effect runs at cast start; `dur` is the measured activation under quickness.
  const SK: Record<string, { dur: number; cd?: string; fn: () => void }> = {
    winds: { dur: CAST.winds, fn: () => { sim.strike("Winds of Chaos", { weapon: "Staff", coefficient: 0.3, count: 2 }); sim.condition("Winds of Chaos", "torment", 1, 5); sim.condition("Winds of Chaos", "confusion", 1, 5); } },
    retreat: { dur: 0, cd: "retreat", fn: () => addClone("staff") },
    warlock: { dur: CAST.warlock, cd: "warlock", fn: phantasmWarlock },
    armor: { dur: 0, cd: "armor", fn: () => { sim.condition("Chaos Armor", "confusion", 3, 5); blind(); } },
    storm: { dur: CAST.storm, cd: "storm", fn: () => { const t0 = sim.t + CAST.storm; sim.every(t0, 1, 6, (i) => { sim.strike("Chaos Storm", { weapon: "Staff", coefficient: 0.33 }); sim.condition("Chaos Storm", "poison", 1 / 3, 4); if (i === 0) disable(); }); } },
    bolt: { dur: CAST.bolt, fn: () => { sim.strike("Ether Bolt", { weapon: "Scepter", coefficient: 0.5 }); sim.condition("Ether Bolt", "torment", 1, 4); } },
    blast: { dur: CAST.blast, fn: () => { sim.strike("Ether Blast", { weapon: "Scepter", coefficient: 0.5 }); sim.condition("Ether Blast", "torment", 1, 6); } },
    clone: { dur: CAST.clone, fn: () => { sim.strike("Ether Clone", { weapon: "Scepter", coefficient: 0.75 }); if (S.clones.length >= 3) sim.condition("Ether Clone", "torment", 1, 9); else addClone("scepter"); } },
    counter: { dur: CAST.counter, fn: () => {} },
    counterspell: { dur: CAST.counterspell, cd: "counterspell", fn: () => { sim.strike("Counterspell", { weapon: "Scepter", coefficient: 0.1 }); sim.condition("Counterspell", "confusion", 5, 7); blind(); addClone("scepter"); } },
    images: { dur: CAST.images, cd: "images", fn: () => sim.every(sim.t + 0.1, (CAST.images - 0.1) / 7, 7, () => { sim.strike("Confusing Images", { weapon: "Scepter", coefficient: 0.76 }); sim.condition("Confusing Images", "confusion", 1, 7); }) },
    duelist: { dur: CAST.duelist, cd: "duelist", fn: () => { sim.strike("Phantasmal Duelist", { weapon: "Pistol", coefficient: 0.33, count: 3 }); phantasmDuelist(); } },
    bullet: { dur: CAST.bullet, cd: "bullet", fn: () => { sim.strike("Magic Bullet", { weapon: "Pistol", coefficient: 0.2 }); sim.condition("Magic Bullet", "confusion", 3, 5); blind(); disable(); } },
    split: { dur: 0, fn: () => { const n = shatter("Split Second"); if (!n) return; const coef = n <= 2 ? 0.767 : n === 3 ? 0.613 : 0.537; sim.strike("Split Second", { weapon: "Unequipped", coefficient: coef, count: n }, 10); sim.schedule(sim.t + 1, () => sim.strike("Split Second", { weapon: "Unequipped", coefficient: coef, count: n }, 10)); } },
    rewinder: { dur: 0, fn: () => { const n = shatter("Rewinder"); sim.readyAt.rewinder = sim.t + ((30 - 3 * Math.max(0, n - 1)) * 0.85) / sim.alacrity; if (!n) return; sim.strike("Rewinder", { weapon: "Unequipped", coefficient: 0.38, count: n }, 10); sim.condition("Rewinder", "confusion", 2 * n, 4); blind(); } },
    timesink: { dur: 0, cd: "timesink", fn: () => { shatter("Time Sink"); disable(); } },
    distortion: { dur: 0, cd: "distortion", fn: () => shatter("Distortion") },
    cs: { dur: 0, cd: "cs", fn: () => { const n = shatter("Continuum Split"); S.cs = { readyAt: { ...sim.readyAt }, splitAmmo: S.splitAmmo, splitNextAt: S.splitNextAt, until: sim.t + [1.5, 3, 4.5, 6][Math.min(3, n)] }; } },
    shift: { dur: 0, fn: () => { if (!S.cs) return; const keep = sim.readyAt.cs; sim.readyAt = { ...S.cs.readyAt, cs: keep }; S.splitAmmo = S.cs.splitAmmo; S.splitNextAt = S.cs.splitNextAt; S.cs = null; sim.count("Continuum Shift"); } },
    ether: { dur: CAST.ether, cd: "ether", fn: () => { sim.readyAt.warlock = 0; sim.readyAt.duelist = 0; } },
    mirror: { dur: 0, cd: "mirror", fn: () => { addClone(S.set); addClone(S.set); } },
    midnight: { dur: 0, cd: "midnight", fn: () => { blind(); S.midnightDownUntil = sim.t + CD.midnight / sim.alacrity; } },
    swap: { dur: 0, cd: "swap", fn: () => { S.set = S.set === "staff" ? "scepter" : "staff"; } },
  };
  const BY_ID: Record<number, string> = { 10273: "winds", 10310: "retreat", 10216: "warlock", 10331: "armor", 10169: "storm", 10289: "bolt", 10290: "blast", 10291: "clone", 10276: "counter", 10314: "counterspell", 10168: "images", 10175: "duelist", 10229: "bullet", 56930: "split", 56925: "split", 56928: "rewinder", 56873: "timesink", 10192: "distortion", 29830: "cs", 30747: "shift", 21750: "ether", 10202: "mirror", 10234: "midnight", [-2]: "swap" };

  function fire(key: string) {
    tickAmmo();
    const s = SK[key];
    if (key === "split") { S.splitAmmo -= 1; if (S.splitNextAt < sim.t) S.splitNextAt = sim.t; S.splitNextAt += (12 * 0.85) / sim.alacrity; }
    s.fn(); sim.count(key);
    if (s.cd) sim.recharge(s.cd, CD[s.cd]);
  }
  function tickAmmo() { while (S.splitAmmo < 2 && S.splitNextAt <= sim.t) { S.splitAmmo++; S.splitNextAt += (12 * 0.85) / sim.alacrity; } }

  // Priority rotation: Snow Crows' loops with shatters by priority between casts.
  function doCast(key: string) {
    tickAmmo();
    const s = SK[key];
    if (s.cd && !sim.ready(s.cd)) sim.advance(sim.readyAt[s.cd]);
    fire(key);
    sim.advance(sim.t + s.dur);
    shatters();
  }
  function shatters() {
    tickAmmo();
    const three = S.clones.length >= 3;
    if (three && sim.ready("rewinder")) { fire("rewinder"); return; }
    if (S.splitAmmo === 2 && S.clones.length >= 1) { fire("split"); return; }
    if (three && sim.ready("timesink")) { fire("timesink"); return; }
    if (three && sim.ready("distortion")) { fire("distortion"); return; }
    if (three && S.splitAmmo >= 1) { fire("split"); return; }
    if (S.clones.length <= 1 && sim.ready("mirror") && sim.ready("rewinder")) fire("mirror");
  }
  function rotation(seconds: number) {
    const staffBurst = () => { doCast("warlock"); doCast("ether"); doCast("warlock"); if (sim.ready("armor")) doCast("armor"); if (sim.ready("storm")) doCast("storm"); if (sim.ready("mirror")) doCast("mirror"); doCast("retreat"); shatters(); };
    doCast("duelist"); doCast("counter"); doCast("counterspell"); doCast("swap");
    while (sim.t < seconds) {
      // staff loop
      if (sim.ready("cs")) { doCast("warlock"); doCast("cs"); doCast("ether"); doCast("warlock"); if (sim.ready("armor")) doCast("armor"); if (sim.ready("storm")) doCast("storm"); if (sim.ready("mirror")) doCast("mirror"); doCast("retreat"); if (S.clones.length >= 3 && sim.ready("rewinder")) fire("rewinder"); sim.advance(Math.min(S.cs!.until, sim.t + 0.1)); fire("shift"); staffBurst(); }
      else { doCast("warlock"); doCast("retreat"); doCast("winds"); doCast("winds"); doCast("winds"); if (sim.ready("armor")) doCast("armor"); if (sim.ready("storm")) doCast("storm"); doCast("winds"); if (sim.ready("retreat")) doCast("retreat"); doCast("ether"); doCast("warlock"); if (sim.ready("retreat")) doCast("retreat"); }
      while (!sim.ready("swap")) doCast("winds");
      doCast("swap");
      // scepter loop
      doCast("duelist"); doCast("images"); doCast("counter"); doCast("counterspell"); doCast("bullet");
      const chain = () => { doCast("bolt"); doCast("blast"); doCast("clone"); };
      while (!sim.ready("counterspell")) chain();
      doCast("counter"); doCast("counterspell"); chain();
      doCast("images"); doCast("counter"); doCast("counterspell"); doCast("duelist");
      while (!sim.ready("swap")) chain();
      doCast("swap");
    }
  }
  return {
    name: "Condition Chronomancer", sim,
    cast(id) { const key = typeof id === "number" ? BY_ID[id] : id; if (!key) return false; if (key === "shift" && !S.cs) return true; fire(key); return true; },
    rotation,
  };
}
