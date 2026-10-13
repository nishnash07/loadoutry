import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GW2_BUILDS, gw2Build } from "@/lib/gw2/builds";
import { computeBuild, spec, trait, item } from "@/lib/gw2/model";
import { HeroPanel } from "@/components/gw2/HeroPanel";
import { TraitPanel } from "@/components/gw2/TraitPanel";
import { SkillBar } from "@/components/gw2/SkillBar";
import { Rotation } from "@/components/gw2/Rotation";
import { DamageTable } from "@/components/gw2/DamageTable";

export function generateStaticParams() { return GW2_BUILDS.map((b) => ({ slug: b.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = gw2Build((await params).slug); return { title: b ? `${b.name} · Guild Wars 2` : "Build" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const b = gw2Build((await params).slug);
  if (!b) notFound();
  const c = computeBuild(b);
  const s = spec(b.specId);
  return (
    <div className="mx-auto max-w-6xl px-5 pt-12 pb-24">
      <Link href="/guild-wars-2/" className="text-[13px] text-ink-2 hover:text-ink">‹ Guild Wars 2</Link>
      <div className="mt-6 flex items-center gap-4">
        <img src={s.icon} alt="" className="h-16 w-16 rounded-full bg-game p-1" />
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#b8862b]">{b.profession} · {s.name} · {b.mode} · {b.role}</p>
          <h1 className="mt-1 text-4xl font-semibold sm:text-6xl">{b.name}</h1>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-xl text-ink-2 leading-snug">{b.tagline}</p>

      <dl className="num mt-8 grid gap-3 sm:grid-cols-4">
        {[["Benchmark (max)", b.benchmark.max.toLocaleString()], ["Benchmark (average)", b.benchmark.avg.toLocaleString()], ["Difficulty", b.difficulty.tier], ["Balance", b.benchmark.balance]].map(([k, v]) => (
          <div key={k} className="card p-4"><dt className="text-[12px] uppercase tracking-[0.1em] text-ink-2">{k}</dt><dd className="mt-1 text-2xl font-semibold">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-2 text-[12px] text-ink-2">Benchmark from the Snow Crows golem log of {b.benchmark.date}, with 25 might, fury, quickness and alacrity. Difficulty is scored below.</p>

      <section className="mt-12 grid gap-6">
        <HeroPanel build={b} c={c} />
        <TraitPanel build={b} />
        <SkillBar build={b} />
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold">Rotation</h2>
        <p className="mt-3 max-w-3xl text-lg text-ink-2 leading-relaxed">{b.summary}</p>
        <div className="mt-8"><Rotation build={b} /></div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold">Key concepts</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {b.concepts.map((k) => <div key={k.title} className="card p-6"><h3 className="text-lg font-semibold">{k.title}</h3><p className="mt-2 text-ink-2 leading-relaxed">{k.body}</p></div>)}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold">What each skill is worth</h2>
        <p className="mt-3 max-w-3xl text-ink-2 leading-relaxed">Expected damage of one cast against the heavy raid golem (armor 2597) with 25 might and fury: strike = weapon strength × power × coefficient ÷ armor, crits at {c.critDamage.toFixed(0)}% with {c.boonCritChance.toFixed(1)}% chance; conditions = stacks × duration × tick, with {c.conditionDuration.toFixed(0)}% duration (plus 20% on burning and bleeding from traits). Permanent modifiers are included; Weave Self, Elements of Rage and the relic are not, so these are floor values.</p>
        <div className="mt-6"><DamageTable c={c} /></div>
      </section>

      <section className="mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">Where the stats come from</h2>
          <ul className="mt-4 grid gap-2 text-[15px]">
            {b.modifiers.map((m) => (
              <li key={m.source} className="rounded-xl bg-paper-2 px-4 py-2.5"><b>{m.source}</b>{m.attr && <span className="num text-ink-2"> · {Object.entries(m.attr).map(([k, v]) => `+${v} ${k.replace(/([A-Z])/g, " $1").replace(/^./, (x) => x.toUpperCase())}`).join(", ")}</span>}
                {m.conditionDurationPct ? <span className="text-ink-2"> · +{m.conditionDurationPct}% condition duration</span> : null}{m.conditionDamagePct ? <span className="text-ink-2"> · +{m.conditionDamagePct}% condition damage</span> : null}{m.strikeDamagePct ? <span className="text-ink-2"> · +{m.strikeDamagePct}% strike damage</span> : null}{m.critChancePct ? <span className="text-ink-2"> · +{m.critChancePct}% crit chance</span> : null}
                {(m.note || m.conditional) && <div className="text-[13px] text-ink-2">{m.conditional ?? m.note}</div>}</li>
            ))}
            <li className="rounded-xl bg-paper-2 px-4 py-2.5"><b>{b.relic.name}</b><div className="text-[13px] text-ink-2">{b.relic.effect}</div></li>
            <li className="rounded-xl bg-paper-2 px-4 py-2.5"><b>{item(b.food.id)?.name}</b><div className="text-[13px] text-ink-2">{b.food.effect}</div></li>
            <li className="rounded-xl bg-paper-2 px-4 py-2.5"><b>{item(b.utility.id)?.name}</b><div className="text-[13px] text-ink-2">{b.utility.effect}</div></li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl font-semibold">Difficulty: {b.difficulty.tier}</h2>
          <ul className="mt-4 grid gap-3">
            {b.difficulty.signals.map((sg) => <li key={sg.label} className="border-b border-hairline pb-3"><div className="flex justify-between"><span className="font-semibold">{sg.label}</span><span className="num text-ink-2">{sg.value}</span></div><p className="text-[15px] text-ink-2">{sg.note}</p></li>)}
          </ul>
          <h3 className="mt-8 text-lg font-semibold">Chosen traits</h3>
          <ul className="mt-2 grid gap-1 text-[14px]">
            {b.traits.map((l) => { const sp = spec(l.specId); return <li key={sp.id}><b>{sp.name}:</b> {l.choices.map((ch, tier) => trait(sp.major_traits[tier * 3 + ch - 1]).name).join(" · ")}</li>; })}
          </ul>
          <h3 className="mt-8 text-lg font-semibold">Sources</h3>
          <ul className="mt-2 grid gap-1 text-[14px]">{b.sources.map((sr) => <li key={sr.url}><a href={sr.url} className="text-accent hover:underline" target="_blank" rel="noreferrer">{sr.label}</a></li>)}</ul>
          <p className="mt-6 text-[12px] text-ink-2">Icons and game data © ArenaNet, served from the official Guild Wars 2 API and render service.</p>
        </div>
      </section>
    </div>
  );
}
