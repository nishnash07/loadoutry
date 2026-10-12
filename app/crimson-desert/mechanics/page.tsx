import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "@/components/cd/Calculator";
import { CurveChart } from "@/components/cd/CurveChart";
import { GEARS } from "@/lib/cd/gears";
import { cdIcon } from "@/lib/asset";

export const metadata: Metadata = { title: "Mechanics · Crimson Desert" };

const Tag = ({ k }: { k: "data" | "tested" | "inferred" }) => (
  <span className={`ml-2 align-middle rounded-full px-2 py-0.5 text-[11px] font-semibold ${k === "data" ? "bg-jade/15 text-jade" : k === "tested" ? "bg-brass/20 text-brass" : "bg-crimson/15 text-crimson"}`}>{k}</span>
);

const RULES: { k: string; t: string; tag: "data" | "tested" | "inferred" }[] = [
  { k: "Sockets", t: "Maximum a Witch can open: two-hander 5, bow 5, one-hander 3, shield 2, chest 3, gloves 2, boots 2, helm 1. Cloaks and accessories take none. The Kuku resistance chests are fixed at 0. Embedding and extracting are free; opening all five sockets on one item costs about 105 silver.", tag: "tested" },
  { k: "Local stats", t: "Attack and Crit on a weapon count only for that weapon. On gloves and boots they count only for punches and kicks, so Insight or Destruction in gloves is wasted for a sword build.", tag: "tested" },
  { k: "Global stats", t: "Necklace, rings and the Kuku Flame-Resistant chest give Crit and Attack to every weapon. Attack Speed from any armor piece or ring is global; on a weapon or shield it works only while that item is in hand. Defense and Movement Speed are global from everything, including a shield on your back.", tag: "tested" },
  { k: "Caps", t: "Crit, Attack Speed and Movement Speed hard-cap at Lv15. The game's status table holds a 16-step curve per stat: Crit and Attack Speed share one diminishing curve, Movement Speed is linear to Lv6 then bends. Levels 1 to 5 deliver 47% of the cap's value, levels 11 to 15 only 22%.", tag: "data" },
  { k: "Triggers", t: "Gears bound to the same input fire together. Groundsurge, Greysoul Howling and Wound of Darkness ride Turning Slash (R1+R2). Shadow Claw, Crow's Pursuit, Crow Storm and Ator's Orb ride Heavy Attack (R2). Volcanic Eruption and Flames of Judgment fire on any Flame-imbued attack, including an imbued Turning Slash or Charged Shot.", tag: "data" },
  { k: "Spirit", t: "Turning Slash costs 10 Spirit, 20 when imbued, and each skill gear on the input adds its own cost. Heavy Attack gears draw Stamina instead. Two Turning Slash gears are sustainable in practice; three drain the bar.", tag: "tested" },
  { k: "Refinement", t: "+0 to +10 roughly triples weapon attack (12 → 35) and raises the innate Crit or Attack Speed line by one level at +10. Steps +5 to +10 cost one Abyss Artifact each; +10 also needs an Aeserion's Scale.", tag: "data" },
  { k: "Crit multiplier", t: "A crit is a flat 2× hit. The status table has no curve for Critical Damage, consistent with a constant multiplier.", tag: "tested" },
];

export default function Mechanics() {
  const skills = Object.values(GEARS).filter((g) => g.kind === "skill");
  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 pb-24">
      <Link href="/crimson-desert/" className="text-[13px] text-ink-2 hover:text-ink">‹ Crimson Desert</Link>
      <h1 className="mt-6 text-4xl font-semibold sm:text-6xl">How the stats actually work.</h1>
      <p className="mt-5 max-w-2xl text-xl text-ink-2 leading-snug">The rules every build on this site is derived from. <Tag k="data" /> comes from the game files or datamined tables, <Tag k="tested" /> from community measurement, <Tag k="inferred" /> from reasoning you should verify in game.</p>

      <section className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          {RULES.map((r) => (
            <div key={r.k} className="border-b border-hairline pb-5">
              <h3 className="font-semibold">{r.k}<Tag k={r.tag} /></h3>
              <p className="mt-1 text-ink-2 leading-relaxed">{r.t}</p>
            </div>
          ))}
        </div>
        <div className="card p-6 self-start">
          <h3 className="font-semibold">Stat curves from the status table</h3>
          <div className="mt-4"><CurveChart /></div>
          <p className="mt-2 text-[13px] text-ink-2 leading-relaxed">
            <span className="inline-block h-[3px] w-4 bg-crimson align-middle mr-1" /> Critical Rate and Attack Speed share one curve.
            <span className="inline-block h-[3px] w-4 bg-brass align-middle mx-1" /> Movement Speed.
            Left axis is the raw table unit (0 to 64); the right axis estimates crit chance as base 5% + 0.53% per unit, which lands on the community measurements of 13-16% at Lv5, 24-25% at Lv10 and 33-35% at Lv15. The shape is game data; the percent scale is a fit.
          </p>
        </div>
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">Attack or crit?</h2>
          <p className="mt-4 text-ink-2 leading-relaxed">A crit is 2×, so expected damage is Attack × (1 + crit chance). One more Attack point is worth 1/Attack. One more crit level is worth its slice of the curve divided by (1 + crit chance). At base crit the first steps are big, so a crit level beats an attack point once total attack passes about 50; that is the &ldquo;53 attack&rdquo; rule. Past Lv10 the curve flattens and the attack point wins again.</p>
          <p className="mt-3 text-ink-2 leading-relaxed">Practical rule: take crit from sources that cost no weapon socket (the weapon&apos;s own line, the Kuku chest, a Lv4 necklace), then fill weapon sockets with Destruction III. If enemy defense turns out to be a flat subtraction, attack is worth even more and the conclusion holds.</p>
        </div>
        <Calculator />
      </section>

      <section className="mt-20">
        <h2 className="text-3xl font-semibold">Skill gears and their triggers</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl hairline">
          <table className="w-full text-[14px]">
            <thead className="bg-paper-2 text-left text-[11px] uppercase tracking-[0.1em] text-ink-2"><tr><th className="p-3">Gear</th><th className="p-3">Fires on</th><th className="p-3">Pool</th><th className="p-3">Effect</th><th className="p-3">Source</th></tr></thead>
            <tbody>
              {skills.map((g) => (
                <tr key={g.slug} className="border-t border-hairline align-top">
                  <td className="p-3 whitespace-nowrap"><img src={cdIcon(g.slug)} alt="" className="mr-2 inline-block h-7 w-7 rounded-full bg-game align-middle" /><b>{g.name}</b></td>
                  <td className="p-3">{g.trigger}</td><td className="p-3">{g.pool}</td><td className="p-3 text-ink-2 min-w-[16rem]">{g.effect}</td><td className="p-3 text-ink-2 min-w-[16rem]">{g.get}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
