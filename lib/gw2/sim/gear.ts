/**
 * Gear candidates for the optimiser. Sources: API itemstats (prefixes, data/prefixes.json), wiki item pages for runes,
 * sigils, foods, utilities (bonus lines quoted in the `effect` strings). Only effects the simulator can model are listed.
 */
import prefixesJson from "../data/prefixes.json";
import { BASE, SLOT_ADJUST, type Attr, type Attrs, type Prefix, slotAttrs, critChance, critDamage, conditionDurationFromExpertise } from "../stats";
import type { Sim } from "./engine";
import type { GearMods } from "./chrono";

type Cond = "burning" | "bleeding" | "torment" | "confusion" | "poison";
type PrefixPair = { armor: { id: number; attrs: { attr: Attr; multiplier: number; value: number }[] }; trinket: { id: number; attrs: { attr: Attr; multiplier: number; value: number }[] } };
export const PREFIXES = prefixesJson as unknown as Record<string, PrefixPair>;
export const PREFIX_NAMES = Object.keys(PREFIXES);

export interface Rune { name: string; attr?: Partial<Attrs>; conditionDurationPct?: number; perCond?: Partial<Record<Cond, number>>; effect: string }
export const RUNES: Rune[] = [
  { name: "Trapper", attr: { conditionDamage: 300 }, conditionDurationPct: 15, effect: "+300 Condition Damage, +15% Condition Duration" },
  { name: "Nightmare", attr: { conditionDamage: 175 }, conditionDurationPct: 20, effect: "+175 Condition Damage, +20% Condition Duration" },
  { name: "Krait", attr: { conditionDamage: 175 }, perCond: { bleeding: 50 }, effect: "+175 Condition Damage, +50% bleeding duration" },
  { name: "Tormenting", attr: { conditionDamage: 175 }, perCond: { torment: 50 }, effect: "+175 Condition Damage, +50% torment duration" },
  { name: "Balthazar", attr: { conditionDamage: 175 }, perCond: { burning: 50 }, effect: "+175 Condition Damage, +50% burning duration" },
  { name: "Perplexity", attr: { conditionDamage: 175 }, perCond: { confusion: 50 }, effect: "+175 Condition Damage, +50% confusion duration" },
  { name: "Afflicted", attr: { conditionDamage: 175 }, conditionDurationPct: 10, perCond: { bleeding: 20, poison: 10 }, effect: "+175 Condition Damage, +10% Condition Duration, +20% bleeding, +10% poison duration" },
  { name: "Renegade", attr: { conditionDamage: 300, ferocity: 100 }, effect: "+300 Condition Damage, +100 Ferocity" },
  { name: "Berserker", attr: { conditionDamage: 300, power: 100 }, effect: "+300 Condition Damage, +100 Power" },
  { name: "Necromancer", attr: { conditionDamage: 300, vitality: 100 }, effect: "+300 Condition Damage, +100 Vitality" },
  { name: "Elementalist", attr: { power: 175, conditionDamage: 225 }, effect: "+175 Power, +225 Condition Damage" },
  { name: "Undead", attr: { conditionDamage: 175, toughness: 225 }, effect: "+175 Condition Damage, +225 Toughness" },
  { name: "Mad King", attr: { power: 175 }, conditionDurationPct: 5, perCond: { bleeding: 40 }, effect: "+175 Power, +5% Condition Duration, +40% bleeding duration" },
  { name: "Flame Legion", attr: { power: 175 }, perCond: { burning: 50 }, effect: "+175 Power, +50% burning duration" },
  { name: "Lich", attr: { vitality: 175 }, conditionDurationPct: 25, effect: "+175 Vitality, +25% Condition Duration" },
  { name: "Weaver", attr: { power: 36, precision: 36, toughness: 36, vitality: 36, ferocity: 36, conditionDamage: 36, expertise: 36, concentration: 36, healingPower: 36 }, conditionDurationPct: 10, perCond: { burning: 10 }, effect: "+36 to all attributes, +10% Condition Duration, +10% burning duration" },
  { name: "Scholar", attr: { power: 175, ferocity: 225 }, effect: "+175 Power, +225 Ferocity" },
];

export interface Sigil { name: string; conditionDurationPct?: number; perCond?: Partial<Record<Cond, number>>; condDmgPct?: number; strikePct?: number; critPct?: number; onStrike?: (sim: Sim, crits: number) => void; effect: string }
export const SIGILS: Sigil[] = [
  { name: "Bursting", condDmgPct: 5, effect: "+5% condition damage" },
  { name: "Malice", conditionDurationPct: 10, effect: "+10% condition duration" },
  { name: "Demons", perCond: { torment: 20 }, effect: "+20% torment duration" },
  { name: "Smoldering", perCond: { burning: 20 }, effect: "+20% burning duration" },
  { name: "Agony", perCond: { bleeding: 20 }, effect: "+20% bleeding duration" },
  { name: "Venom", perCond: { poison: 20 }, effect: "+20% poison duration" },
  { name: "Force", strikePct: 5, effect: "+5% strike damage" },
  { name: "Accuracy", critPct: 7, effect: "+7% critical chance" },
  { name: "Earth", effect: "bleeding for 6 s on critical hit, 2 s cooldown", onStrike: (sim, crits) => { if (crits > 0 && (sim.procAt["Sigil of Earth"] ?? -1) <= sim.t) { sim.procAt["Sigil of Earth"] = sim.t + 2; sim.condition("Sigil of Earth", "bleeding", Math.min(1, crits), 6); } } },
  { name: "Torment", effect: "2 torment for 5 s on critical hit, 5 s cooldown", onStrike: (sim, crits) => { if (crits > 0 && (sim.procAt["Sigil of Torment"] ?? -1) <= sim.t) { sim.procAt["Sigil of Torment"] = sim.t + 5; sim.condition("Sigil of Torment", "torment", 2 * Math.min(1, crits), 5); } } },
];

export interface Food { name: string; attr?: Partial<Attrs>; perCond?: Partial<Record<Cond, number>>; effect: string }
export const FOODS: Food[] = [
  { name: "Cilantro and Cured Meat Flatbread", attr: { conditionDamage: 100, expertise: 70 }, effect: "+100 Condition Damage, +70 Expertise" },
  { name: "Salsa-Topped Veggie Flatbread", attr: { expertise: 100, conditionDamage: 70 }, effect: "+100 Expertise, +70 Condition Damage" },
  { name: "Rare Veggie Pizza", attr: { expertise: 100, conditionDamage: 70 }, effect: "+100 Expertise, +70 Condition Damage" },
  { name: "Plate of Beef Rendang", attr: { conditionDamage: 100, expertise: 70 }, effect: "+100 Condition Damage, +70 Expertise" },
  { name: "Plate of Fire Flank Steak", attr: { power: 100, conditionDamage: 70 }, effect: "+100 Power, +70 Condition Damage" },
  { name: "Bowl of Fancy Potato and Leek Soup", attr: { precision: 100, conditionDamage: 70 }, effect: "+100 Precision, +70 Condition Damage" },
  { name: "Bowl of Fire Meat Chili", attr: { precision: 70 }, perCond: { burning: 15 }, effect: "+15% burning duration, +70 Precision" },
  { name: "Spherified Sesame Oyster Soup", attr: { power: 45, precision: 45, toughness: 45, vitality: 45, ferocity: 45, conditionDamage: 45, expertise: 45, concentration: 45, healingPower: 45 }, effect: "+45 to all attributes" },
];

export interface Utility { name: string; derived?: { to: Attr; from: Attr; pct: number }[]; attr?: Partial<Attrs>; effect: string; note?: string }
export const UTILITIES: Utility[] = [
  { name: "Toxic Tuning Crystal", derived: [{ to: "conditionDamage", from: "power", pct: 3 }, { to: "conditionDamage", from: "precision", pct: 3 }], effect: "Condition Damage from 3% of Power and 3% of Precision" },
  { name: "Potent Master Tuning Crystal", derived: [{ to: "conditionDamage", from: "precision", pct: 3 }, { to: "conditionDamage", from: "expertise", pct: 8 }], effect: "Condition Damage from 3% of Precision and 8% of Expertise" },
  { name: "Furious Tuning Crystal", derived: [{ to: "conditionDamage", from: "precision", pct: 3 }, { to: "expertise", from: "precision", pct: 3 }], effect: "Condition Damage and Expertise from 3% of Precision each" },
  { name: "Magnanimous Tuning Crystal", derived: [{ to: "conditionDamage", from: "vitality", pct: 3 }, { to: "conditionDamage", from: "toughness", pct: 3 }], effect: "Condition Damage from 3% of Vitality and 3% of Toughness" },
  { name: "Writ of Masterful Malice", attr: { conditionDamage: 200 }, effect: "+200 Condition Damage while above 90% health", note: "the golem never hits you; on a real boss it drops out whenever you take damage" },
  { name: "Toxic Sharpening Stone", derived: [{ to: "power", from: "conditionDamage", pct: 6 }, { to: "power", from: "expertise", pct: 8 }], effect: "Power from 6% of Condition Damage and 8% of Expertise" },
];

export const INFUSIONS = { Malign: { conditionDamage: 5 }, Spiteful: { expertise: 5 }, Mighty: { power: 5 }, Precise: { precision: 5 } } as const;

export type Slot = "Helm" | "Shoulders" | "Coat" | "Gloves" | "Leggings" | "Boots" | "Back" | "Accessory1" | "Accessory2" | "Amulet" | "Ring1" | "Ring2" | "Weapon";
export const SLOTS: Slot[] = ["Helm", "Shoulders", "Coat", "Gloves", "Leggings", "Boots", "Back", "Accessory1", "Accessory2", "Amulet", "Ring1", "Ring2", "Weapon"];
const BUDGET: Record<Slot, string> = { Helm: "Helm", Shoulders: "Shoulders", Coat: "Coat", Gloves: "Gloves", Leggings: "Leggings", Boots: "Boots", Back: "Back", Accessory1: "Accessory", Accessory2: "Accessory", Amulet: "Amulet", Ring1: "Ring", Ring2: "Ring", Weapon: "TwoHand" };
const TRINKET = new Set<Slot>(["Back", "Accessory1", "Accessory2", "Amulet", "Ring1", "Ring2"]);

export interface GearConfig { prefixes: Record<Slot, string>; rune: string; sigils: [string, string]; food: string; utility: string; infusions: { malign: number; spiteful: number; mighty: number; precise: number } }

/** Everything that is not gear: trait and signet attributes, jade core, and the trait-side derived terms (Strength of Stone). */
export interface BuildSide { attr: Partial<Attrs>; toughnessToCondPct?: number; derivedOffsets?: Partial<Record<Attr, number>> }

export interface GearResult { attrs: Attrs; critChance: number; critDamage: number; conditionDuration: number; gear: GearMods }

/** Attributes and simulator modifiers for a gear configuration, following computeBuild's order of operations. */
export function evaluateGear(cfg: GearConfig, side: BuildSide): GearResult {
  const attrs: Attrs = { ...BASE };
  for (const s of SLOTS) {
    const p = PREFIXES[cfg.prefixes[s]]; const def = TRINKET.has(s) ? p.trinket : p.armor;
    const prefix: Prefix = { name: cfg.prefixes[s], attrs: def.attrs };
    for (const [k, v] of Object.entries(slotAttrs(BUDGET[s], prefix))) attrs[k as Attr] += v ?? 0;
  }
  const rune = RUNES.find((r) => r.name === cfg.rune)!; const food = FOODS.find((f) => f.name === cfg.food)!; const util = UTILITIES.find((u) => u.name === cfg.utility)!;
  const sigils = cfg.sigils.map((n) => SIGILS.find((s) => s.name === n)!);
  for (const src of [rune.attr, food.attr, util.attr, side.attr]) for (const [k, v] of Object.entries(src ?? {})) attrs[k as Attr] += v ?? 0;
  attrs.conditionDamage += 5 * cfg.infusions.malign; attrs.expertise += 5 * cfg.infusions.spiteful; attrs.power += 5 * cfg.infusions.mighty; attrs.precision += 5 * cfg.infusions.precise;
  for (const d of util.derived ?? []) attrs[d.to] += Math.round((d.pct / 100) * (attrs[d.from] + (side.derivedOffsets?.[d.from] ?? 0)));
  if (side.toughnessToCondPct) attrs.conditionDamage += Math.floor((side.toughnessToCondPct / 100) * attrs.toughness);
  const perCond: Partial<Record<Cond, number>> = {};
  const add = (m?: Partial<Record<Cond, number>>) => { for (const [k, v] of Object.entries(m ?? {})) perCond[k as Cond] = (perCond[k as Cond] ?? 0) + (v ?? 0); };
  add(rune.perCond); add(food.perCond); for (const s of sigils) add(s.perCond);
  const condDur = conditionDurationFromExpertise(attrs.expertise) + (rune.conditionDurationPct ?? 0) + sigils.reduce((a, s) => a + (s.conditionDurationPct ?? 0), 0);
  const hooks = sigils.filter((s) => s.onStrike);
  return {
    attrs, critChance: critChance(attrs.precision), critDamage: critDamage(attrs.ferocity), conditionDuration: condDur,
    gear: { perCond, condDmgPct: sigils.reduce((a, s) => a + (s.condDmgPct ?? 0), 0), strikePct: sigils.reduce((a, s) => a + (s.strikePct ?? 0), 0), critPct: sigils.reduce((a, s) => a + (s.critPct ?? 0), 0), onStrike: hooks.length ? (sim, crits) => hooks.forEach((h) => h.onStrike!(sim, crits)) : undefined },
  };
}

export const uniform = (prefix: string): Record<Slot, string> => Object.fromEntries(SLOTS.map((s) => [s, prefix])) as Record<Slot, string>;
export { SLOT_ADJUST };
