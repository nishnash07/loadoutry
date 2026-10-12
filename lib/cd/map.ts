/**
 * Pywel map model.
 * World coordinates are the game's own (x east, y north). The public map at crimsondb.gg places the world
 * on a 256-unit square with px = (16405 + x) / 19500 * 256 and py = (8205 - y) / 19500 * 256; the coastline
 * in coast.ts was traced from those tiles, so the same transform puts pins on it exactly.
 */
import mapdata from "./mapdata.json";

export const toMap = (x: number, y: number) => ({ px: ((16405 + x) / 19500) * 256, py: ((8205 - y) / 19500) * 256 });
export const dbMapLink = (x: number, y: number) => `https://crimsondb.gg/map?x=${x}&y=${y}&only=1&points=${x}%2C${y}`;

/** Continent crop in world-square units (markers span x -12.5k..-3k, y -7k..3.4k). */
export const VIEW = { x: 40, y: 56, w: 150, h: 150 };

export interface Loc { x: number; y: number; label: string; kind: "chest" | "boss" | "vendor" | "quest" | "craft" | "unlock"; note?: string }

export const REGIONS: { name: string; x: number; y: number }[] = [
  { name: "HERNAND", x: -10700, y: -4600 },
  { name: "DEMENISS", x: -7900, y: -2600 },
  { name: "PAILUNE", x: -10300, y: 100 },
  { name: "DELESYIA", x: -4300, y: -4500 },
  { name: "TASHKALP", x: -5300, y: -1100 },
];

export const TOWNS = mapdata.towns as { n: string; x: number; y: number }[];
export const BLACKSMITHS = mapdata.blacksmiths as { n: string; x: number; y: number }[];
export const WITCHES = mapdata.witches as { n: string; x: number; y: number }[];

/** Where each build item comes from. Only coordinates confirmed by the map's marker data are listed. */
export const ITEM_LOCS: Record<string, Loc[]> = {
  "vow-of-the-dead-king": [{ x: -10838.4, y: -366.8, label: "Citadel of the Forgotten King", kind: "chest", note: "Dungeon under the Frostveiled Castle Ruins, northern Pailune" }, { x: -12112, y: -377, label: "Skoghorn Village", kind: "vendor", note: "Gorio, Skog Equipment" }],
  "soul-spear": [{ x: -11475, y: -4592, label: "Witch House, Hernand", kind: "vendor", note: "Elowen, Witch of Wisdom" }],
  "alabaster-halberd": [{ x: -5935, y: -515, label: "Crimson Mountains Station", kind: "vendor", note: "Gurbit, Crimson Mountains Equipment; also any Blacksmith" }],
  "thorn-of-dark-pursuit": [],
  darkbringer: [{ x: -11788.5, y: 949.2, label: "Darkbringer", kind: "chest", note: "Northwest of Silver Wolf Mountain, Pailune" }, { x: -11674, y: 86, label: "Cloister of Ruination", kind: "boss", note: "Archon of Antumbra faction quest" }],
  "fated-shadow": [{ x: -7114, y: -21, label: "Desert Witch, Tashkalp", kind: "vendor", note: "Areciel sells it after Chapter 9; Goyen's drop is at the Nest of Valor island, off the map data" }],
  "aeserion-sword": [{ x: -7087, y: -5745, label: "Aeserion, the Great Serpent", kind: "boss" }],
  "wolfs-fang": [{ x: -9640.68, y: 213.73, label: "Pailune", kind: "vendor", note: "Randolph / Pailune black market" }],
  "golden-knotted-ancestral-bow": [{ x: -11058.1, y: 836, label: "Pailune Ancestor's Ruins", kind: "chest", note: "Past the trap gauntlet" }],
  "noble-mans-bow": [{ x: -9701.06, y: 449.76, label: "Noble Man's Bow", kind: "chest" }],
  "unyielding-heros-plate-helm": [{ x: -11642.84, y: -2215.36, label: "Calphade", kind: "vendor", note: "Thrak, back-alley shop" }],
  "leather-helm-of-the-fallen-kingdom": [{ x: -12435.05, y: -3563.83, label: "Sanctum of Benediction", kind: "chest" }],
  "kuku-flame-resistant-armor": [{ x: -11148, y: -3875, label: "Kilnden Kuku Workshop", kind: "craft", note: "Kuku Pot crafting" }, { x: -8824.3, y: -2822.15, label: "Scorchflame Plate Armor", kind: "chest", note: "Ingredient chest" }],
  "kuku-ice-resistant-armor": [{ x: -11148, y: -3875, label: "Kilnden Kuku Workshop", kind: "craft" }],
  "scorchflame-plate-armor": [{ x: -8824.3, y: -2822.15, label: "Scorchflame Plate Armor", kind: "chest" }],
  "tariv-cloth-gloves": [{ x: -8208, y: -1655, label: "Tariv Village", kind: "vendor", note: "Elise; or any Blacksmith with the Vol. IV book" }],
  "tariv-cloth-boots": [{ x: -8208, y: -1655, label: "Tariv Village", kind: "vendor", note: "Elise; or any Blacksmith with the Vol. IV book" }],
  "scorchflame-plate-gloves": [{ x: -9648.78, y: -2831.39, label: "Twilight Grotto", kind: "chest", note: "Behind the Denn River waterfall" }],
  "eclipsed-solas-plate-gloves": [{ x: -8130, y: -3391, label: "Traitor (main quest)", kind: "quest", note: "Lucian Bastier, Chapter 8" }],
  "demeniss-royal-guard-shield": [{ x: -6904.8, y: -3063.6, label: "Demeniss Royal Guard Shield", kind: "chest" }],
  "white-lion-necklace": [{ x: -6678, y: -3067, label: "Demeniss East Court", kind: "chest", note: "Necklace of Lightning strongbox, identical stats" }],
  "necklace-of-lightning": [{ x: -6678, y: -3067, label: "Demeniss East Court", kind: "chest" }],
  "engraved-gold-earring": [{ x: -10257, y: -3060, label: "Estate in Dismay", kind: "chest" }, { x: -10846, y: -3737.7, label: "Lioncrest Manor", kind: "chest" }],
  "white-horns-ring": [{ x: -4594.22, y: -4590.92, label: "Eternal Corridor", kind: "boss", note: "White Horn" }],
  "tigerfang-ring": [],
  "witchs-ring": [],
  "mark-of-darkness": [{ x: -8321, y: -2273, label: "Windmere Manor", kind: "chest", note: "Strongbox puzzle" }],
  "pailunese-signet": [{ x: -9640.68, y: 213.73, label: "Pailune", kind: "vendor", note: "Contribution shop" }],
  "kuku-watcher-pack": [{ x: -11466, y: -3219, label: "Sanctum of Atonement", kind: "unlock", note: "Blueprint II from Bari" }, { x: -11148, y: -3875, label: "Kilnden Kuku Workshop", kind: "craft" }],
  "explosive-arrow": [{ x: -6165, y: -3215, label: "Demeniss Armory", kind: "vendor", note: "Dispatch mission" }],
};

export const GEAR_LOCS: Record<string, Loc[]> = {
  groundsurge: [{ x: -10695.8, y: 121.8, label: "Myurdin", kind: "boss", note: "Chapter 6-7; extract from Melted Ambition" }],
  "shadow-claw": [{ x: -10217, y: -1681, label: "Legendary Wolf", kind: "boss", note: "Black Fang" }],
  "volcanic-eruption": [{ x: -9648.78, y: -2831.39, label: "Twilight Grotto", kind: "chest", note: "In the Scorchflame Plate Gloves" }],
  "flames-of-judgment": [{ x: -8130, y: -3391, label: "Traitor (main quest)", kind: "quest", note: "In the Eclipsed Solas Plate Gloves" }],
  momentum: [{ x: -12435.05, y: -3563.83, label: "Sanctum of Benediction", kind: "chest", note: "In the Leather Helm of the Fallen Kingdom" }],
  "infinite-arrows-iii": [{ x: -7580.24, y: -2336.1, label: "Infinite Arrows III", kind: "chest", note: "Abyss treasure chest" }],
  "wound-of-darkness": [{ x: -4257, y: -4016, label: "Port Delesyia", kind: "vendor", note: "Back-alley merchant" }],
  "ators-orb": [{ x: -11788.5, y: 949.2, label: "Darkbringer", kind: "chest" }],
  "crow-storm": [{ x: -7795, y: -1494, label: "Hexe Sanctuary", kind: "boss", note: "Hexe Marie, Chapter 9" }],
};

export const UNLOCK_LOCS: Loc[] = [
  { x: -11858, y: -762, label: "Spire of Ringing Truth", kind: "unlock", note: "Start of the Frost and Flame abyss chain (Imbue Element)" },
];
