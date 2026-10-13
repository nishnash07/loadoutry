"use client";
import { useState } from "react";
import type { Gw2Build, Attunement, Skill } from "@/lib/gw2/model";
import { SKILLS, skill } from "@/lib/gw2/model";

const ATT: Attunement[] = ["Fire", "Water", "Air", "Earth"];
const ATT_COLOR: Record<Attunement, string> = { Fire: "#e2552b", Water: "#3aa1d8", Air: "#b58ff0", Earth: "#b3833a" };
const clean = (s: string) => s.replace(/<[^>]+>/g, "");

/** Weapon skills for a Weaver's main/off hand pair: 1-2 from main, 3 dual (or single if both equal), 4-5 from off. */
export function weaponSkills(main: Attunement, off: Attunement) {
  const all = Object.values(SKILLS);
  const pick = (slot: string, att: Attunement, weapon: string) => all.find((s) => s.slot === slot && s.attunement === att && !s.dual_attunement && s.facts && weaponOf(s) === weapon);
  const three = main === off
    ? all.find((s) => s.slot === "Weapon_3" && s.attunement === main && !s.dual_attunement && weaponOf(s) === "Pistol")
    : all.find((s) => s.slot === "Weapon_3" && ((s.attunement === main && s.dual_attunement === off) || (s.attunement === off && s.dual_attunement === main)));
  return [pick("Weapon_1", main, "Pistol"), pick("Weapon_2", main, "Pistol"), three, warhorn("Weapon_4", off), warhorn("Weapon_5", off)];
}
const WARHORN: Record<Attunement, [number, number]> = { Fire: [29548, 29533], Water: [30864, 30446], Air: [30008, 30795], Earth: [29453, 30336] };
const warhorn = (slot: string, att: Attunement) => skill(WARHORN[att][slot === "Weapon_4" ? 0 : 1]);
const weaponOf = (s: { id: number; slot?: string }) => ([29548, 30864, 30008, 29453, 29533, 30446, 30795, 30336].includes(s.id) ? "Warhorn" : "Pistol");

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function Chrome({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#4a3d26] bg-[#15120d] text-white shadow-[0_10px_40px_rgba(0,0,0,.5)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#4a3d26] bg-[linear-gradient(180deg,#2a2217,#1a150e)] px-5 py-3">
        <span className="font-semibold tracking-wide text-[#f2d9a8]">{title}</span>
        <span className="text-[12px] text-white/60">{hint}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Icons({ list, keys, sel, onSel, gap }: { list: (Skill | undefined)[]; keys: string[]; sel: number | null; onSel: (id: number) => void; gap?: number }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {list.map((s, i) => (
        <button key={i} type="button" onClick={() => s && onSel(s.id)} className={`relative aspect-square rounded-md border bg-black ${sel === s?.id ? "border-[#f2d9a8]" : "border-[#6b5a3a]"} ${gap !== undefined && i === gap ? "sm:ml-3" : ""}`} title={s?.name}>
          {s && <img src={s.icon} alt={s.name} className="h-full w-full rounded-md" />}
          <span className="num absolute left-1 top-0.5 text-[10px] text-white/70 drop-shadow">{keys[i]}</span>
        </button>
      ))}
    </div>
  );
}

function Detail({ selected }: { selected?: Skill }) {
  return (
    <div className="mt-3 min-h-[76px] rounded-xl bg-black/40 p-3 text-[13px] leading-relaxed">
      {selected ? (
        <div className="flex gap-3">
          <img src={selected.icon} alt="" className="h-12 w-12 shrink-0 rounded-md" />
          <div>
            <div className="font-semibold text-[#f2d9a8]">{selected.name}<span className="ml-2 text-[11px] text-white/50">{selected.attunement}{selected.dual_attunement ? ` + ${selected.dual_attunement}` : ""}{selected.type ? ` · ${selected.type}` : ""}</span></div>
            <p className="text-white/75">{clean(selected.description)}</p>
            <p className="num mt-1 text-white/50">{(selected.facts ?? []).filter((f) => ["Recharge", "Damage", "Buff", "Number"].includes(f.type)).map((f) => f.type === "Damage" ? `${f.text ?? "Damage"} ×${f.dmg_multiplier}${f.hit_count && f.hit_count > 1 ? ` (${f.hit_count} hits)` : ""}` : f.type === "Buff" ? `${f.status ?? "Buff"}${f.apply_count && f.apply_count > 1 ? ` ×${f.apply_count}` : ""}${f.duration ? ` ${f.duration}s` : ""}` : `${f.text}: ${f.value}`).join(" · ")}</p>
          </div>
        </div>
      ) : <span className="text-white/50">Select a skill to read what it does.</span>}
    </div>
  );
}

export function SkillBar({ build }: { build: Gw2Build }) {
  const [main, setMain] = useState<Attunement>("Fire");
  const [off, setOff] = useState<Attunement>("Earth");
  const [set, setSet] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const selected = sel ? skill(sel) : undefined;
  const slots = [skill(build.skills.heal), ...build.skills.utilities.map(skill), skill(build.skills.elite)];

  if (build.bar) {
    const ws = build.bar.sets[set].skills.map((id) => (id ? skill(id) : undefined));
    return (
      <Chrome title="Skill bar" hint={build.bar.swapNote}>
        <div className="mb-3 flex items-center gap-2">
          {build.bar.sets.map((s, i) => (
            <button key={s.label} type="button" onClick={() => setSet(i)} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 transition ${set === i ? "bg-[#b89a62]/30 ring-[#f2d9a8] text-white" : "ring-white/15 text-white/50 hover:text-white"}`}>
              <span className="num mr-2 text-white/60">{i === 0 ? "I" : "II"}</span>{s.label}
            </button>
          ))}
          <span className="ml-auto text-[12px] text-white/50">Weapon swap: `</span>
        </div>
        <Icons list={[...ws, ...slots]} keys={KEYS} sel={sel} onSel={setSel} gap={5} />
        <div className="mt-3 flex items-center gap-2">
          <span className="w-20 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b89a62]">{build.bar.mechanicLabel}</span>
          <div className="grid flex-1 grid-cols-5 gap-2 sm:max-w-[50%]">
            {build.bar.mechanic.map((id, i) => { const s = skill(id); return (
              <button key={id} type="button" onClick={() => setSel(id)} className={`relative aspect-square rounded-md border bg-black ${sel === id ? "border-[#f2d9a8]" : "border-[#6b5a3a]"}`} title={s.name}>
                <img src={s.icon} alt={s.name} className="h-full w-full rounded-md" />
                <span className="num absolute left-1 top-0.5 text-[10px] text-white/70 drop-shadow">F{i + 1}</span>
              </button>
            ); })}
          </div>
        </div>
        <Detail selected={selected} />
        {build.skills.swapNote && <p className="mt-3 text-[12px] leading-relaxed text-white/50">{build.skills.swapNote}</p>}
      </Chrome>
    );
  }

  const ws = weaponSkills(main, off);
  const attune = (a: Attunement) => { if (a === main) { setOff(a); } else { setOff(main); setMain(a); } };
  return (
    <Chrome title="Skill bar" hint="Tap an attunement to swap like in game: the new element becomes your main hand, the old one moves to the off hand. Tap it again to attune fully.">
      <div className="mb-3 flex items-center gap-2">
        {ATT.map((a, i) => (
          <button key={a} type="button" onClick={() => attune(a)} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 transition ${main === a ? "ring-white text-white" : off === a ? "ring-white/50 text-white/90" : "ring-white/15 text-white/50 hover:text-white"}`} style={{ background: main === a || off === a ? ATT_COLOR[a] + "55" : "transparent" }}>
            <span className="num text-white/60">F{i + 1}</span>{a}{main === a && <span className="text-[10px] uppercase tracking-wider text-white/70">main</span>}{off === a && main !== a && <span className="text-[10px] uppercase tracking-wider text-white/70">off</span>}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-white/50">{main === off ? `Fully attuned to ${main}` : `${main} + ${off}`}</span>
      </div>
      <Icons list={[...ws, ...slots]} keys={KEYS} sel={sel} onSel={setSel} gap={5} />
      <Detail selected={selected} />
      {build.skills.swapNote && <p className="mt-3 text-[12px] leading-relaxed text-white/50">{build.skills.swapNote}</p>}
    </Chrome>
  );
}
