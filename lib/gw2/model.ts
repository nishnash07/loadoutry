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
export type GearSlot = "Helm" | "Shoulders" | "Coat" | "Gloves" | "Leggings" | "Boots" | "Back" | "Accessory1" | "Accessory2" | "Amulet" | "Ring1" | "Ring2" | "MainHand" | "OffHand" | "TwoHand";
const SLOT_BUDGET: Record<GearSlot, string> = { Helm: "Helm", Shoulders: "Shoulders", Coat: "Coat", Gloves: "Gloves", Leggings: "Leggings", Boots: "Boots", Back: "Back", Accessory1: "Accessory", Accessory2: "Accessory", Amulet: "Amulet", Ring1: "Ring", Ring2: "Ring", MainHand: "OneHand", OffHand: "OneHand", TwoHand: "TwoHand" };
/** Base health at level 80 before vitality (wiki "Health"). */
const BASE_HP: Record<string, number> = { Elementalist: 1645, Guardian: 1645, Thief: 1645, Mesmer: 5922, Engineer: 5922, Ranger: 5922, Revenant: 5922, Warrior: 9212, Necromancer: 9212 };

/** `set: 2` marks the second weapon set; only set 1 counts toward attributes. */
export interface GearPiece { slot: GearSlot; prefix: Prefix; icon: string; label: string; weapon?: string; set?: 1 | 2; upgrade?: { name: string; icon: string; effect: string }; upgrade2?: { name: string; icon: string; effect: string } }
export interface Modifier {
  source: string; attr?: Partial<Attrs>; note?: string;
  conditionDurationPct?: number; conditionDamagePct?: number; strikeDamagePct?: number; critChancePct?: number;
  conditionDurationBonus?: Partial<Record<Condition, number>>; // per-condition duration bonus, additive with Condition Duration under the 100% cap
  conditionDamageFromToughnessPct?: number; // Strength of Stone
  derivedConditionDamage?: { attr: Attr; pct: number; offset?: number }[]; // tuning crystals: Condition Damage from a share of another attribute
  conditional?: string; // present only some of the time: shown, not counted
}

/** `attune` is the attunement pair (Elementalist) or the weapon set / state label (other professions). */
export interface RotationStep { attune: string; skill: number | "auto" | "unravel" | "weaveself" | "swap"; key: string; why: string; optional?: boolean }
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
  /** Professions without attunements: weapon sets for the skill bar and the F1..F5 mechanic row. */
  bar?: { sets: { label: string; skills: (number | undefined)[] }[]; mechanic: number[]; mechanicLabel: string; swapNote: string };
  states?: Record<string, string>; // colours for rotation state labels (attunements are built in)
  heroNote: string; damageNote: string;
  modifiers: Modifier[];
  golem: { might: number; fury: boolean; quickness: boolean; alacrity: boolean; vulnerability: number };
  keySkills: KeySkill[];
  rotation: RotationPhase[];
  concepts: { title: string; body: string }[];
  log?: { url: string; dps: number; seconds: number; shares: { label: string; damage: number; note?: string }[]; casts: { skill: number | string; count: number }[] };
  sources: { label: string; url: string }[];
}

/** Hand-entered per-cast damage profile for the skills that matter (wiki skill facts, PvE values). */
export interface KeySkill {
  id: number | "auto"; label?: string; weapon: string; castTime: number; recharge: number; attune: string;
  hits: { coefficient: number; count?: number; note?: string; weapon?: string }[];
  conditions: { kind: Condition; stacks: number; duration: number; note?: string; onCrit?: boolean }[]; // onCrit: one application per critical hit, so stacks × crit chance
  note?: string;
}

export interface Computed {
  attrs: Attrs; critChance: number; critDamage: number; conditionDuration: number; vitalityHp: number;
  boonCritChance: number; // with fury and permanent crit-chance traits
  rows: { skill: KeySkill; name: string; icon: string; strikeDmg: number; condDmg: number; total: number; perSecond: number }[];
}

export function computeBuild(b: Gw2Build): Computed {
  const attrs: Attrs = { ...BASE };
  for (const g of b.gear) if (g.set !== 2) for (const [k, v] of Object.entries(slotAttrs(SLOT_BUDGET[g.slot], g.prefix))) attrs[k as Attr] += v ?? 0;
  let condDurFlat = 0; let condDmgPct = 0; let strikePct = 0; let critPct = 0; const perCond: Partial<Record<Condition, number>> = {};
  for (const m of b.modifiers) {
    if (m.attr) for (const [k, v] of Object.entries(m.attr)) attrs[k as Attr] += v ?? 0;
    if (m.conditional) continue;
    condDurFlat += m.conditionDurationPct ?? 0; condDmgPct += m.conditionDamagePct ?? 0; strikePct += m.strikeDamagePct ?? 0; critPct += m.critChancePct ?? 0;
    for (const [k, v] of Object.entries(m.conditionDurationBonus ?? {})) perCond[k as Condition] = (perCond[k as Condition] ?? 0) + (v ?? 0);
  }
  // derived-from-attribute sources are applied after the flat sums; rounding matches the Snow Crows attribute panel
  for (const m of b.modifiers) {
    for (const d of m.derivedConditionDamage ?? []) attrs.conditionDamage += Math.round((d.pct / 100) * (attrs[d.attr] + (d.offset ?? 0)));
    if (m.conditionDamageFromToughnessPct) attrs.conditionDamage += Math.floor((m.conditionDamageFromToughnessPct / 100) * attrs.toughness);
  }
  const baseCrit = critChance(attrs.precision);
  const condDur = conditionDurationFromExpertise(attrs.expertise) + condDurFlat;
  const might = b.golem.might;
  const power = attrs.power + 30 * might;
  const cd = attrs.conditionDamage + 30 * might;
  const boonCrit = Math.min(100, baseCrit + (b.golem.fury ? 25 : 0) + critPct);
  const cdm = critDamage(attrs.ferocity);
  const vuln = 1 + b.golem.vulnerability / 100; // vulnerability raises strike and condition damage taken by 1% per stack
  const rows = b.keySkills.map((s) => {
    const strikeDmg = s.hits.reduce((acc, h) => acc + expectCrit(strike(h.weapon ?? s.weapon, power, h.coefficient), boonCrit, cdm) * (h.count ?? 1), 0) * (1 + strikePct / 100) * vuln;
    const condDmg = s.conditions.reduce((acc, c) => acc + conditionTotal(c.kind, cd, c.stacks * (c.onCrit ? boonCrit / 100 : 1), c.duration, condDur + (perCond[c.kind] ?? 0)), 0) * (1 + condDmgPct / 100) * vuln;
    const sk = s.id === "auto" ? undefined : skill(s.id);
    const total = strikeDmg + condDmg;
    return { skill: s, name: s.label ?? sk?.name ?? "", icon: sk?.icon ?? "", strikeDmg, condDmg, total, perSecond: total / Math.max(0.5, s.castTime) };
  });
  return { attrs, critChance: baseCrit, critDamage: cdm, conditionDuration: condDur, vitalityHp: attrs.vitality * 10 + (BASE_HP[b.profession] ?? 1645), boonCritChance: boonCrit, rows };
}
