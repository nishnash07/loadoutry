"use client";
import { useState } from "react";
import type { Gw2Build } from "@/lib/gw2/model";
import { skill } from "@/lib/gw2/model";

const ELEMENT: Record<string, string> = { Fire: "#e2552b", Water: "#3aa1d8", Air: "#b58ff0", Earth: "#b3833a" };
const UNRAVEL_ICON = "https://render.guildwars2.com/file/9A03F9CFBBE6154A41B1B5CAC4060092C11FABDA/1770332.png";

function AttuneBadge({ text }: { text: string }) {
  const els = ["Fire", "Water", "Air", "Earth"].filter((e) => text.includes(e));
  return (
    <div className="flex min-w-[150px] flex-col gap-1">
      <div className="flex gap-1">{els.map((e) => <span key={e} className="h-2.5 w-6 rounded-sm" style={{ background: ELEMENT[e] }} />)}</div>
      <span className="text-[11px] leading-tight text-ink-2">{text}</span>
    </div>
  );
}

export function Rotation({ build }: { build: Gw2Build }) {
  const [detail, setDetail] = useState(true);
  return (
    <div>
      <div className="mb-4 flex items-center gap-3 text-[14px]">
        <button type="button" onClick={() => setDetail(true)} className={`rounded-full px-4 py-1.5 font-medium ${detail ? "bg-accent text-white" : "bg-paper-2"}`}>Explained</button>
        <button type="button" onClick={() => setDetail(false)} className={`rounded-full px-4 py-1.5 font-medium ${!detail ? "bg-accent text-white" : "bg-paper-2"}`}>Compact</button>
      </div>
      <div className="grid gap-8">
        {build.rotation.map((phase) => (
          <section key={phase.title}>
            <h3 className="text-2xl font-semibold">{phase.title}</h3>
            <p className="mt-2 max-w-3xl text-ink-2 leading-relaxed">{phase.intro}</p>
            {detail ? (
              <ol className="mt-4 grid gap-2">
                {phase.steps.map((st, i) => {
                  const s = typeof st.skill === "number" ? skill(st.skill) : undefined;
                  const name = s?.name ?? (st.skill === "auto" ? "Auto attacks" : st.skill === "unravel" ? "Unravel" : "Weave Self");
                  const icon = s?.icon ?? (st.skill === "weaveself" ? skill(43638).icon : st.skill === "unravel" ? UNRAVEL_ICON : "");
                  return (
                    <li key={i} className={`card grid items-start gap-4 p-3 sm:grid-cols-[28px_56px_150px_1fr] ${st.optional ? "opacity-70" : ""}`}>
                      <span className="num pt-3 text-[13px] font-semibold text-ink-2">{i + 1}</span>
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-game ring-1 ring-black/30">
                        {icon ? <img src={icon} alt="" className="h-full w-full" /> : <span className="grid h-full w-full place-items-center text-[11px] text-white/70">1 · 1 · 1</span>}
                        <span className="num absolute bottom-0.5 right-1 rounded bg-black/70 px-1 text-[11px] font-semibold text-white">{st.key}</span>
                      </div>
                      <AttuneBadge text={st.attune} />
                      <div className="min-w-0 text-[15px]"><b>{name}</b>{st.optional && <span className="ml-2 text-[11px] uppercase tracking-wider text-ink-2">optional</span>}<p className="text-ink-2 leading-relaxed">{st.why}</p></div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {phase.steps.map((st, i) => {
                  const s = typeof st.skill === "number" ? skill(st.skill) : undefined;
                  const icon = s?.icon ?? (st.skill === "weaveself" ? skill(43638).icon : st.skill === "unravel" ? UNRAVEL_ICON : "");
                  const els = ["Fire", "Water", "Air", "Earth"].filter((e) => st.attune.includes(e));
                  return (
                    <div key={i} className="relative h-12 w-12 overflow-hidden rounded-md bg-game ring-1 ring-black/30" title={`${st.attune}: ${s?.name ?? st.skill}`}>
                      {icon ? <img src={icon} alt="" className="h-full w-full" /> : <span className="grid h-full w-full place-items-center text-[10px] text-white/70">AA</span>}
                      <div className="absolute left-0 top-0 flex gap-px">{els.map((e) => <span key={e} className="h-1.5 w-3" style={{ background: ELEMENT[e] }} />)}</div>
                      <span className="num absolute bottom-0 right-0.5 text-[10px] font-semibold text-white drop-shadow">{st.key}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
