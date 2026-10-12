"use client";
import { useState } from "react";
import type { Build, SlotKey, Tally } from "@/lib/cd/builds";
import { ITEMS } from "@/lib/cd/items";
import { GEARS } from "@/lib/cd/gears";
import { cdIcon } from "@/lib/asset";
import { GEAR_LOCS } from "@/lib/cd/map";
import { StatBars } from "./StatBars";

/*
 * Mirrors Kliff's inventory screen exactly:
 *  left column (5 small): glasses · necklace · secondary weapon · ranged (with count) · dagger
 *  centre (4 rows):       earring · HELM · earring / WEAPON · ARMOR · CLOAK / SECOND WEAPON · GLOVES · SHIELD / ring · BOOTS · ring
 *  right column (5 small): mask · lantern · pack · tool · bracelet
 * Gold bars top-left = refinement level. Orbs under a weapon = its abyss gear sockets.
 */
type Cell = { key?: SlotKey; label: string; big?: boolean };
const LEFT: Cell[] = [{ label: "Glasses" }, { key: "necklace", label: "Necklace" }, { key: "subWeapon", label: "Secondary weapon" }, { key: "bow", label: "Ranged" }, { label: "Dagger" }];
const RIGHT: Cell[] = [{ label: "Mask" }, { label: "Lantern" }, { key: "pack", label: "Pack" }, { label: "Tool" }, { label: "Axiom Bracelet" }];
const CENTER: Cell[][] = [
  [{ key: "earringL", label: "Earring" }, { key: "helm", label: "Headgear", big: true }, { key: "earringR", label: "Earring" }],
  [{ key: "mainWeapon", label: "Main weapon", big: true }, { key: "chest", label: "Armor", big: true }, { key: "cloak", label: "Cloak", big: true }],
  [{ key: "secondWeapon", label: "Second weapon", big: true }, { key: "gloves", label: "Gloves", big: true }, { key: "shield", label: "Shield", big: true }],
  [{ key: "ringL", label: "Ring" }, { key: "boots", label: "Footwear", big: true }, { key: "ringR", label: "Ring" }],
];

function Bars({ n }: { n: number }) {
  if (!n) return null;
  const cols = Math.ceil(n / 5);
  return (
    <div className="absolute left-1.5 top-1.5 flex gap-[2px]" aria-label={`+${n} refinement`}>
      {Array.from({ length: cols }).map((_, c) => (
        <div key={c} className="flex flex-col gap-[1px]">
          {Array.from({ length: Math.min(5, n - c * 5) }).map((_, i) => <span key={i} className="block h-[2px] w-[6px] rounded-[1px] bg-brass/90" />)}
        </div>
      ))}
    </div>
  );
}

const Cross = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-crimson-2/80" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
);

export function EquipmentPanel({ build, t, sel: selProp, onSelect, pinCount = 0, onShowOnMap }: { build: Build; t: Tally; sel?: SlotKey; onSelect?: (k: SlotKey) => void; pinCount?: number; onShowOnMap?: () => void }) {
  const [own, setOwn] = useState<SlotKey>("mainWeapon");
  const sel = selProp ?? own;
  const setSel = (k: SlotKey) => { setOwn(k); onSelect?.(k); };
  const eq = build.equipment[sel];
  const it = eq ? ITEMS[eq.item] : undefined;
  const ammo = build.equipment.ammo ? ITEMS[build.equipment.ammo.item] : undefined;

  const Slot = ({ c }: { c: Cell }) => {
    const e = c.key ? build.equipment[c.key] : undefined;
    const item = e ? ITEMS[e.item] : undefined;
    const active = !!c.key && sel === c.key;
    const na = !c.key || !item;
    const inner = c.big ? "rounded-full bg-[#2a2c33] ring-1 ring-white/10" : "rounded-md";
    return (
      <button type="button" disabled={na} onClick={() => c.key && setSel(c.key)} aria-pressed={active} title={item ? item.name : `${c.label}: not used by this build`}
        className={`relative aspect-square w-full rounded-lg bg-[#1f2126] transition ${c.big ? "p-[6%]" : "p-[10%]"} ${active ? "ring-2 ring-crimson-2" : "ring-1 ring-white/10"} ${na ? "cursor-default" : "hover:ring-white/40"}`}>
        {item ? (
          <>
            <Bars n={item.refine ?? 10} />
            <div className={`grid h-full w-full place-items-center ${inner}`}>
              <img src={cdIcon(item.slug)} alt={item.name} className={`${c.big ? "w-[72%]" : "w-[84%]"} drop-shadow-[0_3px_6px_rgba(0,0,0,.7)]`} />
            </div>
            {c.key === "bow" && ammo && <span className="game-serif absolute bottom-1 right-1.5 text-base leading-none text-white drop-shadow">∞</span>}
            {item.sockets > 0 && c.big && (
              <div className="absolute bottom-[3%] left-1/2 flex -translate-x-1/2 -space-x-[3px]">
                {Array.from({ length: item.sockets }).map((_, i) => {
                  const g = e!.gears[i];
                  return g ? (
                    <img key={i} src={cdIcon(g)} alt="" className={`h-[15px] w-[15px] rounded-full bg-black ring-1 ${GEARS[g].kind === "skill" ? "ring-crimson-2" : "ring-brass"}`} />
                  ) : (
                    <span key={i} className="block h-[15px] w-[15px] rounded-full bg-black/70 ring-1 ring-white/25" />
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className={`grid h-full w-full place-items-center ${inner} opacity-90`}>
            <Cross />
            <span className="sr-only">{c.label}: not used</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-[#131417] text-white ring-1 ring-white/10">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-5 sm:p-6">
          <div className="game-serif flex items-center gap-3 border-b border-white/10 pb-3 text-xl">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-sm">K</span> Kliff
          </div>
          <div className="relative mx-auto mt-5 grid max-w-[520px] grid-cols-[1fr_1.1fr_1.5fr_1.1fr_1fr] gap-2 sm:gap-2.5">
            {/* decorative dial behind the centre, as in game */}
            <svg className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-[.18]" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth=".5" /><circle cx="50" cy="50" r="34" fill="none" stroke="white" strokeWidth=".5" />
              <path d="M50 2v96M2 50h96" stroke="white" strokeWidth=".3" />
            </svg>
            <div className="grid grid-rows-5 gap-2 sm:gap-2.5">{LEFT.map((c) => <Slot key={c.label + "L"} c={c} />)}</div>
            <div className="col-span-3 grid grid-cols-[1.1fr_1.5fr_1.1fr] grid-rows-4 items-center gap-2 sm:gap-2.5">
              {CENTER.flat().map((c, i) => <Slot key={c.label + i} c={c} />)}
            </div>
            <div className="grid grid-rows-5 gap-2 sm:gap-2.5">{RIGHT.map((c) => <Slot key={c.label + "R"} c={c} />)}</div>
          </div>
          <StatBars t={t} />
        </div>

        <div className="min-w-0 border-t border-white/10 p-5 sm:p-6 lg:border-l lg:border-t-0">
          {it && eq ? (
            <div>
              <div className="flex items-start gap-4">
                <img src={cdIcon(it.slug)} alt="" className="h-20 w-20 rounded-2xl bg-[#1f2126] p-2 ring-1 ring-white/10" />
                <div className="min-w-0">
                  <h3 className="game-serif text-2xl leading-tight">{it.name}</h3>
                  <p className="text-sm text-white/60">{it.type ?? [...LEFT, ...RIGHT, ...CENTER.flat()].find((c) => c.key === sel)?.label}{it.tier ? ` · Tier ${it.tier}` : ""}{(it.refine ?? 10) ? ` · +${it.refine ?? 10}` : ""}</p>
                  <ul className="num mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {it.atk != null && <li>Attack <b>{it.atk}</b></li>}
                    {it.def != null && <li>Defense <b>{it.def}</b></li>}
                    {it.crit ? <li className="text-jade">Critical Rate <b>Lv {it.crit}</b></li> : null}
                    {it.as ? <li className="text-jade">Attack Speed <b>Lv {it.as}</b></li> : null}
                    {it.ms ? <li className="text-jade">Movement Speed <b>Lv {it.ms}</b></li> : null}
                    {it.fire ? <li className="text-jade">Fire Resistance <b>Lv {it.fire}</b></li> : null}
                    {it.ice ? <li className="text-jade">Ice Resistance <b>Lv {it.ice}</b></li> : null}
                  </ul>
                </div>
              </div>
              {it.special && <p className="mt-4 text-sm leading-relaxed text-white/80">{it.special}</p>}
              {sel === "bow" && ammo && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#1f2126] p-2.5 text-sm">
                  <img src={cdIcon(ammo.slug)} alt="" className="h-9 w-9" />
                  <div><b>{ammo.name}</b> <span className="text-white/50">· quiver</span><p className="text-white/70">{ammo.special}</p></div>
                </div>
              )}
              {it.sockets > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Abyss gear sockets · {eq.gears.length}/{it.sockets}{it.stock != null && it.stock < it.sockets ? ` (ships with ${it.stock}, a Witch opens the rest)` : ""}</p>
                  <ul className="mt-2 grid gap-2">
                    {eq.gears.map((g, i) => {
                      const G = GEARS[g];
                      return (
                        <li key={i} className="flex gap-3 rounded-xl bg-[#1f2126] p-2.5">
                          <img src={cdIcon(G.slug)} alt="" className="h-9 w-9 rounded-full ring-1 ring-white/10" />
                          <div className="min-w-0 text-sm">
                            <div className="flex flex-wrap items-baseline gap-x-2"><b>{G.name}</b>{G.trigger && <span className="text-white/50">{G.trigger}{G.pool && G.pool !== "none" ? ` · ${G.pool}` : ""}</span>}</div>
                            <p className="text-white/70">{G.effect}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {it.sockets === 0 && it.slot !== "ammo" && <p className="mt-4 text-sm text-white/60">This item takes no abyss gear.</p>}
              <div className="mt-4 text-sm leading-relaxed">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Where to get it</p>
                <p className="mt-1 text-white/80">{it.get}</p>
                {it.gate && it.gate !== "Open world" && <p className="mt-1 text-brass">Gate: {it.gate}</p>}
                {onShowOnMap && (pinCount > 0 ? (
                  <button type="button" onClick={onShowOnMap} className="mt-3 inline-flex items-center gap-2 rounded-full bg-crimson px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-crimson-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></svg>
                    Show on map · {pinCount} {pinCount === 1 ? "pin" : "pins"}
                  </button>
                ) : (
                  <p className="mt-3 text-[13px] text-white/50">No fixed map pin for this item.</p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/60">This slot is not used by the build.</p>
          )}
        </div>
      </div>
    </div>
  );
}
