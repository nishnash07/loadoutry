import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BUILDS, build, tally } from "@/lib/cd/builds";
import { EquipmentPanel } from "@/components/cd/EquipmentPanel";

export function generateStaticParams() {
  return BUILDS.map((b) => ({ slug: b.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = build((await params).slug);
  return { title: b ? `${b.name} · Crimson Desert` : "Build" };
}

export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const b = build((await params).slug);
  if (!b) notFound();
  const t = tally(b);
  const others = BUILDS.filter((x) => x.slug !== b.slug);
  return (
    <div className="mx-auto max-w-6xl px-5 pt-12 pb-24">
      <Link href="/crimson-desert/" className="text-[13px] text-ink-2 hover:text-ink">‹ Crimson Desert</Link>
      <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.12em] text-crimson">{b.focus} · {b.role}</p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-6xl">{b.name}</h1>
      <p className="mt-4 max-w-3xl text-xl text-ink-2 leading-snug">{b.tagline}</p>

      <div className="mt-10">
        <EquipmentPanel build={b} t={t} />
      </div>

      <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-3xl font-semibold">How it plays</h2>
          <p className="mt-4 text-lg text-ink-2 leading-relaxed">{b.summary}</p>
          <ol className="mt-6 grid gap-3">
            {b.rotation.map((s, i) => (
              <li key={i} className="card flex gap-4 p-4">
                <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-[13px] font-semibold">{i + 1}</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-3xl font-semibold">Skills</h2>
          <ul className="mt-4 grid gap-3">
            {b.skills.map((s) => (
              <li key={s.name} className="border-b border-hairline pb-3">
                <p className="font-semibold">{s.name}</p>
                <p className="text-ink-2 text-[15px]">{s.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold">Why it works</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {b.why.map((w) => (
            <div key={w.title} className="card p-6">
              <h3 className="text-lg font-semibold">{w.title}</h3>
              <p className="mt-2 text-ink-2 leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">Alternatives</h2>
          <ul className="mt-4 grid gap-3">
            {b.alternatives.map((a) => (
              <li key={a.slot} className="border-b border-hairline pb-3"><span className="font-semibold">{a.slot}.</span> <span className="text-ink-2">{a.body}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl font-semibold">Story gates</h2>
          <ul className="mt-4 grid gap-2 text-[15px]">
            {b.gates.map((g) => <li key={g} className="rounded-xl bg-paper-2 px-4 py-2.5">{g}</li>)}
          </ul>
          <p className="mt-6 text-[13px] text-ink-2 leading-relaxed"><span className="font-semibold text-ink">Confidence.</span> {b.confidence}</p>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold">Other builds on this core</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/crimson-desert/builds/${o.slug}/`} className="rounded-full bg-paper-2 px-4 py-2 text-[15px] font-medium hover:bg-hairline/40">{o.name}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
