import skillsJson from "./data/skills.json";
import traitsJson from "./data/traits.json";
import specsJson from "./data/specs.json";
import itemsJson from "./data/items.json";
import { BASE, type Attr, type Attrs, type Prefix, slotAttrs, critChance, critDamage, conditionDurationFromExpertise, strike, expectCrit, conditionTotal, type Condition } from "./stats";

export type Fact = { type: string; text?: string; value?: number; duration?: number; apply_count?: number; status?: string; dmg_multiplier?: number; hit_count?: number; percent?: number; icon?: string };
export interface Skill { id: number; name: string; icon: string; description: string; type?: string; slot?: string; attunement?: string; dual_attunement?: string; facts?: Fact[] }
export interface Trait { id: number; name: string; icon: string; description: string; specialization: number; tier: number; slot: string; facts?: Fact[] }
export interface Spec { id: number; name: string; elite: boolean; icon: string; background: string; minor_traits: number[]; major_traits: number[] }
export interface Item { id: number; name: string; icon: string; type: string; rarity: string; details?: Record<string, unknown> }

export const SKILLS = skillsJson as unknown as Record<string, Skill>;
export const TRAITS = traitsJson as unknown as Record<string, Trait>;
export const SPECS = specsJson as unknown as Record<string, Spec>;
export const ITEMS = itemsJson as unknown as Record<string, Item>;
export const skill = (id: number) => SKILLS[String(id)];
export const trait = (id: number) => TRAITS[String(id)];
export const spec = (id: number) => SPECS[String(id)];
export const item = (id: number) => ITEMS[String(id)];

export type Attunement = "Fire" | "Water" | "Air" | "Earth";
export type GearSlot = "Helm" | "Shoulders" | "Coat" | "Gloves" | "Leggings" | "Boots" | "Back" | "Accessory1" | "Accessory2" | "Amulet" | "Ring1" | "Ring2" | "MainHand" | "OffHand";
const SLOT_BUDGET: Record<GearSlot, string> = { Helm: "Helm", Shoulders: "Shoulders", Coat: "Coat", Gloves: "Gloves", Leggings: "Leggings", Boots: "Boots", Back: "Back", Accessory1: "Accessory", Accessory2: "Accessory", Amulet: "Amulet", Ring1: "Ring", Ring2: "Ring", MainHand: "OneHand", OffHand: "OneHand" };

export interface GearPiece { slot: GearSlot; prefix: Prefix; icon: string; label: string; weapon?: string; upgrade?: { name: string; icon: string; effect: string } }
export interface Modifier { source: string; attr?: Partial<Attrs>; note?: string; conditionDurationPct?: number; conditionDamagePct?: number; strikeDamagePct?: number; burningDurationPct?: number; bleedingDurationPct?: number; critChancePct?: number; conditional?: string }

export interface RotationStep { attune: string; skill: number | "auto" | "unravel" | "weaveself"; key: string; why: string; optional?: boolean }
export interface RotationPhase { title: string; intro: string; steps: RotationStep[] }

export interface Gw2Build {
  slug: string; name: string; profession: string; specId: number; mode: string; role: "Condition DPS" | "Power DPS" | "Boon DPS" | "Support";
  tagline: string; summary: string;
  benchmark: { max: number; avg: number; date: string; source: string; balance: string };
  difficulty: { tier: "Beginner" | "Intermediate" | "Advanced" | "Expert"; signals: { label: string; value: string; note: string }[] };
  gear: GearPiece[];
  relic: { name: string; icon: string; effect: string };
  infusions: { name: string; count: number; effect: string };
  food: { id: number; effect: string }; utility: { id: number; effect: string }; jadeCore?: { id: number; effect: string };
  traits: { specId: number; choices: [number, number, number] }[]; // 1..3 per tier
  skills: { heal: number; utilities: [number, number, number]; elite: number; swapNote?: string };
  modifiers: Modifier[];
  golem: { might: number; fury: boolean; quickness: boolean; alacrity: boolean };
  keySkills: KeySkill[];
  rotation: RotationPhase[];
  concepts: { title: string; body: string }[];
  sources: { label: string; url: string }[];
}

/** Hand-entered per-cast damage profile for the skills that matter (wiki skill facts, PvE values). */
export interface KeySkill {
  id: number | "auto"; label?: string; weapon: string; castTime: number; recharge: number; attune: string;
  hits: { coefficient: number; count?: number; note?: string }[];
  conditions: { kind: Condition; stacks: number; duration: number; note?: string }[];
  note?: string;
}

export interface Computed {
  attrs: Attrs; critChance: number; critDamage: number; conditionDuration: number; vitalityHp: number;
  boonCritChance: number; // with fury
  rows: { skill: KeySkill; name: string; icon: string; strikeDmg: number; condDmg: number; total: number; perSecond: number }[];
}

export function computeBuild(b: Gw2Build): Computed {
  const attrs: Attrs = { ...BASE };
  for (const g of b.gear) for (const [k, v] of Object.entries(slotAttrs(SLOT_BUDGET[g.slot], g.prefix))) attrs[k as Attr] += v ?? 0;
  const condDurFlat: number[] = []; let condDmgPct = 0; let strikePct = 0; let burnDur = 0; let bleedDur = 0;
  for (const m of b.modifiers) {
    if (m.attr) for (const [k, v] of Object.entries(m.attr)) attrs[k as Attr] += v ?? 0;
    if (m.conditionDurationPct) condDurFlat.push(m.conditionDurationPct);
    if (m.conditionDamagePct && !m.conditional) condDmgPct += m.conditionDamagePct;
    if (m.strikeDamagePct && !m.conditional) strikePct += m.strikeDamagePct;
    if (m.burningDurationPct) burnDur += m.burningDurationPct;
    if (m.bleedingDurationPct) bleedDur += m.bleedingDurationPct;
  }
  // derived-from-attribute sources (Potent Master Tuning Crystal, Strength of Stone) are applied after flat sums
  attrs.conditionDamage += Math.floor(0.03 * (attrs.precision - 180)) + Math.floor(0.08 * attrs.expertise); // crystal: Snow Crows' figure matches precision before the signet
  attrs.conditionDamage += Math.floor(0.1 * attrs.toughness); // Strength of Stone
  const baseCrit = critChance(attrs.precision);
  const condDur = conditionDurationFromExpertise(attrs.expertise) + condDurFlat.reduce((a, x) => a + x, 0);
  const might = b.golem.might;
  const power = attrs.power + 30 * might;
  const cd = attrs.conditionDamage + 30 * might;
  const boonCrit = Math.min(100, baseCrit + (b.golem.fury ? 25 : 0));
  const cdm = critDamage(attrs.ferocity);
  const rows = b.keySkills.map((s) => {
    const strikeDmg = s.hits.reduce((acc, h) => acc + expectCrit(strike(s.weapon, power, h.coefficient), boonCrit, cdm) * (h.count ?? 1), 0) * (1 + strikePct / 100);
    const condDmg = s.conditions.reduce((acc, c) => acc + conditionTotal(c.kind, cd, c.stacks, c.duration, condDur + (c.kind === "burning" ? burnDur : c.kind === "bleeding" ? bleedDur : 0)), 0) * (1 + condDmgPct / 100);
    const sk = s.id === "auto" ? undefined : skill(s.id);
    const total = strikeDmg + condDmg;
    return { skill: s, name: s.label ?? sk?.name ?? "", icon: sk?.icon ?? "", strikeDmg, condDmg, total, perSecond: total / Math.max(0.5, s.castTime) };
  });
  return { attrs, critChance: baseCrit, critDamage: cdm, conditionDuration: condDur, vitalityHp: attrs.vitality * 10 + 1645, boonCritChance: boonCrit, rows };
}
