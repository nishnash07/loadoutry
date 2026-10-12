"use client";
import { useState } from "react";
import type { Build, SlotKey, Tally } from "@/lib/cd/builds";
import { EquipmentPanel } from "./EquipmentPanel";
import { PywelMap } from "./PywelMap";

/** Equipment panel and map share one selected slot: tap a slot to light its pins, tap a pin to open the slot. */
export function BuildWorkbench({ build, t }: { build: Build; t: Tally }) {
  const [sel, setSel] = useState<SlotKey>("mainWeapon");
  return (
    <>
      <EquipmentPanel build={build} t={t} sel={sel} onSelect={setSel} />
      <section className="mt-10">
        <h2 className="text-3xl font-semibold">Where it all drops</h2>
        <p className="mt-3 max-w-3xl text-lg text-ink-2 leading-relaxed">Every pin is a confirmed map marker for this build&apos;s items and abyss gears. Select a slot above to highlight its pins; tap a pin to jump to the slot.</p>
        <div className="mt-6"><PywelMap build={build} sel={sel} onSelect={setSel} /></div>
      </section>
    </>
  );
}
