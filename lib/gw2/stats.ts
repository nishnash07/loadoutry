/**
 * Guild Wars 2 combat maths, level 80 PvE. Sources: GW2 wiki "Damage calculation", "Precision", "Expertise",
 * "Condition Duration"; stat budgets from the official API items/itemstats endpoints.
 */
export const GOLEM_ARMOR = 2597; // Special Forces Training Area heavy golem
export const BASE = { power: 1000, precision: 1000, toughness: 1000, vitality: 1000, ferocity: 0, conditionDamage: 0, expertise: 0, concentration: 0, healingPower: 0 };

export type Attr = keyof typeof BASE;
export type Attrs = Record<Attr, number>;

/** Weapon strength ranges at ascended/legendary quality (wiki "Weapon strength"). */
export const WEAPON_STRENGTH: Record<string, { min: number; max: number }> = {
  Pistol: { min: 920, max: 1080 }, Warhorn: { min: 855, max: 945 }, Dagger: { min: 970, max: 1030 }, Scepter: { min: 940, max: 1060 },
  Sword: { min: 950, max: 1050 }, Focus: { min: 873, max: 927 }, Staff: { min: 1034, max: 1166 }, Hammer: { min: 1034, max: 1166 },
  Utility: { min: 690.5, max: 690.5 }, // utility and elite skills use a fixed 690.5 strength
  Unequipped: { min: 656, max: 725 }, // shatters and other non-weapon profession skills (wiki "Weapon strength")
  "Illusionary Warlock": { min: 2705, max: 3050 }, "Illusionary Duelist": { min: 2406, max: 2825 }, // phantasm strengths, wiki "Phantasm"
};
export const weaponStrength = (w: string) => { const r = WEAPON_STRENGTH[w]; return (r.min + r.max) / 2; };

/** Ascended attribute budget per slot: attribute = round(adjustment × multiplier + value). From API items (attribute_adjustment) and itemstats. */
export const SLOT_ADJUST: Record<string, number> = {
  Helm: 179.256, Shoulders: 134.442, Coat: 403.326, Gloves: 134.442, Leggings: 268.884, Boots: 134.442,
  OneHand: 358.512, TwoHand: 717.024, Amulet: 358.512, Ring: 268.884, Accessory: 224.07, Back: 89.628,
};
export interface Prefix { name: string; attrs: { attr: Attr; multiplier: number; value: number }[] }
/** Viper's: itemstats 1153 (armor/weapons) and 1130 (trinkets/back) */
export const VIPERS_ARMOR: Prefix = { name: "Viper's", attrs: [{ attr: "power", multiplier: 0.3, value: 0 }, { attr: "conditionDamage", multiplier: 0.3, value: 0 }, { attr: "precision", multiplier: 0.165, value: 0 }, { attr: "expertise", multiplier: 0.165, value: 0 }] };
export const VIPERS_TRINKET: Prefix = { name: "Viper's", attrs: [{ attr: "power", multiplier: 0.3, value: 25 }, { attr: "conditionDamage", multiplier: 0.3, value: 25 }, { attr: "precision", multiplier: 0.165, value: 12 }, { attr: "expertise", multiplier: 0.165, value: 12 }] };

export const slotAttrs = (slot: string, prefix: Prefix): Partial<Attrs> => {
  const adj = SLOT_ADJUST[slot];
  const o: Partial<Attrs> = {};
  for (const a of prefix.attrs) o[a.attr] = Math.round(adj * a.multiplier + a.value);
  return o;
};

export const critChance = (precision: number) => 5 + (precision - 1000) / 21; // percent
export const critDamage = (ferocity: number) => 150 + ferocity / 15; // percent
export const conditionDurationFromExpertise = (expertise: number) => expertise / 15; // percent

/** Condition tick damage per second at level 80 PvE (wiki "Damage calculation", intensity formulas). */
export const TICK = {
  burning: (cd: number) => 0.155 * cd + 131,
  bleeding: (cd: number) => 0.06 * cd + 22,
  poison: (cd: number) => 0.06 * cd + 33.5,
  torment: (cd: number) => 0.09 * cd + 31.8, // stationary target (golem)
  confusion: (cd: number) => 0.05 * cd + 18.25, // passive tick per stack per second (PvE); the golem never activates skills
};
/** Confusion's extra hit each time the target activates a skill (PvE, level 80). Not counted on the golem. */
export const CONFUSION_ON_ACTIVATION = (cd: number) => 0.0325 * cd + 16.24;
export type Condition = keyof typeof TICK;

/** Strike damage of one hit against the golem. */
export function strike(weapon: string, power: number, coefficient: number, armor = GOLEM_ARMOR) {
  return (weaponStrength(weapon) * power * coefficient) / armor;
}
/** Expected value of a hit given crit chance (%) and crit damage (%). */
export const expectCrit = (dmg: number, critPct: number, critDmgPct: number) => dmg * (1 + (Math.min(100, Math.max(0, critPct)) / 100) * (critDmgPct / 100 - 1));

/** Total damage of a condition application: stacks × ticks × tick damage, with duration bonus (%) capped at +100%. */
export function conditionTotal(kind: Condition, cd: number, stacks: number, baseDuration: number, durationBonusPct: number) {
  const dur = baseDuration * (1 + Math.min(100, durationBonusPct) / 100);
  return stacks * dur * TICK[kind](cd);
}
