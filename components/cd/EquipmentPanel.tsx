"use client";
import { useState } from "react";
import type { Build, SlotKey } from "@/lib/cd/builds";
import { ITEMS } from "@/lib/cd/items";
import { GEARS } from "@/lib/cd/gears";
import { cdIcon } from "@/lib/asset";
import { StatBars } from "./StatBars";
import type { Tally } from "@/lib/cd/builds";

/* Grid mirrors the in-game inventory: small side slots, large centre column, socket pips top-left, gear orbs under weapons. */
type Cell = { key: SlotKey; label: string; big?: boolean; area: string };
const CELLS: Cell[] = [
  { key: "earringL", label: "Earring", area: "1/2" }, { key: "helm", label: "Headgear", big: true, area: "1/3" }, { key: "earringR", label: "Earring", area: "1/4" }, { key: "cloak", label: "Cloak", area: "1/5" },
  { key: "necklace", label: "Necklace", area: "2/1" }, { key: "mainWeapon", label: "Main weapon", big: true, area: "2/2" }, { key: "chest", label: "Armor", big: true, area: "2/3" }, { key: "bow", label: "Bow", big: true, area: "2/4" },
  { key: "secondWeapon", label: "Second weapon", big: true, area: "3/2" }, { key: "gloves", label: "Gloves", big: true, area: "3/3" }, { key: "shield", label: "Shield", big: true, area: "3/4" }, { key: "pack", label: "Pack", area: "3/5" },
  { key: "ammo", label: "Arrows", area: "4/1" }, { key: "ringL", label: "Ring", area: "4/2" }, { key: "boots", label: "Footwear", big: true, area: "4/3" }, { key: "ringR", label: "Ring", area: "4/4" },
];

function Pips({ max, used }: { max: number; used: number }) {
  if (!max) return null;
  return (
    <div className="absolute left-1.5 top-1.5 flex gap-[2px]" aria-label={`${used} of ${max} sockets used`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`block h-3 w-[3px] rounded-[1px] ${i < used ? "bg-brass" : "bg-white/20"}`} />
      ))}
    </div>
  );
}

export function EquipmentPanel({ build, t }: { build: Build; t: Tally }) {
  const [sel, setSel] = useState<SlotKey>("mainWeapon");
  const eq = build.equipment[sel];
  const it = eq ? ITEMS[eq.item] : undefined;
  return (
    <div className="rounded-3xl bg-game text-white overflow-hidden hairline border-game-line">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-5 sm:p-6">
          <div className="game-serif flex items-center gap-3 border-b border-game-line pb-3 text-xl">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-sm">K</span> Kliff
          </div>
          <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3 max-w-[460px]" style={{ gridTemplateRows: "repeat(4, auto)" }}>
            {CELLS.map((c) => {
              const e = build.equipment[c.key];
              const item = e ? ITEMS[e.item] : undefined;
              const [r, col] = c.area.split("/");
              const active = sel === c.key;
              return (
                <button key={c.key} type="button" onClick={() => setSel(c.key)} aria-pressed={active} title={item ? item.name : `${c.label} (empty)`}
                  style={{ gridRow: r, gridColumn: col }}
                  className={`relative aspect-square rounded-xl bg-game-2 transition ${c.big ? "p-2" : "p-1.5"} ${active ? "ring-2 ring-crimson-2" : "ring-1 ring-game-line hover:ring-white/40"}`}>
                  {item ? (
                    <>
                      <Pips max={item.sockets} used={e!.gears.length} />
                      <div className={`mx-auto grid h-full w-full place-items-center rounded-full ${c.big ? "bg-game-3" : ""}`}>
                        <img src={cdIcon(item.slug)} alt={item.name} className={`${c.big ? "w-[78%]" : "w-[82%]"} drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]`} />
                      </div>
                      {e!.gears.length > 0 && c.big && (
                        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-[2px]">
                          {e!.gears.map((g, i) => (
                            <img key={i} src={cdIcon(g)} alt="" className={`h-4 w-4 rounded-full ring-1 ${GEARS[g].kind === "skill" ? "ring-crimson-2" : "ring-brass"}`} />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="sr-only">{c.label} empty</span>
                  )}
                </button>
              );
            })}
          </div>
          <StatBars t={t} />
        </div>

        <div className="border-t border-game-line p-5 sm:p-6 lg:border-l lg:border-t-0 min-w-0">
          {it && eq ? (
            <div>
              <div className="flex items-start gap-4">
                <img src={cdIcon(it.slug)} alt="" className="h-20 w-20 rounded-2xl bg-game-2 p-2 ring-1 ring-game-line" />
                <div className="min-w-0">
                  <h3 className="game-serif text-2xl leading-tight">{it.name}</h3>
                  <p className="text-sm text-white/60">{it.type ?? CELLS.find((c) => c.key === sel)?.label}{it.tier ? ` · Tier ${it.tier}` : ""} · +10</p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm num">
                    {it.atk != null && <li>Attack <b>{it.atk}</b></li>}
                    {it.def != null && <li>Defense <b>{it.def}</b></li>}
                    {it.crit ? <li className="text-jade">Critical Rate <b>Lv {it.crit}</b></li> : null}
                    {it.as ? <li className="text-jade">Attack Speed <b>Lv {it.as}</b></li> : null}
                    {it.ms ? <li className="text-jade">Movement Speed <b>Lv {it.ms}</b></li> : null}
                  </ul>
                </div>
              </div>
              {it.special && <p className="mt-4 text-sm text-white/80 leading-relaxed">{it.special}</p>}
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Abyss gear sockets · {eq.gears.length}/{it.sockets}{it.stock != null && it.stock < it.sockets ? ` (ships with ${it.stock}, Witch opens the rest)` : ""}</p>
                {it.sockets === 0 && <p className="mt-1 text-sm text-white/70">No sockets on this item.</p>}
                <ul className="mt-2 grid gap-2">
                  {eq.gears.map((g, i) => {
                    const G = GEARS[g];
                    return (
                      <li key={i} className="flex gap-3 rounded-xl bg-game-2 p-2.5">
                        <img src={cdIcon(G.slug)} alt="" className="h-9 w-9 rounded-full ring-1 ring-game-line" />
                        <div className="min-w-0 text-sm">
                          <div className="flex flex-wrap items-baseline gap-x-2"><b>{G.name}</b>{G.trigger && <span className="text-white/50">{G.trigger}{G.pool && G.pool !== "none" ? ` · ${G.pool}` : ""}</span>}</div>
                          <p className="text-white/70">{G.effect}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="mt-4 text-sm leading-relaxed">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Where to get it</p>
                <p className="mt-1 text-white/80">{it.get}</p>
                {it.gate && it.gate !== "Open world" && <p className="mt-1 text-brass">Gate: {it.gate}</p>}
              </div>
            </div>
          ) : (
            <p className="text-white/60">Empty slot.</p>
          )}
        </div>
      </div>
    </div>
  );
}
