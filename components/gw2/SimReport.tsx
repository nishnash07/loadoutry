import chrono from "@/lib/gw2/sim/results/condition-chronomancer-staff-scepter-pistol.json";
import weaver from "@/lib/gw2/sim/results/condition-weaver-pistol-warhorn.json";
import { RUNES, SIGILS, FOODS, UTILITIES } from "@/lib/gw2/sim/gear";
import type { Results } from "@/lib/gw2/sim/run";

const RESULTS: Record<string, Results> = { [chrono.slug]: chrono as unknown as Results, [weaver.slug]: weaver as unknown as Results };
const n = (x: number) => Math.round(x).toLocaleString("en-US");
const sign = (x: number) => `${x >= 0 ? "+" : ""}${x.toFixed(2)}%`;
const effectOf = (category: string, name: string) => (category === "Rune" ? RUNES : category === "Sigil" ? SIGILS : category === "Food" ? FOODS : category === "Utility" ? UTILITIES : []).find((x) => x.name === name)?.effect;
const noteOf = (category: string, name: string) => (category === "Utility" ? UTILITIES.find((u) => u.name === name)?.note : undefined);

/** Simulator validation and gear search for one build, from `npm run sim` (lib/gw2/sim/results). */
export function SimReport({ slug }: { slug: string }) {
  const r = RESULTS[slug];
  if (!r) return null;
  const conds = Object.entries(r.replay.conditions).filter(([, c]) => c.log > 0).sort((a, b) => b[1].log - a[1].log);
  const totalPct = (r.replay.total / r.log.damage - 1) * 100;
  const byCat = new Map<string, typeof r.gear.marginals>();
  for (const m of r.gear.marginals) byCat.set(m.category, [...(byCat.get(m.category) ?? []), m]);
  const best = r.gear.best;
  const changed = r.gear.steps.length > 0;
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-semibold">Simulator</h2>
      <p className="mt-3 max-w-3xl text-ink-2 leading-relaxed">
        A discrete-event simulator plays the build against the golem with the wiki&apos;s PvE skill facts. First it replays the exact cast sequence from Snow Crows&apos; log and compares its damage with what the log recorded, condition by condition. That is the test of the model. Then it replays the same casts with different gear, so the gear question is answered with the actions held fixed.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="card p-5">
          <h3 className="text-lg font-semibold">Replay of the benchmark log</h3>
          <p className="mt-1 text-[13px] text-ink-2">{r.log.seconds.toFixed(0)} seconds, {r.log.label.split(",")[0]}. Numbers are total damage over the fight.</p>
          <table className="num mt-3 w-full text-[14px]">
            <thead className="text-left text-[11px] uppercase tracking-[0.1em] text-ink-2"><tr><th className="py-1">Source</th><th className="py-1 text-right">Simulated</th><th className="py-1 text-right">Log</th><th className="py-1 text-right">Diff</th><th className="py-1 text-right">Avg stacks</th></tr></thead>
            <tbody>
              <tr className="border-t border-hairline font-semibold"><td className="py-1.5">Total</td><td className="py-1.5 text-right">{n(r.replay.total)}</td><td className="py-1.5 text-right">{n(r.log.damage)}</td><td className={`py-1.5 text-right ${Math.abs(totalPct) < 5 ? "text-green-700" : "text-crimson"}`}>{sign(totalPct)}</td><td /></tr>
              <tr className="border-t border-hairline"><td className="py-1.5">Strikes</td><td className="py-1.5 text-right">{n(r.replay.strike)}</td><td className="py-1.5 text-right">{n(r.replay.strikeLog)}</td><td className="py-1.5 text-right text-ink-2">{sign((r.replay.strike / r.replay.strikeLog - 1) * 100)}</td><td /></tr>
              {conds.map(([k, c]) => (
                <tr key={k} className="border-t border-hairline"><td className="py-1.5 capitalize">{k}</td><td className="py-1.5 text-right">{n(c.sim)}</td><td className="py-1.5 text-right">{n(c.log)}</td><td className="py-1.5 text-right text-ink-2">{sign((c.sim / c.log - 1) * 100)}</td><td className="py-1.5 text-right text-ink-2">{c.avgStacksSim.toFixed(1)} vs {c.avgStacksLog.toFixed(1)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[13px] text-ink-2">Scripted rotation (the loops on this page played by the simulator, no human timing): <b className="num">{n(r.rotation.dps)} DPS</b> over {r.rotation.seconds.toFixed(0)} s, against {n(r.log.dps)} in the log.</p>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold">Gear search</h3>
          <p className="mt-1 text-[13px] text-ink-2">{r.gear.evaluations} replays: every stat prefix on every piece, {RUNES.length} runes, {SIGILS.length} sigils in both slots, {FOODS.length} foods, {UTILITIES.length} utilities and the infusion split, by coordinate descent from the Snow Crows set.</p>
          <dl className="num mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-paper-2 p-3"><dt className="text-[11px] uppercase tracking-[0.1em] text-ink-2">Snow Crows gear</dt><dd className="text-2xl font-semibold">{n(r.gear.baselineDps)}</dd></div>
            <div className="rounded-xl bg-paper-2 p-3"><dt className="text-[11px] uppercase tracking-[0.1em] text-ink-2">Best found</dt><dd className="text-2xl font-semibold">{n(r.gear.bestDps)}</dd></div>
          </dl>
          {changed ? (
            <ul className="mt-3 grid gap-1.5 text-[14px]">
              {r.gear.steps.map((s, i) => (
                <li key={i} className="rounded-lg bg-paper-2 px-3 py-2"><span className="text-ink-2">{s.category}:</span> {s.from} → <b>{s.to}</b> <span className="num text-ink-2">({sign(s.pct)})</span>{effectOf(s.category, s.to) && <div className="text-[12px] text-ink-2">{effectOf(s.category, s.to)}</div>}{noteOf(s.category, s.to) && <div className="text-[12px] text-crimson">Caveat: {noteOf(s.category, s.to)}</div>}</li>
              ))}
            </ul>
          ) : <p className="mt-3 text-[14px]">No change beat the Snow Crows set.</p>}
          <p className="mt-3 text-[13px] text-ink-2">Prefix: {best.prefixes.Helm === best.prefixes.Amulet && best.prefixes.Helm === best.prefixes.Weapon ? `${best.prefixes.Helm} on every piece` : "mixed"} · Rune of the {best.rune} · Sigils of {best.sigils.join(" and ")} · {best.food} · {best.utility} · {best.infusions.malign} Malign / {best.infusions.spiteful} Spiteful infusions.</p>
        </div>
      </div>

      <h3 className="mt-8 text-lg font-semibold">What each single swap from the Snow Crows set would do</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...byCat.entries()].map(([cat, rows]) => (
          <div key={cat} className="rounded-2xl hairline p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-2">{cat}</div>
            <ul className="num mt-2 grid gap-1 text-[13px]">
              {rows.map((m) => (
                <li key={m.to} className="flex items-baseline justify-between gap-3" title={effectOf(cat, m.to)}>
                  <span className="truncate">{m.to}</span>
                  <span className={m.pct > 0.05 ? "font-semibold text-green-700" : m.pct < -0.05 ? "text-ink-2" : "text-ink-2"}>{sign(m.pct)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-3xl text-[13px] text-ink-2 leading-relaxed">
        Read the swap table as the price of each alternative, not as a recommendation: a negative number is how much the benchmark would lose. Duration bonuses stack additively with Condition Duration up to a 100% cap, which is why rune and sigil swaps that push a condition past the cap buy nothing. Sigil procs on critical hits use the simulator&apos;s crit chance and their listed cooldowns. Traits and the rotation are not searched yet; that needs the scripted rotation to match the log more closely than it does.
      </p>
    </section>
  );
}
