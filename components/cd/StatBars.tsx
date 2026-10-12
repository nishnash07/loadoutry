import type { Tally } from "@/lib/cd/builds";
import { CAP, capShare, CURVE_MOVE } from "@/lib/cd/stats";

function Segments({ lv }: { lv: number }) {
  return (
    <div className="flex gap-[5px]" aria-hidden="true">
      {[0, 1, 2].map((g) => (
        <div key={g} className="flex gap-[2px]">
          {[0, 1, 2, 3, 4].map((i) => {
            const n = g * 5 + i + 1;
            return <span key={i} className={`block h-3 w-[7px] rounded-[1px] ${n <= lv ? "bg-jade" : "bg-white/15"}`} />;
          })}
        </div>
      ))}
    </div>
  );
}

const Row = ({ label, children, value }: { label: string; children?: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-1.5 text-[15px]">
    <span className="game-serif w-36 shrink-0">{label}</span>
    <div className="flex-1 flex justify-end">{children}</div>
    <span className="num w-16 text-right font-semibold">{value}</span>
  </div>
);

export function StatBars({ t }: { t: Tally }) {
  const over = (lv: number) => (lv > CAP ? <span className="text-crimson-2"> +{lv - CAP} wasted</span> : null);
  return (
    <div className="mt-6 border-t border-game-line pt-3">
      <Row label="Attack" value={t.attack} />
      <Row label="Defense" value={t.def} />
      <Row label="Critical Rate" value={<>Lv {Math.min(t.crit, CAP)}{over(t.crit)}</>}><Segments lv={t.crit} /></Row>
      <Row label="Attack Speed" value={<>Lv {Math.min(t.as, CAP)}{over(t.as)}</>}><Segments lv={t.as} /></Row>
      <Row label="Movement Speed" value={<>Lv {Math.min(t.ms, CAP)}{over(t.ms)}</>}><Segments lv={t.ms} /></Row>
      <p className="mt-3 text-xs text-white/50 leading-relaxed num">
        ≈ {t.critPct.toFixed(0)}% crit chance on this weapon · Attack Speed at {Math.round(capShare(t.as) * 100)}% of the cap&apos;s benefit · Movement at {Math.round(capShare(t.ms, CURVE_MOVE) * 100)}%. Attack counts weapon + necklace + rings + Destruction gears; Crit counts weapon, chest and necklace; speed counts every global source.
      </p>
    </div>
  );
}
