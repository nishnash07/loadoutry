import type { Gw2Build } from "@/lib/gw2/model";
import { spec, trait } from "@/lib/gw2/model";

/* Mirrors the in-game Training panel: one row per specialization with its art, minor traits as small circles, majors as three columns of three. */
export function TraitPanel({ build }: { build: Gw2Build }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#4a3d26] bg-[#15120d] text-white shadow-[0_10px_40px_rgba(0,0,0,.5)]">
      <div className="border-b border-[#4a3d26] bg-[linear-gradient(180deg,#2a2217,#1a150e)] px-5 py-3 font-semibold tracking-wide text-[#f2d9a8]">Training</div>
      <div className="grid gap-3 p-4">
        {build.traits.map((line) => {
          const s = spec(line.specId);
          return (
            <div key={s.id} className="relative overflow-hidden rounded-xl border border-[#3b3122]">
              <img src={s.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.85)_0%,rgba(0,0,0,.55)_45%,rgba(0,0,0,.75)_100%)]" />
              <div className="relative grid items-center gap-4 p-4 sm:grid-cols-[150px_1fr]">
                <div className="flex items-center gap-3">
                  <img src={s.icon} alt="" className="h-12 w-12 rounded-full ring-2 ring-[#b89a62]" />
                  <div className="font-semibold text-[#f2d9a8]">{s.name}{s.elite && <div className="text-[11px] font-normal text-white/60">Elite specialization</div>}</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((tier) => (
                    <div key={tier} className="flex items-center gap-2">
                      <Minor id={s.minor_traits[tier]} />
                      <div className="grid flex-1 gap-1">
                        {[0, 1, 2].map((slot) => {
                          const id = s.major_traits[tier * 3 + slot];
                          const chosen = line.choices[tier] === slot + 1;
                          const t = trait(id);
                          return (
                            <div key={id} title={`${t.name}: ${t.description.replace(/<[^>]+>/g, "")}`} className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-[12px] leading-tight ${chosen ? "bg-[#b89a62]/25 ring-1 ring-[#f2d9a8]" : "opacity-45"}`}>
                              <img src={t.icon} alt="" className={`h-7 w-7 shrink-0 ${chosen ? "" : "grayscale"}`} style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }} />
                              <span className={chosen ? "font-semibold text-[#f2d9a8]" : "text-white/70"}>{t.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Minor({ id }: { id: number }) {
  const t = trait(id);
  return <img src={t.icon} alt={t.name} title={`${t.name}: ${t.description.replace(/<[^>]+>/g, "")}`} className="h-8 w-8 shrink-0 rounded-full ring-1 ring-white/40" />;
}
