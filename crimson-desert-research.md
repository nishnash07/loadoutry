# Crimson Desert build research dossier (2026-10-12)

Installed game: Steam appid 3321460 "Crimson Desert Enhanced", build 25477059, last patched 2026-10-06 (post 2.00/2.01). Install: `C:\Program Files (x86)\Steam\steamapps\common\Crimson Desert` (152 GB, PAZ/PAMT archives).

## 1. Sources and how much to trust them

| Source | What it gives | Trust |
|---|---|---|
| Game files (extracted with NattKh/lazorr410 unpackers) | Internal IDs, item list (6811 entries), table names (skill, equipslotinfo, socketinfo, buffinfo, statusinfo). Stats/costs are in unlabeled binary schemas; English strings in `gamestring.binarystring` use a custom compression the tools can't open. | Confirms structure only |
| crimsondb.gg (v1.17 data, datamined) | Per-item stats at every refinement +0..+10, sockets, embedded gears, recipes, 190 abyss gears | High for numbers |
| thegameswiki / vulkk / dropreference / game8 | Mechanics, caps, slot rules, tier lists | Medium, community-tested |
| Nizar GG videos (12 Apr & 19 Apr 2026, patch ~1.0x) | Build logic and in-game observations | Medium; pre-2.0 |

Transcripts: `yt/Hs4BnVmTmbA.txt` (part 1, two-handed), `yt/q7GLLwlcM-w.txt` (part 2, 3-in-1).

## 2. Hard rules of the equipment system

**Sockets (typical maximum; some unique pieces differ, e.g. Unyielding Hero set has 3 on gloves/boots)**
- Two-handed weapon 5, bow/ranged 5, one-handed weapon 3, shield 2
- Head 1, chest 3, gloves 2, boots 2, cloak 0, accessories 0
- Sockets are bought from a Witch (silver, escalating; all 5 on one item ≈105 silver). Embed/extract is free. Kuku Flame/Ice/Lightning-Resistant chests have 0 sockets.

**Gear categories and where they fit (consolidated)**
- Offensive stat gears (Destruction = Attack, Insight = Crit, Swift = Attack Speed, Relentless, Banes, Rend/Shatter/Shred): weapons, gloves, boots, bow
- Defensive/utility (Aegis = DR, Fortification = Def, Vigor, Vitality, Composure, Haste, wards, Gourmet, Aptitude): chest, helm, shield (some boots/gloves)
- Melee skill gears (Groundsurge, Greysoul Howling, Shadow Claw, Crow's Pursuit, Hound's Claws, Wound of Darkness, Frost Spike, Spirit's Judgment, Abyssal Rays...): melee weapons only
- Armor skill gears needing an element imbue (Volcanic Eruption, Flames of Judgment, Pillar of Wind, Shattering Frost): gloves/boots (they ship in gloves; Nizar runs them on boots)
- Momentum (+35% Turning Slash dmg): helmet (also fits weapon/gloves/boots) — helm is the free slot
- Infinite Arrows: bow only

**Where a stat actually applies (this is the rule most builds get wrong)**
- Attack and Crit on a weapon apply only to attacks with that weapon. Attack/Crit on gloves/boots apply only to punches/kicks. So Insight on gloves is wasted for a sword build.
- Attack and Crit on necklace/rings: global, all weapons. Crit on a chest piece (Kuku Flame-Resistant Armor): global.
- Attack Speed on armor/gloves/boots/accessories: global. Attack Speed on a weapon or shield: only while that item is in hand.
- Defense and Movement Speed: global from everything, including a shield stowed on your back while using a two-hander. Damage Reduction (Aegis) on a shield: only while the shield is held.
- Dual wield: weapon crit on both swords applies to both (one forum claim, unverified).
- Caps: Crit, Attack Speed, Movement Speed all hard-cap at Lv 15 (anything above is wasted). Elemental resistance thresholds at 5/10/15.

**Stat conversion (community consensus, not official)**
- Crit: ~5% base, ~+2%/level, ~35% at Lv 15. A crit is a flat 2x hit. (game8 measured: Lv5 13-16%, Lv10 24-25%, Lv15 33-35%.)
- Attack Speed: animation speed only; diminishing (one tester: Lv1 ~14%, Lv5 ~24%, Lv10 ~28%, Lv15 ~31%). Does not reduce costs/cooldowns.
- Refinement +0→+10 roughly triples weapon attack (e.g. 12→35) and bumps the innate Crit/AS level by +1 at +10 only. +5 and beyond cost 1 Abyss Artifact each; +10 costs 1 Aeserion's Scale.

**Attack vs crit math (explains the "53 attack" rule from the video)**
Expected damage ∝ Attack × (1 + crit chance). +1 Attack is worth 1/Attack; +1 crit level is worth 0.02/(1+c).
Break-even Attack = 50 × (1 + c). At base crit 5-6% that is ≈53: above 53 total attack, a crit level beats an attack point — but only while crit is low. At Lv 12 crit (~29%) the break-even is ~65 attack, so near the cap, Destruction III (+3 atk) beats Insight III. Practical rule: get to Lv 15 crit using sources that cost no weapon sockets (chest, necklace, weapon innate), then fill weapon sockets with Attack. "Total attack" = weapon attack + necklace attack + ring attack. Caveat: if enemy defense is a flat subtraction (unknown), attack is worth even more.

**Resources**
- Turning Slash: 10 Spirit (20 when element-imbued). Forward Slash / heavy attack: Stamina. Each skill gear "consumes additional Spirit/Stamina" on top (amounts not published; Nizar found 2 Turning-Slash gears sustainable, 3 drains too fast).
- Spirit regen: White Lion / Necklace of Lightning +0.3/s at +9/+10, Composure III +0.3/s, Focus skill, kills refund Spirit. Stamina regen: Witch's Ring +6%, White Horn's/Tigerfang +8%, Vigor III +6%.

## 3. Trigger map of the skill gears that matter

| Gear | Trigger | Cost | Notes | Source |
|---|---|---|---|---|
| Groundsurge | Turning Slash (R1+R2 / LMB+RMB) | Spirit | Cone of stone spikes, hits twice (impact + burst), high stagger; ~2x Wound of Darkness damage in a wiki test; physical | Extract from Melted Ambition (Myurdin, Ch 6/7) or craft (Destruction I + Fortification I + Aegis I) |
| Greysoul Howling | Turning Slash | Spirit | Goyen's phantom copies the slash (wide sweep, lower dmg); stacks with Momentum | Fated Shadow sword (Goyen, Nest of Valor, Ch 9) or craft |
| Wound of Darkness | Turning Slash | Spirit (high) | 3 dark blades, knockback, strong stagger | Back-alley merchant, Port Delesyia, 40 silver |
| Momentum | passive | — | +35% Turning Slash damage | Leather Helm of the Fallen Kingdom (Sanctum of Benediction, Hernand) or craft |
| Shadow Claw | Heavy Attack / Forward Slash | Stamina | 3 forward swipes, strong vs bosses | Black Fang, "Legendary Wolf" faction quest |
| Crow's Pursuit | Heavy Attack / Forward Slash | Stamina | Crows home in; avg dmg, good stagger | Tauria Curved Sword / Crowcaller (Ch 5) |
| Crow Storm | Heavy Attack | Stamina | Upgraded Crow's Pursuit | Hexe Marie (Ch 9) |
| Ator's Orb | Heavy Attack | Stamina | Tracking orbs, low dmg, constant stagger | Darkbringer |
| Hound's Claws | Spinning Slash (R1+X) | Stamina | Wide claw sweep, guard break | Hemon Beindel, "The Hellhounds" |
| Spirit's Judgment | Evasive step (needs Sword Mastery Lv2) | Stamina | Spectral knight charge | After Fortain (Ch 8) |
| Abyssal Rays | repeated attack / dodge→attack / jump→attack | none listed | Light beams, stun | Back-alley shop Demeniss |
| Frost Spike | skill key | Spirit | Frontal ice cone, big AoE | Beloth, "Wraith in the Frost" |
| Volcanic Eruption | any Flame-imbued attack | Spirit | Molten boulder AoE; the "comets" | Scorchflame Plate Gloves (Twilight Grotto) |
| Flames of Judgment | any Flame-imbued attack | Spirit | Homing flame sparks; the "fire balls" | Eclipsed Solas Plate Gloves (Lucian Bastier, Ch 8 "Traitor") |
| Relentless | passive, consecutive hits | — | ~+1% per hit, resets when hit; one tier only | Combat God's Plate Gloves (Muskan) / Starlight Cave |
| Infinite Arrows II + III | passive | — | 40% + 60% = 100% no arrow use | Karanda (Pailune faction) + witch synthesis; Greater version = 100% alone but has durability |

Same-trigger gears all fire on one input (e.g. Groundsurge + Greysoul on every Turning Slash). The explosions/fireballs in the videos = Flame imbue (Imbue Element Lv1 + Flame Strike, unlocked via Spire of Ringing Truth → Tree of Slumber abyss chain) feeding Volcanic Eruption + Flames of Judgment on every imbued Turning Slash or Charged Shot.

## 4. Item numbers at +10 (crimsondb.gg)

**Weapons**
- Vow of the Dead King (halberd, spear moveset): 35 atk, Crit Lv4, 3 sockets stock (buy up to 5). Frostveiled Castle Ruins dungeon, N Pailune; also sold by Gorio/Skog.
- Gamma Barrel Cannon (2H cannon, spear moveset): 31 atk, Crit Lv3 (video claims 39; crimsondb says 31). Craft "Two-Handed Weapons Vol. IV"; Sky Galleon merchant.
- Bismuth / Finest Rhinard cannon: 43 atk, 0 crit (per video).
- Darkbringer (longsword): 39 atk, Crit Lv3, Ator's Orb + Swift I + Insight I.
- Fated Shadow (1H sword): 34 atk, 3 sockets, ships Greysoul Howling + Destruction I + Swift I.
- Any 34-atk 1H sword (Aeserion Sword, Sword of the Wolf per video) for the second dual-wield blade.
- Golden-Knotted Ancestral Bow: 33 atk, ships Destruction II + Insight I + Life Transference. Any 33-atk bow is equivalent (Noble Man's, Divine Echoes, Aeserion, Crimson Warden's).

**Armor**
- Kuku Flame-Resistant Armor (chest): 38 def, Crit Lv3 (global), Fire Res 10, heat-absorb burst; 0 sockets. Craft at Kuku Pot: Enhanced Kuku Pot + Scorchflame Plate Armor + Power Core Casket of Illusions + Core of Absolution (Kuku Gear Special Blueprint).
- Tariv Cloth Gloves: 27 atk(unarmed), 12 def, Attack Speed Lv3 (global). Craft "Cloth Armors Vol. IV" or Elise/Eric.
- Tariv Cloth Boots: 27 atk, 12 def, Movement Speed Lv3.
- Unyielding Hero's Plate Helm: 17 def, Daze Immunity, 1 socket. Back Alley Shop, Calphade (Thrak), ~16.8 silver, may need Cassius Morten defeated.
- Leather Helm of the Fallen Kingdom: Momentum source.
- Any plate set for the rest (sets have no set bonus).

**Accessories (max refine)**
- White Lion Necklace: 5 atk, Crit Lv4, +0.3 Spirit/s (OmarVar Equipment / craft). Necklace of Lightning identical stats.
- Engraved Gold Earring ×2 (or Ancient Earring / Witch's Earring / Black Lion): 6 def, Movement Speed Lv4, HP regen each.
- White Horn's Ring / Tigerfang Ring: 7 atk, +8% stamina regen. Signets (Pailunese/Greymane/Tashkalpian): 11 atk, Crit Lv1, +2% stam regen (not refinable per one source).
- Witch's Ring: 3 atk, Attack Speed Lv4, +6% stam regen. Mark of Darkness same.

**Shield (stowed, passive)**: any MS Lv2 shield (Demeniss Royal Guard, Shield of Radiance, Black Sun, Mirror of Night: 15 def) + 2 defensive sockets.

**Pack slot**: Kuku Watcher Pack — two invulnerable drones, auto-fire, strong passive stagger, no cooldown. Blueprint II from Bari (Witch of Kindness) via Sanctum of Atonement; craft at Kilnden Workshop (Kuku Pack + Electrical Components + Clockwork Insects + Small Batteries + Abyss Cell No. 0). Competes with Spitter weapons for the slot.

## 5. Nizar GG's build, decoded

Part 1 (2H): spear-moveset weapon for Turning Slash reach (Vow of the Dead King or Gamma Barrel Cannon) → 2× Insight III + Greysoul Howling + Groundsurge + Shadow Claw. Momentum on helm. Flames of Judgment + Volcanic Eruption on boots (fire imbue). 2× MS earrings, White Lion necklace, 1 crit ring + Witch's Ring. Plate armor, 3× Aegis III + 2× Fortification III split over chest/shield, Vigor on gloves. Skills: max Turning Slash + Forward Slash (Proficiency lets Forward Slash chain into Turning Slash), Nature's Echo, Quick Swap.
Part 2 (3-in-1): Kuku Watcher Pack; Kuku Flame-Resistant chest for global Crit 3; Tariv gloves (AS3) with 2× Swift III + Relentless; Tariv boots; MS2 shield; swap one Insight on the 2H for Destruction III; swap crit ring for a 7-atk ring to pass 53 total attack. Bow: 33-atk bow, Infinite Arrows II+III + 3× Insight III, one Explosive Arrow, Charged Shot + Evasive Shot maxed. Dual wield: two 34-atk swords, each Insight + Crow's Pursuit + Shadow Claw (Hound's Claws optional); Turning Slash gears on the 2H still benefit.

## 6. Open gaps (see chat message)

## 7. Decoded from game files (gamedata/statusinfo, group 0008) — 2026-10-12

16-step per-level curves (raw u64 / 1e9). Crit and Attack Speed share one curve; Movement Speed differs.

| Lv | Crit / AtkSpd | MoveSpd |
|---|---|---|
| 1 | 7.42 | 5.12 |
| 2 | 14.08 | 10.24 |
| 3 | 19.97 | 15.36 |
| 4 | 25.34 | 20.48 |
| 5 | 30.21 | 25.60 |
| 6 | 34.82 | 30.72 |
| 7 | 38.91 | 35.58 |
| 8 | 42.75 | 40.19 |
| 9 | 46.34 | 44.54 |
| 10 | 49.66 | 48.64 |
| 11 | 52.74 | 52.22 |
| 12 | 55.81 | 55.55 |
| 13 | 58.62 | 58.62 |
| 14 | 61.44 | 61.44 |
| 15 | 64.00 | 64.00 |

Units are unlabeled. Calibrating to community crit measurements (Lv5 13-16%, Lv10 24-25%, Lv15 33-35%) gives crit% ≈ 5 + 0.53 × table. CriticalDamage has no curve (constant multiplier, community: 2x). Hit stat (DHIT) is linear 2^25 per level to Lv10 then half steps.

Weapon list (crimsondb, +10): spear-moveset options — Vow of the Dead King 35/Crit4 (halberd), Alabaster & Lambert Halberd 35/Crit4 (craftable), Awakened Spirit/Iris/Bonepit Halberd 36/Crit3, Aeserion/Celeste/Golden Vanguard/Gilliam Halberd 39/Crit1, Soul Spear 40 (Elowen), Thorn of Dark Pursuit & Frostfang 38/AS1, Elite Vanguard 35/AS3, Bismuth Cannon 34, Gamma Barrel Cannon 31/Crit3. Longswords: Hwando/Vessel of Dark Pursuit 43, Darkbringer 39/Crit3. 1H swords: 34 flat (Fated Shadow, Aeserion, Wolf's Fang, Tauria Curved) or 30 with Lv2 stat. Bows: 33 flat or 30/Lv2.

Artifact: https://claude.ai/artifact/EYys5d5pLhgEi4GkasMBmm (kliff-build-codex.html)
