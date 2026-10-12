import Link from "next/link";
import type { Metadata } from "next";
import { BUILDS, tally } from "@/lib/cd/builds";
import { ITEMS } from "@/lib/cd/items";
import { cdIcon } from "@/lib/asset";

export const metadata: Metadata = { title: "Crimson Desert" };

export default function CrimsonDesert() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 pb-24">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-crimson">Crimson Desert · Kliff · Patch 2.0x</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">One core. Five ways to swing it.</h1>
      <p className="mt-5 max-w-2xl text-xl text-ink-2 leading-snug">
        Every build shares the same helm, chest, gloves, boots, shield and accessories, so you farm the core once and swap the weapon. The equipment grid mirrors the in-game inventory; tap any slot for its numbers and where to get it.
      </p>
      <div className="mt-6 flex gap-4 text-[15px]">
        <Link href="/crimson-desert/mechanics/" className="text-accent font-medium">Read the mechanics first ›</Link>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BUILDS.map((b) => {
          const t = tally(b);
          const w = ITEMS[b.equipment.mainWeapon!.item];
          return (
            <Link key={b.slug} href={`/crimson-desert/builds/${b.slug}/`} className="card group p-6 hairline hover:shadow-[0_8px_30px_rgba(0,0,0,.08)] transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-2">{b.focus}</p>
                  <h2 className="mt-1 text-2xl font-semibold">{b.name}</h2>
                </div>
                <img src={cdIcon(w.slug)} alt="" width={56} height={56} className="rounded-xl bg-game p-1" />
              </div>
              <p className="mt-3 text-ink-2 leading-relaxed">{b.tagline}</p>
              <dl className="mt-5 grid grid-cols-3 gap-2 text-center text-[13px]">
                {[["Attack", t.attack], ["Crit", `Lv ${t.crit}`], ["Atk Spd", `Lv ${t.as}`]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-paper p-2"><dt className="text-ink-2">{k}</dt><dd className="num font-semibold">{v}</dd></div>
                ))}
              </dl>
              <span className="mt-4 inline-block text-[15px] font-medium text-accent">Open build ›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
