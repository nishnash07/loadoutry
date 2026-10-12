"use client";
import { useMemo, useState } from "react";
import type { Build, SlotKey, Tally } from "@/lib/cd/builds";
import { EquipmentPanel } from "./EquipmentPanel";
import { PywelMap, buildPins } from "./PywelMap";

/** Equipment panel and map share one selected slot: tap a slot to light its pins, tap a pin to open the slot. */
export function BuildWorkbench({ build, t }: { build: Build; t: Tally }) {
  const [sel, setSel] = useState<SlotKey>("mainWeapon");
  const [zoom, setZoom] = useState(false);
  const pins = useMemo(() => buildPins(build), [build]);
  const pinCount = (k: SlotKey) => pins.filter((p) => p.key === k).length;
  const showOnMap = () => {
    setZoom(true);
    document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <>
      <EquipmentPanel build={build} t={t} sel={sel} onSelect={(k) => { setSel(k); setZoom(false); }} pinCount={pinCount(sel)} onShowOnMap={showOnMap} />
      <section id="map" className="mt-10 scroll-mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Where it all drops</h2>
            <p className="mt-3 max-w-3xl text-lg text-ink-2 leading-relaxed">Every pin is a confirmed map marker for this build&apos;s items and abyss gears. Select a slot above to highlight its pins; tap a pin to jump to the slot.</p>
          </div>
          <div className="flex gap-2 text-[14px]">
            <button type="button" onClick={() => setZoom(false)} className={`rounded-full px-4 py-2 font-medium ${!zoom ? "bg-accent text-white" : "bg-paper-2"}`}>Whole map</button>
            <button type="button" onClick={() => setZoom(true)} disabled={!pinCount(sel)} className={`rounded-full px-4 py-2 font-medium disabled:opacity-40 ${zoom ? "bg-accent text-white" : "bg-paper-2"}`}>Zoom to selection</button>
          </div>
        </div>
        <div className="mt-6"><PywelMap build={build} sel={sel} onSelect={(k) => { setSel(k); setZoom(true); }} zoomToSel={zoom} /></div>
      </section>
    </>
  );
}
