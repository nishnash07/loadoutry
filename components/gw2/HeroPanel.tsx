import type { Gw2Build, Computed } from "@/lib/gw2/model";
import { item } from "@/lib/gw2/model";

/* Mirrors the in-game Hero panel: equipment column, attribute list, weapon row; dark bronze chrome. */
const resolveIcon = (icon: string) => (icon.startsWith("item:") ? item(Number(icon.slice(5)))?.icon ?? "" : icon);

function Slot({ icon, label, sub, small }: { icon: string; label: string; sub?: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-3" title={label}>
      <div className={`${small ? "h-10 w-10" : "h-14 w-14"} shrink-0 overflow-hidden rounded-md border border-[#6b5a3a] bg-[#1b1710] shadow-[inset_0_0_8px_rgba(0,0,0,.8)]`}>
        {icon && <img src={icon} alt="" className="h-full w-full object-cover" />}
      </div>
      {!small && <div className="min-w-0 text-[13px] leading-tight"><div className="truncate font-semibold text-[#f2d9a8]">{label}</div>{sub && <div className="truncate text-white/55">{sub}</div>}</div>}
    </div>
  );
}

export function HeroPanel({ build, c }: { build: Gw2Build; c: Computed }) {
  const left = build.gear.filter((g) => ["Helm", "Shoulders", "Coat", "Gloves", "Leggings", "Boots"].includes(g.slot));
  const right = build.gear.filter((g) => ["Back", "Accessory1", "Accessory2", "Amulet", "Ring1", "Ring2"].includes(g.slot));
  const weapons = build.gear.filter((g) => g.slot === "MainHand" || g.slot === "OffHand");
  const A = c.attrs;
  const rows: [string, string][] = [
    ["Power", String(A.power)], ["Toughness", String(A.toughness)], ["Vitality", String(A.vitality)], ["Precision", String(A.precision)],
    ["Critical Chance", `${c.critChance.toFixed(2)}%`], ["Ferocity", String(A.ferocity)], ["Critical Damage", `${c.critDamage.toFixed(0)}%`],
    ["Condition Damage", String(A.conditionDamage)], ["Healing Power", String(A.healingPower)], ["Expertise", String(A.expertise)],
    ["Condition Duration", `${c.conditionDuration.toFixed(2)}%`], ["Concentration", String(A.concentration)], ["Boon Duration", "0%"],
  ];
  return (
    <div className="overflow-hidden rounded-3xl border border-[#4a3d26] bg-[#15120d] text-white shadow-[0_10px_40px_rgba(0,0,0,.5)]">
      <div className="border-b border-[#4a3d26] bg-[linear-gradient(180deg,#2a2217,#1a150e)] px-5 py-3 font-semibold tracking-wide text-[#f2d9a8]">Equipment</div>
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto_1fr]">
        <div className="grid gap-3">
          {left.map((g) => <Slot key={g.slot} icon={resolveIcon(g.icon)} label={g.label} sub={g.upgrade?.name} />)}
        </div>
        <div className="min-w-[240px] rounded-xl border border-[#3b3122] bg-black/30 p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b89a62]">Attributes · gear, traits and signet</div>
          {rows.map(([k, v]) => (
            <div key={k} className="num flex justify-between border-b border-white/5 py-[3px] text-[13px]"><span className="text-white/80">{k}</span><span className="font-semibold text-[#f2d9a8]">{v}</span></div>
          ))}
          <div className="mt-3 text-[11px] leading-relaxed text-white/45">Fire main hand. In a raid add 25 might (+750 Power, +750 Condition Damage) and fury (+25% crit, {c.boonCritChance.toFixed(1)}% total).</div>
        </div>
        <div className="grid gap-3">
          {right.map((g) => <Slot key={g.slot} icon={resolveIcon(g.icon)} label={g.label} sub={g.prefix.name} />)}
        </div>
      </div>
      <div className="grid gap-4 border-t border-[#4a3d26] bg-black/20 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {weapons.map((g) => <Slot key={g.slot} icon={resolveIcon(g.icon)} label={g.label} sub={g.upgrade?.name} />)}
        <Slot icon={resolveIcon(build.relic.icon)} label={build.relic.name} sub="Relic" />
        <div className="flex items-center gap-3">
          <Slot icon={item(build.food.id)?.icon ?? ""} label="" small />
          <Slot icon={item(build.utility.id)?.icon ?? ""} label="" small />
          <div className="text-[12px] leading-tight text-white/70"><div className="font-semibold text-[#f2d9a8]">{item(build.food.id)?.name}</div><div>{item(build.utility.id)?.name}</div></div>
        </div>
      </div>
    </div>
  );
}
