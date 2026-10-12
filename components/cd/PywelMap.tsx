"use client";
import { useMemo, useState } from "react";
import type { Build, SlotKey } from "@/lib/cd/builds";
import { ITEMS } from "@/lib/cd/items";
import { GEARS } from "@/lib/cd/gears";
import { COAST, RELIEF } from "@/lib/cd/coast";
import { BLACKSMITHS, GEAR_LOCS, ITEM_LOCS, REGIONS, TOWNS, UNLOCK_LOCS, VIEW, WITCHES, dbMapLink, toMap, type Loc } from "@/lib/cd/map";
import { cdIcon } from "@/lib/asset";

export const KIND: Record<Loc["kind"], { color: string; label: string }> = {
  chest: { color: "#d9a441", label: "chest" }, boss: { color: "#d6453a", label: "boss" }, vendor: { color: "#5b9bd5", label: "vendor" },
  quest: { color: "#9b6fd0", label: "quest" }, craft: { color: "#4fa77a", label: "craft" }, unlock: { color: "#e8c35a", label: "unlock" },
};

export type Pin = { key: SlotKey; itemSlug: string; itemName: string; loc: Loc; via?: string };

export function buildPins(build: Build): Pin[] {
  const pins: Pin[] = [];
  for (const [k, e] of Object.entries(build.equipment) as [SlotKey, { item: string; gears: string[] }][]) {
    const it = ITEMS[e.item];
    for (const loc of ITEM_LOCS[e.item] ?? []) pins.push({ key: k, itemSlug: it.slug, itemName: it.name, loc });
    for (const g of e.gears) for (const loc of GEAR_LOCS[g] ?? []) pins.push({ key: k, itemSlug: g, itemName: GEARS[g].name, loc, via: it.name });
  }
  return pins;
}

export function PywelMap({ build, sel, onSelect, zoomToSel }: { build: Build; sel: SlotKey; onSelect: (k: SlotKey) => void; zoomToSel: boolean }) {
  const pins = useMemo(() => buildPins(build), [build]);
  const [hover, setHover] = useState<number | null>(null);
  const needsImbue = Object.values(build.equipment).some((e) => e.gears.some((g) => g === "volcanic-eruption" || g === "flames-of-judgment" || g === "shattering-frost"));
  const unlocks = needsImbue ? UNLOCK_LOCS : [];
  const noFix = (Object.entries(build.equipment) as [SlotKey, { item: string }][]).filter(([, e]) => !(ITEM_LOCS[e.item] ?? []).length).map(([, e]) => ITEMS[e.item].name);
  const selPins = pins.filter((p) => p.key === sel);

  // viewBox: whole continent, or a window around the selected slot's pins
  let vb = VIEW;
  if (zoomToSel && selPins.length) {
    const ps = selPins.map((p) => toMap(p.loc.x, p.loc.y));
    const minx = Math.min(...ps.map((p) => p.px)), maxx = Math.max(...ps.map((p) => p.px)), miny = Math.min(...ps.map((p) => p.py)), maxy = Math.max(...ps.map((p) => p.py));
    const size = Math.max(40, maxx - minx + 24, maxy - miny + 24);
    vb = { x: (minx + maxx) / 2 - size / 2, y: (miny + maxy) / 2 - size / 2, w: size, h: size };
  }
  const k = vb.w / 150; // scale factor so strokes and markers keep their on-screen size when zoomed

  return (
    <div className="overflow-hidden rounded-3xl bg-[#131417] text-white ring-1 ring-white/10">
      <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="relative bg-[#2f4f60]">
          <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="block w-full transition-[view-box] duration-500" role="img" aria-label="Map of Pywel with the build's item locations" style={{ fontFamily: "var(--font-serif, 'Iowan Old Style', Georgia, serif)", letterSpacing: 0 }}>
            <defs>
              <filter id="paper" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope="0.08" /></feComponentTransfer><feBlend in2="SourceGraphic" mode="multiply" /></filter>
              <filter id="coastglow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={1.2 * k} /></filter>
              <pattern id="waves" width={6 * k} height={6 * k} patternUnits="userSpaceOnUse"><path d={`M0 ${3 * k} q${1.5 * k} -${1.2 * k} ${3 * k} 0 t${3 * k} 0`} fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth={0.35 * k} /></pattern>
            </defs>
            <rect x={vb.x - 50} y={vb.y - 50} width={vb.w + 100} height={vb.h + 100} fill="#355a6c" />
            <rect x={vb.x - 50} y={vb.y - 50} width={vb.w + 100} height={vb.h + 100} fill="url(#waves)" />
            {/* coastal shelf glow */}
            <path d={COAST.join(" ")} fill="#6f8f9d" fillRule="evenodd" filter="url(#coastglow)" opacity={0.7} />
            <g filter="url(#paper)">
              <path d={COAST.join(" ")} fill="#d9d6cf" fillRule="evenodd" stroke="#8d9ba3" strokeWidth={0.22 * k} strokeLinejoin="round" />
              <path d={RELIEF.join(" ")} fill="#b9b6ae" opacity={0.38} />
            </g>
            {REGIONS.map((r) => { const p = toMap(r.x, r.y); return <text key={r.name} x={p.px} y={p.py} textAnchor="middle" fontSize={5.2 * k} letterSpacing={1.6 * k} fill="#6b6459" opacity={0.75}>{r.name}</text>; })}
            {BLACKSMITHS.map((b, i) => { const p = toMap(b.x, b.y); return <circle key={i} cx={p.px} cy={p.py} r={0.55 * k} fill="#4a4a4a" opacity={0.55}><title>Blacksmith</title></circle>; })}
            {WITCHES.map((w, i) => { const p = toMap(w.x, w.y); return <g key={i} opacity={0.8}><circle cx={p.px} cy={p.py} r={0.8 * k} fill="#7a4ea8" /><title>{w.n}</title></g>; })}
            {TOWNS.map((t) => { const p = toMap(t.x, t.y); return <g key={t.n}><rect x={p.px - 0.8 * k} y={p.py - 0.8 * k} width={1.6 * k} height={1.6 * k} fill="#2b2b2b" /><text x={p.px + 1.4 * k} y={p.py + 0.8 * k} fontSize={2.4 * k} fill="#2b2b2b" stroke="#e8e5de" strokeWidth={0.5 * k} paintOrder="stroke" style={{ fontFamily: "var(--font-sans)" }}>{t.n}</text></g>; })}
            {unlocks.map((u, i) => { const p = toMap(u.x, u.y); return <g key={i}><circle cx={p.px} cy={p.py} r={1.5 * k} fill={KIND.unlock.color} stroke="#131417" strokeWidth={0.4 * k} /><text x={p.px + 2.2 * k} y={p.py + 0.8 * k} fontSize={2.2 * k} fill="#2b2b2b" stroke="#e8e5de" strokeWidth={0.5 * k} paintOrder="stroke" style={{ fontFamily: "var(--font-sans)" }}>{u.label}</text></g>; })}
            {pins.map((p, i) => {
              const m = toMap(p.loc.x, p.loc.y);
              const active = p.key === sel;
              const dim = selPins.length > 0 && !active;
              return (
                <g key={i} onClick={() => onSelect(p.key)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }} opacity={dim ? 0.4 : 1}>
                  {active && <circle cx={m.px} cy={m.py} r={3.2 * k} fill="none" stroke={KIND[p.loc.kind].color} strokeWidth={0.5 * k} opacity={0.8} />}
                  <circle cx={m.px} cy={m.py} r={(active ? 2 : 1.4) * k} fill={KIND[p.loc.kind].color} stroke="#ffffff" strokeWidth={0.45 * k} />
                  {((active && zoomToSel) || hover === i) && (
                    <text x={m.px} y={m.py - 3.2 * k} textAnchor="middle" fontSize={2.6 * k} fontWeight={600} fill="#1d1d1f" stroke="#f4f1ea" strokeWidth={0.7 * k} paintOrder="stroke" style={{ fontFamily: "var(--font-sans)" }}>{p.itemName}</text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-x-3 gap-y-1 bg-[#131417] px-4 py-2 text-[11px] text-white/70">
            {(Object.keys(KIND) as Loc["kind"][]).map((kk) => <span key={kk} className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND[kk].color }} />{KIND[kk].label}</span>)}
            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-[#4a4a4a]" />blacksmith</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-[#7a4ea8]" />witch</span>
          </div>
        </div>
        <div className="min-w-0 border-t border-white/10 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Where to get it</p>
          <ul className="mt-2 grid max-h-[560px] gap-2 overflow-y-auto pr-1">
            {pins.map((p, i) => (
              <li key={i}>
                <button type="button" onClick={() => onSelect(p.key)} className={`flex w-full items-start gap-3 rounded-xl p-2 text-left transition ${p.key === sel ? "bg-white/10 ring-1 ring-crimson-2" : "hover:bg-white/5"}`}>
                  <img src={cdIcon(p.itemSlug)} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-[#1f2126]" />
                  <span className="min-w-0 text-sm">
                    <span className="flex items-center gap-2"><i className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: KIND[p.loc.kind].color }} /><b className="truncate">{p.itemName}</b></span>
                    <span className="block text-white/70">{p.loc.label}{p.via ? ` · via ${p.via}` : ""}</span>
                    {p.loc.note && <span className="block text-white/50">{p.loc.note}</span>}
                    <a href={dbMapLink(p.loc.x, p.loc.y)} target="_blank" rel="noreferrer" className="text-[12px] text-[#8fb7e8] hover:underline" onClick={(e) => e.stopPropagation()}>Open on the full interactive map ›</a>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {noFix.length > 0 && <p className="mt-4 text-[12px] leading-relaxed text-white/50">No fixed pin: {noFix.join(", ")}. Crafted at any Blacksmith, bought from a travelling vendor, or dropped somewhere the map data does not list (the Nest of Valor island).</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-white/40">Coast, rivers and relief traced from the public Pywel tiles at crimsondb.gg; pin coordinates from its marker data. World coordinates are the game&apos;s own.</p>
        </div>
      </div>
    </div>
  );
}
