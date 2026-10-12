import Link from "next/link";
import { BUILDS } from "@/lib/cd/builds";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pt-24 pb-16 text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-2">Loadoutry</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">Builds, explained.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-ink-2 leading-snug">
          Not a list of items. The stat rules, the curves and the socket math that make a loadout work, with the game&apos;s own icons and layout.
        </p>
        <div className="mt-8 flex justify-center gap-4 text-[15px]">
          <Link href="/crimson-desert/" className="rounded-full bg-accent px-5 py-2.5 font-medium text-white">Crimson Desert builds</Link>
          <Link href="/crimson-desert/mechanics/" className="rounded-full px-5 py-2.5 font-medium text-accent">How the stats work ›</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          <Link href="/crimson-desert/" className="card group relative overflow-hidden p-8 md:col-span-2 bg-game text-white min-h-[320px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgba(200,16,46,.55),transparent_60%)]" />
            <div className="relative">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">Now live</p>
              <h2 className="mt-2 text-4xl font-semibold">Crimson Desert</h2>
              <p className="mt-2 max-w-md text-white/70">{BUILDS.length} builds for Kliff on one shared armor core, plus the decoded stat curves.</p>
              <span className="mt-5 inline-block text-[15px] font-medium text-white group-hover:underline">Open ›</span>
            </div>
          </Link>
          <div className="card p-8 flex flex-col justify-end min-h-[320px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-2">Next</p>
            <h2 className="mt-2 text-2xl font-semibold">More games</h2>
            <p className="mt-2 text-ink-2">Each game gets the same treatment: its own layout, its own icons, the same rigor.</p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {[
            ["Rules, not vibes", "Where each stat applies (weapon-local vs global), what a stowed shield gives you, which gears share a trigger."],
            ["Curves from the files", "Per-level stat tables decoded from the game data, so diminishing returns are visible instead of guessed."],
            ["Every number sourced", "Datamined item stats at max refinement, tagged by how sure we are."],
          ].map(([t, b]) => (
            <div key={t}>
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-ink-2 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
