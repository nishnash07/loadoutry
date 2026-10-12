import { ITEMS, type Item } from "./items";
import { GEARS, type Gear } from "./gears";
import { critPct, damageIndex } from "./stats";

export type SlotKey =
  | "helm" | "chest" | "gloves" | "boots" | "cloak"
  | "mainWeapon" | "secondWeapon" | "bow" | "shield"
  | "necklace" | "earringL" | "earringR" | "ringL" | "ringR" | "pack" | "ammo";

export interface Equip { item: string; gears: string[] }
export interface Build {
  slug: string;
  name: string;
  tagline: string;
  role: string;
  focus: "Two-handed" | "Dual wield" | "Bow" | "Two-handed · Frost" | "Longsword";
  summary: string;
  equipment: Partial<Record<SlotKey, Equip>>;
  rotation: string[];
  skills: { name: string; why: string }[];
  why: { title: string; body: string }[];
  alternatives: { slot: string; body: string }[];
  gates: string[];
  confidence: string;
}

/** The armor core every build shares. */
const CORE: Partial<Record<SlotKey, Equip>> = {
  helm: { item: "unyielding-heros-plate-helm", gears: ["momentum"] },
  chest: { item: "kuku-flame-resistant-armor", gears: [] },
  gloves: { item: "tariv-cloth-gloves", gears: ["volcanic-eruption", "flames-of-judgment"] },
  boots: { item: "tariv-cloth-boots", gears: ["swift-iii", "haste-ii"] },
  cloak: { item: "the-ashens-leather-cloak", gears: [] },
  shield: { item: "demeniss-royal-guard-shield", gears: ["fortification-iii", "fortification-iii"] },
  necklace: { item: "white-lion-necklace", gears: [] },
  earringL: { item: "engraved-gold-earring", gears: [] },
  earringR: { item: "engraved-gold-earring", gears: [] },
  ringL: { item: "white-horns-ring", gears: [] },
  ringR: { item: "witchs-ring", gears: [] },
  pack: { item: "kuku-watcher-pack", gears: [] },
};

const CORE_WHY = [
  { title: "Crit from sources that cost no weapon socket", body: "The Kuku Flame-Resistant chest (Lv3) and the White Lion Necklace (Lv4) give crit to every weapon you own. With a Lv4 weapon that is Lv11 before a single Insight gear, which is where the game's crit curve has already paid out 82% of its cap." },
  { title: "Attack Speed where it is global", body: "Attack speed on gloves, boots and rings applies to every weapon; on a weapon it only works while that weapon is drawn. Tariv Cloth Gloves (Lv3), one Swift III in the boots (Lv3) and the Witch's Ring (Lv4) reach Lv10, which is 78% of the cap's benefit. Chasing the last five levels costs more sockets than it returns." },
  { title: "Movement Speed on exactly 15", body: "Tariv boots 3 + two Lv4 earrings + the stowed shield's 2 + Haste II = 15. Nothing wasted, and mobility is what lets a 20-Spirit nuke build reposition instead of trading hits." },
  { title: "A shield you never raise", body: "Defense and Movement Speed from a shield count while it hangs on your back. Damage Reduction (Aegis) does not, so both shield sockets are Fortification III for +18 Defense." },
  { title: "Momentum on the helm", body: "The helm has one socket and nothing else competes for it. +35% Turning Slash damage is the largest single multiplier in the game." },
];

export const BUILDS: Build[] = [
  {
    slug: "spear-nuke",
    name: "Spear Nuke",
    tagline: "Groundsurge, Greysoul Howling and Shadow Claw on a spear-moveset two-hander, with fire imbue feeding Volcanic Eruption and Flames of Judgment.",
    role: "Burst · AoE · boss deletion",
    focus: "Two-handed",
    summary: "Every Turning Slash fires Groundsurge, Greysoul's phantom, Momentum's +35% and, when flame-imbued, a boulder and a volley of homing sparks. Forward Slash chains into it through Proficiency with Shadow Claw's three swipes on the way in. The spear moveset is chosen for reach: Turning Slash covers more ground than any other weapon class.",
    equipment: { ...CORE, mainWeapon: { item: "vow-of-the-dead-king", gears: ["groundsurge", "greysoul-howling", "shadow-claw", "destruction-iii", "destruction-iii"] }, secondWeapon: { item: "fated-shadow", gears: ["shadow-claw", "crows-pursuit", "destruction-iii"] }, bow: { item: "golden-knotted-ancestral-bow", gears: ["infinite-arrows-ii", "infinite-arrows-iii", "destruction-iii", "destruction-iii", "insight-iii"] }, ammo: { item: "explosive-arrow", gears: [] } },
    rotation: [
      "Open with Forward Slash (R2): Shadow Claw's three swipes plus the Echoing illusion.",
      "Chain straight into Turning Slash (R1+R2) through Turning Slash Proficiency; hold LT during the wind-up to imbue Flame.",
      "One imbued Turning Slash = Groundsurge cone + Greysoul sweep + Momentum +35% + Volcanic Eruption boulder + Flames of Judgment sparks.",
      "Let the Watcher drones and crit regen cover the gap, then repeat. Swap to the sword pair (Quick Swap) when Spirit runs dry; kills refund it.",
    ],
    skills: [
      { name: "Turning Slash Lv3 + Proficiency, Expertise, Rend Armor", why: "Proficiency lets Forward Slash chain into it. Rend Armor ignores super armor and lowers enemy defense." },
      { name: "Forward Slash Lv3 + Proficiency, Sure Hit", why: "This is the Shadow Claw button." },
      { name: "Nature's Echo → Echoing Forward Slash", why: "A free illusion copies every Forward Slash." },
      { name: "Imbue Element Lv4", why: "Lv4 unlocks Elemental Turning Slash. Flame comes from the Tree of Slumber abyss chain." },
      { name: "Armed Combat Lv5 (Quick Swap)", why: "Swap between the two-hander and the sword pair mid-combo." },
      { name: "Focus Lv4 (Serenity), Keen Senses Lv4 (Enraged Parry)", why: "Spirit regen in Focus; parry mid-combo. Both added in 2.0." },
    ],
    why: [
      { title: "Two triggers, two resource pools", body: "Groundsurge and Greysoul Howling both ride Turning Slash and cost Spirit. Shadow Claw rides Heavy Attack and costs Stamina. Alternating the two buttons spends both bars instead of draining one." },
      { title: "Why Destruction III and not Insight III", body: "At Lv11 crit the curve is flat: three more levels add about 4% expected damage, while +3 Attack on a 56-attack total adds 5.4%. Switch to Insight only if your crit sits below Lv8." },
      { title: "Vow of the Dead King vs Soul Spear", body: "The Vow's Lv4 crit is free socket-wise; the Soul Spear has 5 more raw attack. On the damage index they finish within 3% of each other. Pick by look; the Alabaster Halberd is a craftable early twin of the Vow." },
      ...CORE_WHY,
    ],
    alternatives: [
      { slot: "Weapon", body: "Soul Spear (40 attack, Elowen) or Thorn of Dark Pursuit (38, Attack Speed Lv1). Any halberd with Crit Lv4 is the Vow in different clothes." },
      { slot: "Third Turning Slash gear", body: "Wound of Darkness instead of Groundsurge for more raw damage and less stagger. Running all three drains Spirit too fast." },
      { slot: "Chest", body: "Any plate chest with 3 sockets: Composure III + 2× Aegis III if Spirit runs dry. You trade 3 global crit for regen and damage reduction." },
    ],
    gates: ["Groundsurge: Myurdin, Chapter 6-7", "Greysoul Howling: Goyen, Chapter 9", "Flames of Judgment: Lucian Bastier, Chapter 8", "Flame imbue: Spire of Ringing Truth → Tree of Slumber", "Kuku Flame-Resistant chest: Kuku crafting line"],
    confidence: "Item numbers are datamined. Socket rules and stat-application rules are community tested. Spirit cost per gear is unpublished; two Turning Slash gears are sustainable in practice, three are not.",
  },
  {
    slug: "shadow-pair",
    name: "Shadow Pair",
    tagline: "Two 34-attack swords firing Shadow Claw and Crow's Pursuit on every Heavy Attack, for bosses with short damage windows.",
    role: "Sustained · single target · stamina",
    focus: "Dual wield",
    summary: "The sword pair attacks faster and swaps in when a boss only gives you small windows or blocks big hits. Every Heavy Attack fires Shadow Claw's three swipes and a murder of crows from both swords. Crit comes entirely from the shared core, which is exactly what the Kuku chest and the necklace are for.",
    equipment: { ...CORE, mainWeapon: { item: "fated-shadow", gears: ["shadow-claw", "crows-pursuit", "destruction-iii"] }, secondWeapon: { item: "aeserion-sword", gears: ["shadow-claw", "crows-pursuit", "destruction-iii"] }, bow: { item: "golden-knotted-ancestral-bow", gears: ["infinite-arrows-ii", "infinite-arrows-iii", "destruction-iii", "destruction-iii", "insight-iii"] }, ammo: { item: "explosive-arrow", gears: [] } },
    rotation: [
      "Heavy Attack (R2) spam: Shadow Claw + Crow's Pursuit from both blades, plus the Echoing illusion.",
      "Weave Turning Slash when Spirit allows; Momentum still applies and the Watcher drones keep the stagger bar moving.",
      "When a boss staggers, Quick Swap to the two-hander for the imbued Turning Slash nuke, then swap back.",
    ],
    skills: [
      { name: "Forward Slash Lv3 + Proficiency, Sure Hit", why: "Heavy Attack is the whole rotation." },
      { name: "Armed Combat Lv5 (Quick Swap)", why: "Swap to the two-hander for the nuke, back for pressure." },
      { name: "Weapon Throw", why: "Free with two weapons drawn; a ranged poke that returns." },
      { name: "Spinning Slash Lv2 + Proficiency", why: "Only if you run Hound's Claws on one sword." },
    ],
    why: [
      { title: "Why 34 flat attack swords", body: "One-handers come in three flavors: 34 attack, or 30 attack with a Lv2 stat. With global crit at Lv7 from the core, 4 attack is worth more than 2 crit levels on the flat part of the curve." },
      { title: "Duplicates are recipes, not second boss kills", body: "Shadow Claw and Crow's Pursuit both have Witch crafting recipes once their Gear Blueprint is learned, so the second sword gets the same pair." },
      ...CORE_WHY,
    ],
    alternatives: [
      { slot: "Second sword", body: "Wolf's Fang (34, sold in Pailune) or Tauria Curved Sword (34, ships Crow's Pursuit)." },
      { slot: "Third socket", body: "Hound's Claws (Spinning Slash, guard break) instead of Destruction III on one sword." },
      { slot: "Evasive gear", body: "Spirit's Judgment on one sword for a kiting spectral charge." },
    ],
    gates: ["Fated Shadow: Goyen, Chapter 9", "Aeserion Sword: Aeserion faction quest", "Shadow Claw: Legendary Wolf faction quest"],
    confidence: "Whether both swords' crit lines apply to both hands is a single forum claim; this build does not depend on it.",
  },
  {
    slug: "explosive-bow",
    name: "Infinite Explosive Bow",
    tagline: "Infinite Arrows II + III = 100% arrow return, so one Explosive Arrow lasts forever. Flame-imbued Charged Shots trigger the glove gears at range.",
    role: "Ranged · air and distance · burst opener",
    focus: "Bow",
    summary: "Two gears make arrows free. Elemental Charged Shot (Imbue Element Lv2) with Flame lights the same Volcanic Eruption and Flames of Judgment from your gloves at range. Evasive Shot Lv3 fires two arrows per dodge, so the bow handles anything in the air or out of reach, and opens boss fights with a charged explosive that staggers.",
    equipment: { ...CORE, mainWeapon: { item: "vow-of-the-dead-king", gears: ["groundsurge", "greysoul-howling", "shadow-claw", "destruction-iii", "destruction-iii"] }, bow: { item: "golden-knotted-ancestral-bow", gears: ["infinite-arrows-ii", "infinite-arrows-iii", "destruction-iii", "destruction-iii", "insight-iii"] }, ammo: { item: "explosive-arrow", gears: [] } },
    rotation: [
      "Select Explosive Arrow on the weapon wheel once; it never runs out.",
      "Charged Shot (R2 while aiming) with Flame imbue as the opener: explosion + boulder + sparks on a stationary boss.",
      "Evasive Shot (dodge twice while aiming) spam for sustained damage; it fires two arrows at Lv3.",
      "Focused Shot for up to four aimed shots on birds and fliers.",
    ],
    skills: [
      { name: "Marksmanship maxed", why: "Base bow damage, including explosive arrows." },
      { name: "Charged Shot, Evasive Shot Lv3 + Expertise", why: "The burst and the spam." },
      { name: "Focused Shot + Focused Charged Shot", why: "Slow time, four shots." },
      { name: "Imbue Element Lv2", why: "Unlocks Elemental Charged Shot." },
    ],
    why: [
      { title: "Why not a crit or speed bow", body: "Bows are 33 attack flat or 30 with a Lv2 stat. Global crit from the core already sits at Lv7, so the 3 attack is the better trade." },
      { title: "Fifth socket", body: "Insight III here because bow crit is Lv7 before it, still on the steep part of the curve. Destruction III is equal within a percent." },
      ...CORE_WHY,
    ],
    alternatives: [
      { slot: "Bow", body: "Any 33-attack bow: Noble Man's, Divine Echoes, Aeserion, Crimson Warden's, Shadowleaf, Kylus." },
      { slot: "Infinite Arrows", body: "Greater Infinite Arrows gives 100% in one socket but has limited durability. Save it for Overwhelming Beings." },
    ],
    gates: ["Infinite Arrows II: Karanda, Pailune faction", "Infinite Arrows III: Witch synthesis", "Explosive Arrows: Back Alley vendors in Calphade, Demeniss, Tashkalp"],
    confidence: "Arrow-return stacking to 100% is confirmed by multiple guides and the source videos.",
  },
  {
    slug: "frost-lancer",
    name: "Frost Lancer",
    tagline: "The same spear core, reached earlier: Frost is the first element the game gives you, and Frost Spike plus Shattering Frost replace the Chapter 8 fire gears.",
    role: "Burst · freeze and shatter · earlier access",
    focus: "Two-handed · Frost",
    summary: "Frost comes from the Spire of Ringing Truth, the first abyss chain you can finish. A frost-imbued Turning Slash freezes what it hits, Groundsurge's second hit shatters it, and Shattering Frost adds a delayed ice explosion. Frost Spike gives the build a second cone on its own key. Nothing here needs Chapter 8 or 9.",
    equipment: { ...CORE, chest: { item: "kuku-flame-resistant-armor", gears: [] }, gloves: { item: "tariv-cloth-gloves", gears: ["shattering-frost", "swift-iii"] }, boots: { item: "tariv-cloth-boots", gears: ["swift-iii", "haste-ii"] }, mainWeapon: { item: "alabaster-halberd", gears: ["groundsurge", "frost-spike", "shadow-claw", "destruction-iii", "destruction-iii"] }, secondWeapon: { item: "wolfs-fang", gears: ["shadow-claw", "crows-pursuit", "destruction-iii"] }, bow: { item: "noble-mans-bow", gears: ["infinite-arrows-ii", "infinite-arrows-iii", "destruction-iii", "destruction-iii", "insight-iii"] }, ammo: { item: "explosive-arrow", gears: [] } },
    rotation: [
      "Forward Slash (Shadow Claw) into a Frost-imbued Turning Slash: Groundsurge double-hit on a frozen target shatters it.",
      "Frost Spike on its own key between slashes for a second cone of burst and stagger.",
      "Shattering Frost detonates a moment after any frost-imbued hit; keep moving so the explosion lands as the enemy recovers.",
    ],
    skills: [
      { name: "Frost Mantle Lv1 → Imbue Element Lv4", why: "Frost is unlocked by the Path of Trials after the Spire of Ringing Truth. Lv4 enables Elemental Turning Slash." },
      { name: "Turning Slash Lv3 + Proficiency, Rend Armor", why: "Same chain as Spear Nuke." },
      { name: "Forward Slash Lv3, Nature's Echo", why: "Shadow Claw button and its free echo." },
    ],
    why: [
      { title: "Earlier than fire", body: "Flame needs the Tree of Slumber chain and Flames of Judgment needs Chapter 8. Frost needs one spire. Swift III takes the second glove socket because there is only one frost armor gear worth a slot." },
      { title: "Freeze then double-hit", body: "Groundsurge hits on impact and again on burst. Against a frozen target the second hit is a shatter, which is why it is kept over Wound of Darkness here." },
      ...CORE_WHY,
    ],
    alternatives: [
      { slot: "Weapon", body: "Vow of the Dead King once you reach northern Pailune; it is the Alabaster Halberd with a better look." },
      { slot: "Chest", body: "Kuku Ice-Resistant Armor (Movement Speed Lv3, Ice Res 10) if you fight in the frozen north; drop Haste II from the boots for a second Swift III." },
    ],
    gates: ["Frost imbue: Spire of Ringing Truth → Path of Trials", "Frost Spike: White Blizzard quest Wraith in the Frost (Beloth)", "Groundsurge: Myurdin, Chapter 6-7"],
    confidence: "Shattering Frost's exact detonation rules come from a single wiki description. Everything else is shared with Spear Nuke.",
  },
  {
    slug: "crow-warden",
    name: "Crow Warden",
    tagline: "A longsword stagger build: Ator's Orb, Crow Storm and Groundsurge keep the stagger bar full while plate and Aegis make you hard to kill.",
    role: "Stagger · control · tanky",
    focus: "Longsword",
    summary: "Darkbringer ships with Ator's Orb, whose tracking orbs stagger constantly. Add Crow Storm on the same Heavy Attack and Groundsurge on Turning Slash, and bosses spend most of the fight staggered while the Watcher drones add their own. The core swaps the crit chest for a socketed plate chest with Composure and two Aegis, trading a little damage for Spirit regen and damage reduction.",
    equipment: { ...CORE, chest: { item: "scorchflame-plate-armor", gears: ["composure-iii", "aegis-iii", "aegis-iii"] }, gloves: { item: "scorchflame-plate-gloves", gears: ["volcanic-eruption", "flames-of-judgment"] }, mainWeapon: { item: "darkbringer", gears: ["ators-orb", "crow-storm", "groundsurge", "destruction-iii", "insight-iii"] }, secondWeapon: { item: "wolfs-fang", gears: ["shadow-claw", "hounds-claws", "destruction-iii"] }, bow: { item: "noble-mans-bow", gears: ["infinite-arrows-ii", "infinite-arrows-iii", "destruction-iii", "destruction-iii", "insight-iii"] }, ammo: { item: "explosive-arrow", gears: [] } },
    rotation: [
      "Heavy Attack: Ator's Orb + Crow Storm on every press. Orbs track targets you are not even facing.",
      "Turning Slash with Groundsurge whenever the stagger bar is close; the double hit tips it over.",
      "On stagger, flame-imbued Turning Slash for the boulder and sparks, then back to Heavy Attacks.",
    ],
    skills: [
      { name: "Forward Slash Lv3 + Proficiency", why: "Heavy Attack carries two gears here." },
      { name: "Turning Slash Lv3 + Rend Armor", why: "Super-armor piercing plus Groundsurge." },
      { name: "Imbue Element Lv4", why: "Keeps the fire gears alive on the glove sockets." },
      { name: "Parry, Counter, Enraged Parry", why: "This is the build that stands in and trades." },
    ],
    why: [
      { title: "Stagger from three sources", body: "Orbs on Heavy Attack, Groundsurge on Turning Slash, drones from the pack. None of them need a hit to connect with the weapon itself." },
      { title: "Why the plate chest here", body: "Three sockets: Composure III refunds the Spirit the Turning Slash gears spend, two Aegis III cut incoming damage. Crit drops to Lv10 with Insight III on the sword, still 78% of the cap." },
      ...CORE_WHY.slice(1),
    ],
    alternatives: [
      { slot: "Weapon", body: "Hwando or Vessel of Dark Pursuit (43 attack, no crit) if you prefer raw attack; you lose Ator's Orb." },
      { slot: "Heavy Attack gear", body: "Crow's Pursuit (Chapter 5) until Hexe Marie drops Crow Storm in Chapter 9." },
    ],
    gates: ["Darkbringer: Cloister of Ruination faction quest", "Crow Storm: Hexe Marie, Chapter 9", "Groundsurge: Myurdin, Chapter 6-7"],
    confidence: "Stagger values are not published; the stagger reputation of Ator's Orb and Groundsurge is consistent across guides and the source videos.",
  },
];

export const build = (slug: string) => BUILDS.find((b) => b.slug === slug);

export interface Tally { attack: number; crit: number; as: number; ms: number; def: number; critPct: number; index: number }

/** Stat tally for the build's main weapon, applying the game's local/global rules. */
export function tally(b: Build, weaponKey: "mainWeapon" | "bow" = "mainWeapon"): Tally {
  const eq = b.equipment;
  const it = (k: SlotKey): Item | undefined => (eq[k] ? ITEMS[eq[k]!.item] : undefined);
  const gs = (k: SlotKey): Gear[] => (eq[k]?.gears ?? []).map((g) => GEARS[g]);
  const sum = <T,>(arr: T[], f: (x: T) => number | undefined) => arr.reduce((a, x) => a + (f(x) ?? 0), 0);
  const w = it(weaponKey);
  const wg = gs(weaponKey);
  const globals: SlotKey[] = ["necklace", "ringL", "ringR"];
  const armor: SlotKey[] = ["helm", "chest", "gloves", "boots", "cloak", "shield", "earringL", "earringR"];
  const armorGears = armor.flatMap(gs);
  const attack = (w?.atk ?? 0) + sum(globals.map(it), (x) => x?.atk) + sum(wg, (g) => g.atk);
  const crit = (w?.crit ?? 0) + sum(wg, (g) => g.crit) + (it("chest")?.crit ?? 0) + sum(globals.map(it), (x) => x?.crit);
  const as = (weaponKey === "bow" ? 0 : (w?.as ?? 0)) + sum([...armor, ...globals].map(it), (x) => x?.as) + sum(armorGears, (g) => g.as);
  const ms = sum(armor.map(it), (x) => x?.ms) + sum(armorGears, (g) => g.ms);
  const def = sum(armor.map(it), (x) => x?.def) + sum(armorGears, (g) => g.def);
  return { attack, crit, as, ms, def, critPct: critPct(crit), index: damageIndex(attack, crit) };
}
