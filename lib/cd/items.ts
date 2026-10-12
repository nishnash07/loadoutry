/** Crimson Desert item database for the builds. All stats at +10 refinement (crimsondb.gg datamine, v1.17 tables, unchanged through 2.02). */

export type Slot =
  | "weapon2h" | "weapon1h" | "offhand" | "bow" | "helm" | "chest" | "gloves" | "boots"
  | "cloak" | "shield" | "necklace" | "earring" | "ring" | "pack" | "ammo";

export interface Item {
  slug: string; // icon file name under public/icons/cd
  name: string;
  slot: Slot;
  type?: string;
  tier?: number;
  atk?: number;
  def?: number;
  crit?: number;
  as?: number;
  ms?: number;
  sockets: number; // maximum a Witch can open on this item
  stock?: number; // sockets it ships with
  special?: string;
  fire?: number; ice?: number; lightning?: number;
  refine?: number; // refinement level shown; defaults to 10
  get: string;
  gate?: string;
}

export const ITEMS: Record<string, Item> = {
  "vow-of-the-dead-king": { slug: "vow-of-the-dead-king", name: "Vow of the Dead King", slot: "weapon2h", type: "Halberd · spear moveset", tier: 5, atk: 35, crit: 4, sockets: 5, stock: 3,
    get: "Citadel of the Forgotten King, under the Frostveiled Castle Ruins in northern Pailune. Also sold by Gorio at Skog Equipment.", gate: "Open world" },
  "soul-spear": { slug: "soul-spear", name: "Soul Spear", slot: "weapon2h", type: "Two-Handed Spear", tier: 3, atk: 40, sockets: 5, special: "Finishing a weakened enemy fires souls forward (10 s cooldown).",
    get: "Sold by Elowen, Witch of Wisdom, in the Witchwoods (Hernand).", gate: "Chapter 5 (Elowen)" },
  "alabaster-halberd": { slug: "alabaster-halberd", name: "Alabaster Halberd", slot: "weapon2h", type: "Halberd · spear moveset", tier: 3, atk: 35, crit: 4, sockets: 5,
    get: "Craft at any Smith (14 Iron Ore, 3 Copper Ore) after reading Two-Handed Weapons of the World Vol. III. Sold by Omar, Gurbit and Tranan.", gate: "Open world, early" },
  "thorn-of-dark-pursuit": { slug: "thorn-of-dark-pursuit", name: "Thorn of Dark Pursuit", slot: "weapon2h", type: "Two-Handed Spear", tier: 4, atk: 38, as: 1, sockets: 5, stock: 3, special: "Ships with the Warden of Darkness finisher.",
    get: "Sold by Lyselia (Serpent Marsh, Demeniss) or crafted at a Smith with 30 Abyss Cells and Power Cores.", gate: "Demeniss" },
  "darkbringer": { slug: "darkbringer", name: "Darkbringer", slot: "weapon2h", type: "Longsword", tier: 5, atk: 39, crit: 3, sockets: 5, stock: 3, special: "Ships with Ator's Orb, Swift I and Insight I.",
    get: "Reward of the Cloister of Ruination faction quest (Archon of Antumbra); also sold by Bari in Pailune.", gate: "Faction line" },
  "fated-shadow": { slug: "fated-shadow", name: "Fated Shadow", slot: "weapon1h", type: "Sword", tier: 5, atk: 34, sockets: 3, stock: 3, special: "Ships with Greysoul Howling, Destruction I and Swift I.",
    get: "Dropped by Goyen at the Nest of Valor; later sold by Areciel and the Crim Witch.", gate: "Chapter 9" },
  "aeserion-sword": { slug: "aeserion-sword", name: "Aeserion Sword", slot: "weapon1h", type: "Sword", tier: 5, atk: 34, sockets: 3,
    get: "Reward of the faction quest Aeserion, the Great Serpent, or crafted with the Aeserion Gear Blueprint (1 Aeserion's Scale, 1 Platinum, 5 Bismuth, 5 Azurite, 30 Copper).", gate: "Aeserion quest" },
  "wolfs-fang": { slug: "wolfs-fang", name: "Wolf's Fang", slot: "weapon1h", type: "Sword", tier: 3, atk: 34, sockets: 3, stock: 3, special: "Ships with Insight I, Malicebane I and Swift I.",
    get: "Sold by Randolph and the Pailune black market; craftable at a Smith.", gate: "Open world" },
  "golden-knotted-ancestral-bow": { slug: "golden-knotted-ancestral-bow", name: "Golden-Knotted Ancestral Bow", slot: "bow", type: "Bow", tier: 4, atk: 33, sockets: 5, stock: 3, special: "Ships with Destruction II, Insight I and Life Transference (Health Siphon).",
    get: "Pailune Ancestor's Ruins, past the trap gauntlet; also sold by Bargul and Odeck Equipment.", gate: "Open world" },
  "noble-mans-bow": { slug: "noble-mans-bow", name: "Noble Man's Bow", slot: "bow", type: "Bow", tier: 5, atk: 33, sockets: 5,
    get: "Any 33-attack bow is interchangeable: Noble Man's, Divine Echoes, Aeserion, Crimson Warden's, Shadowleaf, Kylus.", gate: "Varies" },
  "unyielding-heros-plate-helm": { slug: "unyielding-heros-plate-helm", name: "Unyielding Hero's Plate Helm", slot: "helm", def: 17, sockets: 1, stock: 1, special: "Daze Immunity.",
    get: "Back Alley Shop in Calphade (Thrak), about 16.8 silver.", gate: "Patch 1.13 content; may need Cassius Morten defeated" },
  "leather-helm-of-the-fallen-kingdom": { slug: "leather-helm-of-the-fallen-kingdom", name: "Leather Helm of the Fallen Kingdom", slot: "helm", def: 18, lightning: 1, sockets: 1, stock: 1, special: "Lightning Resistance Lv1. Ships with Momentum.",
    get: "Chest in the Sanctum of Benediction, south of the E in Hernand on the map; also sold by Quentin White.", gate: "Open world, early" },
  "kuku-flame-resistant-armor": { slug: "kuku-flame-resistant-armor", name: "Kuku Flame-Resistant Armor", slot: "chest", def: 38, crit: 3, fire: 10, sockets: 0, special: "Fire Resistance Lv10. Absorbs fire damage; when charged, glows for 10 s and bursts fire on every hit taken. No sockets.",
    get: "Craft at a Kuku Pot: Enhanced Kuku Pot + Scorchflame Plate Armor + Power Core (Casket of Illusions) + Core of Absolution. Needs the Kuku Gear Special Blueprint.", gate: "Late, Kuku crafting line" },
  "kuku-ice-resistant-armor": { slug: "kuku-ice-resistant-armor", name: "Kuku Ice-Resistant Armor", slot: "chest", def: 38, ms: 3, ice: 10, sockets: 0, special: "Ice Resistance Lv10. No sockets.",
    get: "Same Kuku Pot recipe family with the Frostcursed plate chest.", gate: "Late, Kuku crafting line" },
  "scorchflame-plate-armor": { slug: "scorchflame-plate-armor", name: "Scorchflame Plate Armor", slot: "chest", def: 36, sockets: 3,
    get: "Twilight Grotto cave behind the Denn River waterfall west of Demeniss; Flame Knights faction rewards.", gate: "Open world" },
  "tariv-cloth-gloves": { slug: "tariv-cloth-gloves", name: "Tariv Cloth Gloves", slot: "gloves", def: 12, as: 3, sockets: 2,
    get: "Craft at a Smith (11 Cloth Piece, 2 Fleece) after Cloth Armors of the World Vol. IV; sold by Elise and Eric.", gate: "Open world" },
  "tariv-cloth-boots": { slug: "tariv-cloth-boots", name: "Tariv Cloth Boots", slot: "boots", def: 12, ms: 3, sockets: 2,
    get: "Same recipe book as the gloves.", gate: "Open world" },
  "scorchflame-plate-gloves": { slug: "scorchflame-plate-gloves", name: "Scorchflame Plate Gloves", slot: "gloves", def: 21, sockets: 2, stock: 2, special: "Ships with Volcanic Eruption and Composure I.",
    get: "Twilight Grotto, west of Demeniss; Flame Knights faction quests; sold by Lyle.", gate: "Open world" },
  "eclipsed-solas-plate-gloves": { slug: "eclipsed-solas-plate-gloves", name: "Eclipsed Solas Plate Gloves", slot: "gloves", def: 17, sockets: 2, stock: 2, special: "Ships with Flames of Judgment and Ascent I.",
    get: "Dropped by Lucian Bastier in the main quest Traitor.", gate: "Chapter 8" },
  "demeniss-royal-guard-shield": { slug: "demeniss-royal-guard-shield", name: "Demeniss Royal Guard Shield", slot: "shield", def: 15, ms: 2, sockets: 2,
    get: "Demeniss. Same stats: Shield of Radiance, Black Sun, Mirror of Night.", gate: "Open world" },
  "shield-of-radiance": { slug: "shield-of-radiance", name: "Shield of Radiance", slot: "shield", def: 15, ms: 2, sockets: 2, get: "Legendary shield, Movement Speed Lv2.", gate: "Open world" },
  "shield-of-conviction": { slug: "shield-of-conviction", name: "Shield of Conviction", slot: "shield", type: "Large shield", def: 29, sockets: 2, stock: 2, special: "Ships with Aegis I and Fortitude I.", get: "Large shield, highest defense class.", gate: "Open world" },
  "white-lion-necklace": { slug: "white-lion-necklace", name: "White Lion Necklace", slot: "necklace", atk: 5, crit: 4, sockets: 0, special: "+0.3 Spirit per second from +9.",
    get: "Sold by OmarVar Equipment, or crafted (30 Abyss Cells + Power Cores). Necklace of Lightning is identical (Demeniss Eastern Court strongbox).", gate: "Open world" },
  "necklace-of-lightning": { slug: "necklace-of-lightning", name: "Necklace of Lightning", slot: "necklace", atk: 5, crit: 4, sockets: 0, special: "+0.3 Spirit per second.", get: "Demeniss Eastern Court strongbox.", gate: "Open world" },
  "engraved-gold-earring": { slug: "engraved-gold-earring", name: "Engraved Gold Earring", slot: "earring", def: 6, ms: 4, sockets: 0, special: "Health regen.",
    get: "Estate of Dismay / Lioncrest Manor. Same stats: Ancient Earring, Witch's Earring, Black Lion Earring.", gate: "Open world" },
  "ancient-earring": { slug: "ancient-earring", name: "Ancient Earring", slot: "earring", def: 6, ms: 4, sockets: 0, special: "Health regen.", get: "Ancient ruins loot.", gate: "Open world" },
  "white-horns-ring": { slug: "white-horns-ring", name: "White Horn's Ring", slot: "ring", atk: 7, sockets: 0, special: "+8% Stamina regen.",
    get: "Skin the White Horn boss. Tigerfang Ring (White Tiger, Serpenthead Valley) is identical.", gate: "Open world" },
  "tigerfang-ring": { slug: "tigerfang-ring", name: "Tigerfang Ring", slot: "ring", atk: 7, sockets: 0, special: "+8% Stamina regen.", get: "Defeat and skin the White Tiger at Serpenthead Valley.", gate: "Open world" },
  "witchs-ring": { slug: "witchs-ring", name: "Witch's Ring", slot: "ring", atk: 3, as: 4, sockets: 0, special: "+6% Stamina regen.",
    get: "Goyen at the Nest of Valor. Mark of Darkness (Windmere Manor puzzle, Demeniss) matches it.", gate: "Chapter 9" },
  "mark-of-darkness": { slug: "mark-of-darkness", name: "Mark of Darkness", slot: "ring", atk: 3, as: 4, sockets: 0, special: "+6% Stamina regen.", get: "Windmere Manor strongbox puzzle, Demeniss.", gate: "Open world" },
  "pailunese-signet": { slug: "pailunese-signet", name: "Pailunese Signet", slot: "ring", atk: 11, crit: 1, refine: 0, sockets: 0, special: "+2% Stamina regen.", get: "Contribution shop, Pailune.", gate: "Contribution" },
  "kuku-watcher-pack": { slug: "kuku-watcher-pack", name: "Kuku Watcher Pack", slot: "pack", refine: 0, sockets: 0, special: "Deploys two untargetable Watcher drones that fire for the whole fight and build stagger on their own. No cooldown.",
    get: "Blueprint II from Bari, Witch of Kindness, by purifying the Sanctum of Atonement. Craft at Kilnden Workshop: Kuku Pack, Electrical Components, Clockwork Insects, Small Batteries, Abyss Cell No. 0.", gate: "Witch of Kindness line" },
  "explosive-arrow": { slug: "explosive-arrow", name: "Explosive Arrow", slot: "ammo", refine: 0, sockets: 0, special: "One is enough with 100% Infinite Arrows.",
    get: "Back Alley vendors in Calphade (Thrak), Demeniss outskirts (Brek) and Tashkalp (Vex); Demeniss Armory dispatch.", gate: "Open world" },
  "the-ashens-leather-cloak": { slug: "the-ashens-leather-cloak", name: "Any cloak", slot: "cloak", def: 12, ice: 3, sockets: 0, special: "Cloaks carry no sockets. Pick by look; Shadow Swan gives Fire Res 7 for volcanic zones.", get: "Cosmetic choice.", gate: "Open world" },
};

export const item = (slug: string): Item => {
  const it = ITEMS[slug];
  if (!it) throw new Error(`unknown item ${slug}`);
  return it;
};
