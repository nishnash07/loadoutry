"use client";
import type { Build, SlotKey } from "@/lib/cd/builds";
import { ITEMS } from "@/lib/cd/items";
import { GEARS } from "@/lib/cd/gears";
import { COAST } from "@/lib/cd/coast";
import { BLACKSMITHS, GEAR_LOCS, ITEM_LOCS, REGIONS, TOWNS, UNLOCK_LOCS, VIEW, WITCHES, dbMapLink, toMap, type Loc } from "@/lib/cd/map";
import { cdIcon } from "@/lib/asset";

const KIND: Record<Loc["kind"], string> = { chest: "#d4a53c", boss: "#e8394f", vendor: "#8fb7e8", quest: "#c98be8", craft: "#9ad2a8", unlock: "#f0d27a" };

export function PywelMap({ build, sel, onSelect }: { build: Build; sel: SlotKey; onSelect: (k: SlotKey) => void }) {
  type Pin = { key: SlotKey; itemSlug: string; itemName: string; loc: Loc; via?: string };
  const pins: Pin[] = [];
  for (const [k, e] of Object.entries(build.equipment) as [SlotKey, { item: string; gears: string[] }][]) {
    const it = ITEMS[e.item];
    for (const loc of ITEM_LOCS[e.item] ?? []) pins.push({ key: k, itemSlug: it.slug, itemName: it.name, loc });
    for (const g of e.gears) for (const loc of GEAR_LOCS[g] ?? []) pins.push({ key: k, itemSlug: g, itemName: GEARS[g].name, loc, via: it.name });
  }
  const needsFlame = Object.values(build.equipment).some((e) => e.gears.some((g) => g === "volcanic-eruption" || g === "flames-of-judgment" || g === "shattering-frost"));
  const unlocks = needsFlame ? UNLOCK_LOCS : [];
  const noFix = (Object.entries(build.equipment) as [SlotKey, { item: string }][]).filter(([, e]) => !(ITEM_LOCS[e.item] ?? []).length).map(([k, e]) => ({ key: k, name: ITEMS[e.item].name }));
  const selPins = pins.filter((p) => p.key === sel);

  return (
    <div className="overflow-hidden rounded-3xl bg-[#131417] text-white ring-1 ring-white/10">
      <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="relative">
          <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="block w-full" role="img" aria-label="Map of Pywel with the build's item locations">
            <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill="#1e3a47" />
            <path d={COAST.join(" ")} fill="#d9d4c7" fillRule="evenodd" stroke="#6f6a5e" strokeWidth={0.25} strokeLinejoin="round" />
            {REGIONS.map((r) => { const p = toMap(r.x, r.y); return <text key={r.name} x={p.px} y={p.py} textAnchor="middle" fontSize={5.5} letterSpacing={1.2} fill="#5a554b" opacity={0.55} style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>{r.name}</text>; })}
            {BLACKSMITHS.map((b, i) => { const p = toMap(b.x, b.y); return <circle key={i} cx={p.px} cy={p.py} r={0.7} fill="#3a3a3a" opacity={0.6}><title>Blacksmith</title></circle>; })}
            {WITCHES.map((w, i) => { const p = toMap(w.x, w.y); return <g key={i} opacity={0.75}><circle cx={p.px} cy={p.py} r={1} fill="#7a4ea8" /><title>{w.n}</title></g>; })}
            {TOWNS.map((t) => { const p = toMap(t.x, t.y); return <g key={t.n}><rect x={p.px - 0.9} y={p.py - 0.9} width={1.8} height={1.8} fill="#2b2b2b" /><text x={p.px + 1.6} y={p.py + 0.9} fontSize={2.6} fill="#2b2b2b">{t.n}</text></g>; })}
            {unlocks.map((u, i) => { const p = toMap(u.x, u.y); return <g key={i}><circle cx={p.px} cy={p.py} r={1.5} fill={KIND.unlock} stroke="#131417" strokeWidth={0.5} /><title>{u.label}</title></g>; })}
            {pins.map((p, i) => {
              const m = toMap(p.loc.x, p.loc.y);
              const active = p.key === sel;
              return (
                <g key={i} onClick={() => onSelect(p.key)} style={{ cursor: "pointer" }} opacity={selPins.length && !active ? 0.45 : 1}>
                  <circle cx={m.px} cy={m.py} r={active ? 2.4 : 1.6} fill={KIND[p.loc.kind]} stroke={active ? "#fff" : "#131417"} strokeWidth={active ? 0.6 : 0.4} />
                  <title>{p.itemName}: {p.loc.label}</title>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-2 text-[11px] text-white/70">
            {(Object.keys(KIND) as Loc["kind"][]).map((k) => <span key={k} className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND[k] }} />{k}</span>)}
            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-[#3a3a3a]" />blacksmith</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-[#7a4ea8]" />witch</span>
          </div>
        </div>
        <div className="min-w-0 border-t border-white/10 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Where to get it</p>
          <ul className="mt-2 grid gap-2 max-h-[520px] overflow-y-auto pr-1">
            {pins.map((p, i) => (
              <li key={i}>
                <button type="button" onClick={() => onSelect(p.key)} className={`flex w-full items-start gap-3 rounded-xl p-2 text-left transition ${p.key === sel ? "bg-white/10 ring-1 ring-crimson-2" : "hover:bg-white/5"}`}>
                  <img src={cdIcon(p.itemSlug)} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-[#1f2126]" />
                  <span className="min-w-0 text-sm">
                    <span className="flex items-center gap-2"><i className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: KIND[p.loc.kind] }} /><b className="truncate">{p.itemName}</b></span>
                    <span className="block text-white/70">{p.loc.label}{p.via ? ` · via ${p.via}` : ""}</span>
                    {p.loc.note && <span className="block text-white/50">{p.loc.note}</span>}
                    <a href={dbMapLink(p.loc.x, p.loc.y)} target="_blank" rel="noreferrer" className="text-[12px] text-[#8fb7e8] hover:underline" onClick={(e) => e.stopPropagation()}>Open on the full interactive map ›</a>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {noFix.length > 0 && (
            <p className="mt-4 text-[12px] leading-relaxed text-white/50">No fixed pin: {noFix.map((n) => n.name).join(", ")}. These are crafted at any Blacksmith, bought from a travelling vendor, or dropped at a location the map data does not list (the Nest of Valor island).</p>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-white/40">Coastline traced from the public Pywel tiles at crimsondb.gg; pin coordinates from its marker data. World coordinates are the game&apos;s own.</p>
        </div>
      </div>
    </div>
  );
}
