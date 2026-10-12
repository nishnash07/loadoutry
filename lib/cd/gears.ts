/** Abyss gears. Stat gears carry numbers; skill gears carry a trigger. */
export type GearKind = "skill" | "stat";
export interface Gear {
  slug: string;
  name: string;
  kind: GearKind;
  trigger?: string;
  pool?: "Spirit" | "Stamina" | "none";
  effect: string;
  atk?: number; crit?: number; as?: number; ms?: number; def?: number;
  global?: boolean; // stat applies wherever it is socketed (AS/MS/Def) vs weapon-local (Atk/Crit)
  get: string;
}

export const GEARS: Record<string, Gear> = {
  groundsurge: { slug: "groundsurge", name: "Groundsurge", kind: "skill", trigger: "Turning Slash", pool: "Spirit",
    effect: "Shatters the ground in a frontal cone of stone spikes. Hits on impact and again on burst, high stagger, no imbue needed. Roughly 2× Wound of Darkness in a side-by-side wiki test.",
    get: "Extract from Melted Ambition (Myurdin, Chapter 6-7) at a Witch, or craft: Destruction I + Fortification I + Aegis I with the Gear Blueprint." },
  "greysoul-howling": { slug: "greysoul-howling", name: "Greysoul Howling", kind: "skill", trigger: "Turning Slash", pool: "Spirit",
    effect: "Calls Goyen's phantom to repeat the slash as a wide sweep of shadow energy. Stacks with Momentum.",
    get: "Ships in Fated Shadow (Goyen, Nest of Valor, Chapter 9). Craft: Destruction I + Swift I + Haste I + Insight I." },
  "shadow-claw": { slug: "shadow-claw", name: "Shadow Claw", kind: "skill", trigger: "Heavy Attack / Forward Slash", pool: "Stamina",
    effect: "Three forward swipes, Black Fang's own move. Strong single-target damage.",
    get: "Reward of the faction quest Legendary Wolf (Howls from the North Gate). To craft one instead you must first read Gear Blueprint: Shadow Claw (a 2% drop from Exploration Dispatch missions at the Timeworn Ruins or Kingshield Dig Site); the recipe then appears at any Witch's Altar under Craft Abyss Gear and consumes Destruction I + Swift I + Haste I + Vitality I." },
  "crows-pursuit": { slug: "crows-pursuit", name: "Crow's Pursuit", kind: "skill", trigger: "Heavy Attack", pool: "Stamina",
    effect: "A murder of crows homes onto nearby enemies. Average damage, reliable stagger, extra reach.",
    get: "Ships in the Tauria Curved Sword (Crowcaller, Chapter 5). Craft: Destruction I + Haste I + Ascent I + Fortitude I." },
  "crow-storm": { slug: "crow-storm", name: "Crow Storm", kind: "skill", trigger: "Heavy Attack", pool: "Stamina",
    effect: "Upgraded Crow's Pursuit: ravens strike in three directions and return.",
    get: "Dropped by Hexe Marie (Chapter 9)." },
  "ators-orb": { slug: "ators-orb", name: "Ator's Orb", kind: "skill", trigger: "Heavy Attack", pool: "Stamina",
    effect: "Tracking orbs that follow enemies and detonate after a short delay. Low damage, constant stagger.",
    get: "Ships in Darkbringer." },
  "hounds-claws": { slug: "hounds-claws", name: "Hound's Claws", kind: "skill", trigger: "Spinning Slash", pool: "Stamina",
    effect: "Sweeps the surrounding area with bloodstained claws. Wide reach, breaks guards.",
    get: "Hemon Beindel, The Hellhounds side quest (Parish of Solomon). Craft: Destruction I + Vigor I + Fortitude I." },
  "wound-of-darkness": { slug: "wound-of-darkness", name: "Wound of Darkness", kind: "skill", trigger: "Turning Slash", pool: "Spirit",
    effect: "Three blades of dark energy push enemies back. Strong stagger, high Spirit cost.",
    get: "Back-alley merchant in Port Delesyia, 40 silver." },
  "frost-spike": { slug: "frost-spike", name: "Frost Spike", kind: "skill", trigger: "Skill key", pool: "Spirit",
    effect: "A wave of frozen spikes in a frontal cone. Big burst with AoE reach.",
    get: "Reward of the White Blizzard faction quest Wraith in the Frost (Beloth, the Darksworn)." },
  "shattering-frost": { slug: "shattering-frost", name: "Shattering Frost", kind: "skill", trigger: "Any Frost-imbued attack", pool: "Spirit",
    effect: "Delayed ice explosion at the target's position. Needs Frost Mantle Lv1 and Imbue Element.",
    get: "Armor skill gear from the Frost chain; craftable at a Witch with its blueprint." },
  "spirits-judgment": { slug: "spirits-judgment", name: "Spirit's Judgment", kind: "skill", trigger: "Evasive step (Sword Mastery Lv2)", pool: "Stamina",
    effect: "A spectral knight charges through enemies.",
    get: "After Fortain (Chapter 8). Craft: Destruction I + Insight I + Vitality I." },
  "abyssal-rays": { slug: "abyssal-rays", name: "Abyssal Rays", kind: "skill", trigger: "Repeated attack, dodge→attack, jump→attack", pool: "none",
    effect: "Rays of light that stun nearby enemies. Costs nothing.",
    get: "Back Alley Shop in Demeniss, about 40 silver." },
  "volcanic-eruption": { slug: "volcanic-eruption", name: "Volcanic Eruption", kind: "skill", trigger: "Any Flame-imbued attack", pool: "Spirit",
    effect: "Shatters a molten boulder for fire damage around the target. The comets in the videos.",
    get: "Ships in Scorchflame Plate Gloves (Twilight Grotto / Flame Knights). Craft: Destruction I + Flameward I + Fortitude I + Aegis I + Vigor I." },
  "flames-of-judgment": { slug: "flames-of-judgment", name: "Flames of Judgment", kind: "skill", trigger: "Any Flame-imbued attack", pool: "Spirit",
    effect: "Sends out homing sparks of flame for extra fire damage. The fireballs in the videos.",
    get: "Ships in Eclipsed Solas Plate Gloves (Lucian Bastier, Chapter 8 Traitor). Craft: Flameward I + Destruction I + Vitality I + Swift I + Fortification I." },
  momentum: { slug: "momentum", name: "Momentum", kind: "skill", trigger: "Passive", pool: "none",
    effect: "+35% Turning Slash damage. One socket, the biggest single multiplier in the game.",
    get: "Ships in the Leather Helm of the Fallen Kingdom (Sanctum of Benediction, Hernand). Craft: Destruction I + Swift I + Insight I + Fortitude I." },
  "infinite-arrows-ii": { slug: "infinite-arrows-ii", name: "Infinite Arrows II", kind: "skill", trigger: "Passive", pool: "none",
    effect: "40% chance not to consume an arrow. With III it reaches 100%.",
    get: "Karanda, Pailune faction quest." },
  "infinite-arrows-iii": { slug: "infinite-arrows-iii", name: "Infinite Arrows III", kind: "skill", trigger: "Passive", pool: "none",
    effect: "60% chance not to consume an arrow.",
    get: "Witch special synthesis (two Infinite Arrows II), or Greater Infinite Arrows (100% alone, limited durability) from the Bow Aimed at Fate V challenge." },
  "destruction-iii": { slug: "destruction-iii", name: "Destruction III", kind: "stat", atk: 3, effect: "+3 Attack on the weapon it sits in.", get: "Craft at Elowen: two Destruction II." },
  "insight-iii": { slug: "insight-iii", name: "Insight III", kind: "stat", crit: 3, effect: "Critical Rate Lv3 on the weapon it sits in.", get: "Craft at Areciel (Tashkalp): two Insight II." },
  "swift-iii": { slug: "swift-iii", name: "Swift III", kind: "stat", as: 3, global: true, effect: "Attack Speed Lv3. Global when socketed in armor.", get: "Craft from Bari's Swift Gear Blueprint (Pailune)." },
  "haste-ii": { slug: "haste-ii", name: "Haste II", kind: "stat", ms: 2, global: true, effect: "Movement Speed Lv2.", get: "Two Haste I at a Witch." },
  "haste-iii": { slug: "haste-iii", name: "Haste III", kind: "stat", ms: 3, global: true, effect: "Movement Speed Lv3.", get: "Two Haste II at a Witch (Bari sells the blueprint)." },
  "fortification-iii": { slug: "fortification-iii", name: "Fortification III", kind: "stat", def: 9, global: true, effect: "+9 Defense. Counts from a stowed shield.", get: "Lyselia's Fortification Gear Blueprint (Serpent Marsh)." },
  "aegis-iii": { slug: "aegis-iii", name: "Aegis III", kind: "stat", effect: "Damage Reduction 3. On a shield it only works while the shield is raised.", get: "Lyselia's Aegis Gear Blueprint." },
  "composure-iii": { slug: "composure-iii", name: "Composure III", kind: "stat", effect: "+0.3 Spirit per second.", get: "Craft at Elowen." },
  "vigor-iii": { slug: "vigor-iii", name: "Vigor III", kind: "stat", effect: "+6% Stamina regeneration.", get: "Craft at Elowen." },
  relentless: { slug: "relentless", name: "Relentless", kind: "stat", effect: "Damage rises with each consecutive hit (about 1% per hit by one test) and resets when you take damage. Single tier. Whether it buffs weapon hits from a boot socket is unverified.", get: "Combat God's Plate Gloves (Muskan, Bonepit) or a Starlight Cave chest. Craft: Destruction I + Swift I." },
  "life-transference": { slug: "life-transference", name: "Life Transference", kind: "stat", effect: "Health Siphon Lv1 on hit.", get: "Ships in the Golden-Knotted Ancestral Bow." },
  "frostward-iii": { slug: "frostward-iii", name: "Frostward III", kind: "stat", effect: "Ice Resistance Lv3.", get: "Craft at a Witch." },
  "malicebane-iii": { slug: "malicebane-iii", name: "Malicebane III", kind: "stat", effect: "+12% damage to mighty foes (bosses and elites).", get: "Craft at Elowen." },
};

export const gear = (slug: string): Gear => {
  const g = GEARS[slug];
  if (!g) throw new Error(`unknown gear ${slug}`);
  return g;
};
