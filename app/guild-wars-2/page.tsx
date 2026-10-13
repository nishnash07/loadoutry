import Link from "next/link";
import type { Metadata } from "next";
import { GW2_BUILDS } from "@/lib/gw2/builds";
import { computeBuild, spec } from "@/lib/gw2/model";

export const metadata: Metadata = { title: "Guild Wars 2" };

const PROFESSIONS = ["Elementalist", "Mesmer", "Necromancer", "Engineer", "Ranger", "Thief", "Guardian", "Revenant", "Warrior"];

export default function Gw2() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 pb-24">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#b8862b]">Guild Wars 2 · July 2026 balance</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Builds with the maths shown.</h1>
      <p className="mt-5 max-w-2xl text-xl text-ink-2 leading-snug">Every number on these pages comes from the official API&apos;s skill coefficients and the game&apos;s published damage formulas, then checked against the Snow Crows golem benchmarks. Rotations are explained press by press.</p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GW2_BUILDS.map((b) => {
          const c = computeBuild(b); const s = spec(b.specId);
          return (
            <Link key={b.slug} href={`/guild-wars-2/builds/${b.slug}/`} className="card group p-6 hairline hover:shadow-[0_8px_30px_rgba(0,0,0,.08)] transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-2">{b.profession} · {b.mode}</p><h2 className="mt-1 text-2xl font-semibold">{b.name}</h2></div>
                <img src={s.icon} alt="" className="h-14 w-14 rounded-full bg-game p-1" />
              </div>
              <p className="mt-3 text-ink-2 leading-relaxed">{b.tagline}</p>
              <dl className="num mt-5 grid grid-cols-3 gap-2 text-center text-[13px]">
                <div className="rounded-xl bg-paper p-2"><dt className="text-ink-2">Benchmark</dt><dd className="font-semibold">{b.benchmark.max.toLocaleString()}</dd></div>
                <div className="rounded-xl bg-paper p-2"><dt className="text-ink-2">Cond. dmg</dt><dd className="font-semibold">{c.attrs.conditionDamage}</dd></div>
                <div className="rounded-xl bg-paper p-2"><dt className="text-ink-2">Difficulty</dt><dd className="font-semibold">{b.difficulty.tier}</dd></div>
              </dl>
              <span className="mt-4 inline-block text-[15px] font-medium text-accent">Open build ›</span>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-16 text-2xl font-semibold">Professions</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {PROFESSIONS.map((p) => (
          <span key={p} className={`rounded-full px-4 py-2 text-[14px] ${GW2_BUILDS.some((b) => b.profession === p) ? "bg-paper-2 font-medium" : "bg-paper-2/60 text-ink-2"}`}>{p}{GW2_BUILDS.some((b) => b.profession === p) ? "" : " · soon"}</span>
        ))}
      </div>
    </div>
  );
}
