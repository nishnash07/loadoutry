"use client";
import { useState } from "react";
import { critPct } from "@/lib/cd/stats";

export function Calculator() {
  const [a, setA] = useState(56);
  const [c, setC] = useState(11);
  const cc = critPct(c) / 100;
  const gA = (1 / a) * 100;
  const gC = ((critPct(c + 1) - critPct(c)) / 100 / (1 + cc)) * 100;
  const g3A = (3 / a) * 100;
  const g3C = ((critPct(Math.min(15, c + 3)) - critPct(c)) / 100 / (1 + cc)) * 100;
  const be = Math.round((100 * (1 + cc)) / (critPct(c + 1) - critPct(c)));
  return (
    <div className="card p-6 grid gap-5">
      <label className="grid gap-2 text-[15px]">
        <span className="flex justify-between">Total Attack on the weapon <b className="num">{a}</b></span>
        <input id="atk" type="range" min={20} max={90} value={a} onChange={(e) => setA(+e.target.value)} className="accent-accent" />
      </label>
      <label className="grid gap-2 text-[15px]">
        <span className="flex justify-between">Crit level before adding more <b className="num">Lv {c}</b></span>
        <input id="crit" type="range" min={0} max={14} value={c} onChange={(e) => setC(+e.target.value)} className="accent-accent" />
      </label>
      <div className="rounded-2xl bg-paper p-4 text-[15px] leading-relaxed num">
        <p>+1 Attack: <b>+{gA.toFixed(2)}%</b> damage · +1 crit level: <b>+{gC.toFixed(2)}%</b></p>
        <p className="mt-1">Destruction III: <b>+{g3A.toFixed(1)}%</b> · Insight III: <b>+{g3C.toFixed(1)}%</b> → <b className="text-accent">{g3A >= g3C ? "Destruction III" : "Insight III"}</b> wins here.</p>
        <p className="mt-2 text-ink-2">At crit Lv {c}, a crit level beats an attack point only while total attack is above about <b>{be}</b>.</p>
      </div>
    </div>
  );
}
