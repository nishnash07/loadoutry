/**
 * Condition Weaver (Pistol & Warhorn) scripted for the simulator.
 * Numbers: wiki PvE skill facts (lib/gw2/builds/condition-weaver.ts and the trait pages); cast durations measured from the Snow Crows log.
 */
import { Sim, type Mods } from "./engine";
import type { SimBuild, GearMods } from "./chrono";

export interface WeaverStats { power: number; conditionDamage: number; critChance: number; critDamage: number; conditionDuration: number; gear?: GearMods }
type El = "fire" | "water" | "air" | "earth";

export function weaverSim(st: WeaverStats, seed = 1): SimBuild {
  // Base stats exclude the attunement-dependent minors (Empowering Flame, Elemental Polyphony): computeBuild adds them for the Fire main hand, so subtract here and re-add by state.
  const g: GearMods = st.gear ?? { condDmgPct: 5 }; // Snow Crows gear: Sigil of Bursting (Malice is inside conditionDuration)
  const basePower = st.power - 150 - 200;
  const baseCd = st.conditionDamage;
  // Snow Crows pre-loads a Fire and an Earth Bullet before the pull.
  const S = { main: "earth" as El, off: "earth" as El, bullets: { fire: 1, earth: 1, ice: 0, air: 0 }, enhanced: 0, weaveUntil: -1, woven: new Set<El>(), touched: new Set<El>(), perfectUntil: -1, rageUntil: -1, primordial: 2, primordialNextAt: 0, fireAuraUntil: -1 };
  const has = (e: El) => S.main === e || S.off === e;
  const sim: Sim = new Sim({
    vulnerability: 25, alacrity: 1.5, seed,
    mods: (): Mods => {
      const woven = S.weaveUntil > sim.t ? S.woven : new Set<El>();
      const perfect = S.perfectUntil > sim.t;
      const rage = S.rageUntil > sim.t;
      return {
        power: basePower + (has("fire") ? 150 + 200 : 0),
        conditionDamage: baseCd + (has("earth") ? 200 : 0),
        critChance: st.critChance + 25 + 20 + (g.critPct ?? 0), // fury, Superior Elements (the golem is weakened)
        critDamage: st.critDamage, conditionDuration: st.conditionDuration,
        strikePct: 5 + 7 + (rage ? 15 : 0) + (woven.has("air") || perfect ? 10 : 0) + (g.strikePct ?? 0), // Serrated Stones, Pyromancer's Training (target always bleeding and burning)
        condDmgPct: (g.condDmgPct ?? 0) + (rage ? 10 : 0) + (woven.has("fire") || perfect ? 20 : 0), // Elements of Rage, Woven Fire
        perCond: { burning: 20 + (g.perCond?.burning ?? 0), bleeding: 20 + (g.perCond?.bleeding ?? 0), torment: g.perCond?.torment ?? 0, poison: g.perCond?.poison ?? 0, confusion: g.perCond?.confusion ?? 0 },
      };
    },
  });
  if (g.onStrike) sim.onStrike = (c, h) => g.onStrike!(sim, c, h);
  const CAST: Record<string, number> = { pebble: 0.52, scorch: 0.52, ricochet: 0.52, salvo: 0.68, stone: 0.52, boulder: 0.44, meteor: 0.48, erosion: 0.48, enervating: 0.56, fusillade: 0.52, flurry: 1.0, plasma: 0.64, dazing: 0.36, exposure: 0.04, wildfire: 0.68, dust: 0.84, orb: 0.44, sfire: 0.52, searth: 0.52, weave: 0.8 };
  const CD: Record<string, number> = { ricochet: 6 * 0.8, salvo: 12 * 0.8, stone: 6, boulder: 12, meteor: 12, erosion: 15, enervating: 12, fusillade: 15, flurry: 5, plasma: 12 * 0.8, dazing: 8, wildfire: 30 * 0.8, dust: 30, orb: 25, sfire: 12, searth: 15, weave: 90, unravel: 25 };

  const bleed = (tag: string, stacks: number, dur: number) => {
    const before = sim.stacksOf("bleeding");
    sim.condition(tag, "bleeding", stacks, dur);
    if (before >= 6) sim.proc("Relic of the Fractal", 20, () => { sim.condition("Relic of the Fractal", "burning", 2, 8); sim.condition("Relic of the Fractal", "torment", 3, 8); });
  };
  const immobilize = () => sim.proc("Strength of Stone", 3, () => bleed("Strength of Stone", 3, 10));
  /** A hit that can crit: Burning Precision (33% of crits burn for 3 s, 5 s cooldown) and Shattering Stone's enhanced attacks. */
  const hit = (tag: string, weapon: string, coefficient: number, count = 1, noCrit = false) => {
    const crits = sim.strike(tag, { weapon, coefficient, count, noCrit });
    for (let i = 0; i < count; i++) {
      if ((sim.procAt["Burning Precision"] ?? -Infinity) <= sim.t && sim.random() < (crits / count) * 0.33) sim.proc("Burning Precision", 5, () => sim.condition("Burning Precision", "burning", 1, 3));
      if (S.enhanced > 0) { S.enhanced--; bleed("Shattering Stone", 1, 5); }
    }
  };
  function attune(main: El, off: El) {
    const prevMain = S.main, prevOff = S.off;
    const leavingFire = (prevMain === "fire" || prevOff === "fire") && main !== "fire" && off !== "fire";
    S.main = main; S.off = off;
    if (main === off) S.rageUntil = sim.t + 8; // Elements of Rage
    // The attune-to-element minors fire on every press of that element, including attuning fully (log: Sunspot 16 = every fire press).
    if (main === "fire") { hit("Sunspot", "Utility", 0.6, 1, true); sim.condition("Sunspot", "burning", 2, 4); S.fireAuraUntil = sim.t + 3; }
    if (main === "earth") hit("Earthen Blast", "Utility", 0.36, 1, true);
    if (main === "air") hit("Electric Exposure", "Pistol", 0.33);
    if (leavingFire) sim.schedule(sim.t + 0.5, () => { hit("Flame Expulsion", "Utility", 2.0); sim.condition("Flame Expulsion", "burning", 1, 7); });
    if (S.weaveUntil > sim.t) {
      S.woven.add(main); S.touched.add(main);
      if (S.touched.size === 4) { S.weaveUntil = -1; S.perfectUntil = sim.t + 10; sim.count("Perfect Weave"); }
    }
  }
  const bullet = (kind: "fire" | "earth" | "ice" | "air"): boolean => { if (S.bullets[kind] > 0) { S.bullets[kind] = 0; return true; } S.bullets[kind] = 1; return false; };

  const SK: Record<string, { dur: number; cd?: string; fn: () => void }> = {
    scorch: { dur: CAST.scorch, fn: () => { hit("Scorching Shot", "Pistol", 0.3); sim.condition("Scorching Shot", "burning", 1, 1.5); } },
    pebble: { dur: CAST.pebble, fn: () => { hit("Piercing Pebble", "Pistol", 0.35); bleed("Piercing Pebble", 1, 5); } },
    ricochet: { dur: CAST.ricochet, cd: "ricochet", fn: () => { hit("Raging Ricochet", "Pistol", 0.8); bullet("fire"); } },
    salvo: { dur: CAST.salvo, cd: "salvo", fn: () => { hit("Searing Salvo", "Pistol", 1.0); hit("Searing Salvo", "Pistol", 0.25); if (bullet("fire")) S.fireAuraUntil = sim.t + 4; } },
    stone: { dur: CAST.stone, cd: "stone", fn: () => { hit("Shattering Stone", "Pistol", 0.8); bleed("Shattering Stone", 3, 10); if (bullet("earth")) S.enhanced = 3; } },
    boulder: { dur: CAST.boulder, cd: "boulder", fn: () => { hit("Boulder Blast", "Pistol", 0.44); bleed("Boulder Blast", 5, 8); immobilize(); bullet("earth"); } },
    meteor: { dur: CAST.meteor, cd: "meteor", fn: () => { hit("Molten Meteor", "Pistol", 0.5); sim.condition("Molten Meteor", "burning", 1, 8); bleed("Molten Meteor", 2, 8); if (bullet("earth")) bleed("Molten Meteor", 3, 8); if (S.bullets.fire) S.bullets.fire = 0; } },
    erosion: { dur: CAST.erosion, cd: "erosion", fn: () => { hit("Echoing Erosion", "Pistol", 0.3, 2); bleed("Echoing Erosion", 2, 8); if (S.bullets.ice) S.bullets.ice = 0; else if (S.bullets.earth) S.bullets.earth = 0; } },
    enervating: { dur: CAST.enervating, cd: "enervating", fn: () => { hit("Enervating Earth", "Pistol", 0.7); if (S.bullets.earth) { S.bullets.earth = 0; bleed("Enervating Earth", 4, 8); } } },
    fusillade: { dur: CAST.fusillade, cd: "fusillade", fn: () => { hit("Frozen Fusillade", "Pistol", 0.75); if (bullet("ice")) { sim.schedule(sim.t + 4, () => { hit("Frozen Fusillade", "Pistol", 0.75); bleed("Frozen Fusillade", 5, 8); }); } } },
    flurry: { dur: CAST.flurry, cd: "flurry", fn: () => { hit("Frigid Flurry", "Pistol", 0.2, 5); bullet("ice"); } },
    plasma: { dur: CAST.plasma, cd: "plasma", fn: () => { hit("Purblinding Plasma", "Pistol", 0.8); if (S.bullets.fire) { S.bullets.fire = 0; sim.every(sim.t + 0.5, 1, 3, () => sim.condition("Purblinding Plasma", "burning", 1, 4)); } } },
    dazing: { dur: CAST.dazing, cd: "dazing", fn: () => { hit("Dazing Discharge", "Pistol", 0.75); bullet("air"); } },
    exposure: { dur: CAST.exposure, fn: () => {} },
    wildfire: { dur: CAST.wildfire, cd: "wildfire", fn: () => sim.every(sim.t + CAST.wildfire, 1, 8, () => { hit("Wildfire", "Warhorn", 0.44); sim.condition("Wildfire", "burning", 1, 3); }) },
    dust: { dur: CAST.dust, cd: "dust", fn: () => sim.every(sim.t + CAST.dust, 1, 5, () => { hit("Dust Storm", "Warhorn", 0.3); bleed("Dust Storm", 2, 10); }) },
    orb: { dur: CAST.orb, cd: "orb", fn: () => sim.every(sim.t + CAST.orb, 0.25, 10, (i) => hit("Lightning Orb", "Warhorn", 0.8 * Math.max(0.05, 1 - 0.1 * i))) },
    sfire: { dur: CAST.sfire, cd: "sfire", fn: () => { hit("Signet of Fire", "Utility", 0.5); sim.condition("Signet of Fire", "burning", 2, 10); S.fireAuraUntil = sim.t + 4; } },
    searth: { dur: CAST.searth, cd: "searth", fn: () => { hit("Signet of Earth", "Utility", 0.5); bleed("Signet of Earth", 4, 9); immobilize(); } },
    primordial: { dur: 0, fn: () => {
      if (S.primordial <= 0) return; S.primordial--; if (S.primordialNextAt < sim.t) S.primordialNextAt = sim.t; S.primordialNextAt += 20 / sim.alacrity;
      // Five pulses, one second apart starting a second after the cast, each reading the attunements at that moment (log timing).
      sim.every(sim.t + 1, 1, 5, () => {
        hit("Primordial Stance", "Utility", 0.33);
        for (const e of S.main === S.off ? [S.main, S.main] : [S.main, S.off]) { if (e === "fire") sim.condition("Primordial Stance", "burning", 1, 2); if (e === "earth") bleed("Primordial Stance", 2, 6); }
      });
    } },
    weave: { dur: CAST.weave, cd: "weave", fn: () => { S.weaveUntil = sim.t + 20; S.woven = new Set(); S.touched = new Set(); } },
    unravel: { dur: 0, cd: "unravel", fn: () => attune(S.main, S.main) },
    "attune:fire:earth": { dur: 0, fn: () => attune("fire", "earth") }, "attune:earth:fire": { dur: 0, fn: () => attune("earth", "fire") },
    "attune:fire:fire": { dur: 0, fn: () => attune("fire", "fire") }, "attune:earth:earth": { dur: 0, fn: () => attune("earth", "earth") },
    "attune:water:earth": { dur: 0, fn: () => attune("water", "earth") }, "attune:water:water": { dur: 0, fn: () => attune("water", "water") },
    "attune:air:earth": { dur: 0, fn: () => attune("air", "earth") }, "attune:fire:air": { dur: 0, fn: () => attune("fire", "air") },
  };
  const BY_ID: Record<number, string> = { 71929: "scorch", 71893: "pebble", 71828: "ricochet", 71940: "salvo", 72032: "stone", 71842: "boulder", 71993: "meteor", 72062: "erosion", 72023: "enervating", 71935: "fusillade", 72028: "flurry", 71898: "plasma", 71966: "dazing", 71904: "exposure", 29533: "wildfire", 30336: "dust", 30795: "orb", 5542: "sfire", 5571: "searth", 40183: "primordial", 43638: "weave", 80231: "unravel", [-7]: "attune:fire:earth", [-14]: "attune:earth:fire", 43470: "attune:fire:fire", 44857: "attune:earth:earth", [-10]: "attune:water:earth", 41166: "attune:water:water", [-13]: "attune:air:earth", [-6]: "attune:fire:air" };

  function fire(key: string) { tickAmmo(); const s = SK[key]; s.fn(); sim.count(key); if (s.cd) sim.recharge(s.cd, CD[s.cd]); }
  function tickAmmo() { while (S.primordial < 2 && S.primordialNextAt <= sim.t) { S.primordial++; S.primordialNextAt += 20 / sim.alacrity; } }
  const swapCd = () => (S.weaveUntil > sim.t ? 2 : 4) / sim.alacrity;
  const attuneReady: Record<El, number> = { fire: 0, water: 0, air: 0, earth: 0 };
  function swap(e: El) {
    if (attuneReady[e] > sim.t) sim.advance(attuneReady[e]);
    const full = S.main === e;
    attune(e, full ? e : S.main);
    attuneReady[e] = sim.t + swapCd();
  }
  function doCast(key: string) {
    tickAmmo();
    const s = SK[key];
    if (s.cd && !sim.ready(s.cd)) sim.advance(sim.readyAt[s.cd]);
    fire(key); sim.advance(sim.t + s.dur); utilities();
  }
  function utilities() { tickAmmo(); if (sim.ready("sfire")) fire("sfire"); if (sim.ready("searth")) fire("searth"); if (S.primordial > 0 && (S.main === "fire" || S.main === "earth")) fire("primordial"); }
  function rotation(seconds: number) {
    // Snow Crows loop (lib/gw2/builds/condition-weaver.ts) with Weave Self on cooldown; the opener is approximated by the loop.
    attune("earth", "earth"); // bullets are pre-loaded
    while (sim.t < seconds) {
      if (sim.ready("weave")) doCast("weave");
      swap("fire"); if (sim.ready("wildfire")) doCast("wildfire"); swap("fire"); doCast("ricochet"); doCast("salvo");
      swap("earth"); if (sim.ready("dust")) doCast("dust"); swap("earth"); doCast("boulder"); doCast("stone");
      swap("fire"); doCast("meteor"); doCast("ricochet");
      swap("fire"); doCast("salvo"); doCast("ricochet");
      swap("earth"); doCast("stone"); doCast("meteor");
      swap("earth"); doCast("boulder"); doCast("stone");
      swap("water"); doCast("erosion"); if (sim.ready("unravel")) fire("unravel"); else swap("water");
      if (S.bullets.ice) { doCast("fusillade"); doCast("flurry"); } else { doCast("flurry"); doCast("fusillade"); }
    }
  }
  return {
    name: "Condition Weaver", sim, prepull: [{ t: -1.2, key: "primordial" }, { t: -0.2, key: "primordial" }], // both stance charges are used before the pull (effect active at t=0 in the log)
    cast(id) { const key = typeof id === "number" ? BY_ID[id] : id; if (!key) return false; fire(key); return true; },
    rotation,
  };
}
