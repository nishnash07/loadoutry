import type { Computed } from "@/lib/gw2/model";

/** Expected damage per cast against the raid golem with 25 might and fury, from the game's formulas and the API coefficients. */
export function DamageTable({ c }: { c: Computed }) {
  const rows = [...c.rows].sort((a, b) => b.total - a.total);
  const max = rows[0]?.total ?? 1;
  return (
    <div className="overflow-x-auto rounded-2xl hairline">
      <table className="w-full text-[14px]">
        <thead className="bg-paper-2 text-left text-[11px] uppercase tracking-[0.1em] text-ink-2">
          <tr><th className="p-3">Skill</th><th className="p-3">Strike</th><th className="p-3">Conditions</th><th className="p-3">Per cast</th><th className="p-3">Cast</th><th className="p-3 min-w-[14rem]">Why</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-hairline align-top">
              <td className="p-3 whitespace-nowrap">{r.icon && <img src={r.icon} alt="" className="mr-2 inline-block h-8 w-8 rounded align-middle" />}<b>{r.name}</b><div className="text-[12px] text-ink-2">{r.skill.attune}</div></td>
              <td className="num p-3">{Math.round(r.strikeDmg).toLocaleString()}</td>
              <td className="num p-3">{Math.round(r.condDmg).toLocaleString()}</td>
              <td className="num p-3"><b>{Math.round(r.total).toLocaleString()}</b><div className="mt-1 h-1.5 w-28 rounded bg-paper-2"><div className="h-full rounded bg-crimson" style={{ width: `${(r.total / max) * 100}%` }} /></div></td>
              <td className="num p-3">{r.skill.castTime}s{r.skill.recharge ? ` · ${r.skill.recharge}s` : ""}</td>
              <td className="p-3 text-ink-2">{r.skill.note ?? r.skill.conditions.map((x) => x.note).filter(Boolean).join("; ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
