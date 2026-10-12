import type { Tally } from "@/lib/cd/builds";
import { CAP, capShare, CURVE_MOVE } from "@/lib/cd/stats";

/* Segmented bars as in the game's stat panel: 15 cells in three groups of five. */
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

const I = {
  heart: "M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z",
  diamond: "M12 2l10 10-10 10L2 12z M12 7l5 5-5 5-5-5z",
  leaf: "M4 20c0-9 5-14 16-16-1 11-6 16-16 16zm2-2c6-1 9-5 11-11",
  sword: "M3 21l6-6M9 15l9-9 3 0 0 3-9 9zM14 10l-1-1",
  shield: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z",
  crit: "M4 12l4-1 1-4 3 3 4-1-1 4 3 3-4 1-1 4-3-3-4 1 1-4z",
  speed: "M3 12h8M5 7h8M3 17h6M14 5l7 7-7 7",
  boot: "M6 3h6v8l5 3v4H6z",
  flame: "M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 1-7 1-10z",
  snow: "M12 2v20M4 7l16 10M4 17L20 7",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
};
const Ico = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d={d} /></svg>
);

const Row = ({ icon, label, children, value, muted }: { icon: string; label: string; children?: React.ReactNode; value: React.ReactNode; muted?: boolean }) => (
  <div className={`flex items-center gap-3 py-[5px] text-[15px] ${muted ? "text-white/45" : ""}`}>
    <Ico d={icon} />
    <span className="game-serif w-36 shrink-0">{label}</span>
    <div className="flex flex-1 justify-end">{children}</div>
    <span className="num w-20 text-right font-semibold">{value}</span>
  </div>
);

export function StatBars({ t }: { t: Tally }) {
  const lv = (v: number) => <>Lv {Math.min(v, CAP)}{v > CAP ? <span className="text-crimson-2"> +{v - CAP}</span> : null}</>;
  return (
    <div className="mt-6 border-t border-white/10 pt-3">
      <Row icon={I.heart} label="Health" value={<span className="text-xs font-normal">Abyss Tree</span>} muted />
      <Row icon={I.diamond} label="Stamina" value={<span className="text-xs font-normal">Abyss Tree</span>} muted />
      <Row icon={I.leaf} label="Spirit" value={<span className="text-xs font-normal">Abyss Tree</span>} muted />
      <Row icon={I.sword} label="Attack" value={t.attack} />
      <Row icon={I.shield} label="Defense" value={t.def} />
      <Row icon={I.crit} label="Critical Rate" value={lv(t.crit)}><Segments lv={t.crit} /></Row>
      <Row icon={I.speed} label="Attack Speed" value={lv(t.as)}><Segments lv={t.as} /></Row>
      <Row icon={I.boot} label="Movement Speed" value={lv(t.ms)}><Segments lv={t.ms} /></Row>
      <Row icon={I.flame} label="Fire Resistance" value={lv(t.fire)}><Segments lv={t.fire} /></Row>
      <Row icon={I.snow} label="Ice Resistance" value={lv(t.ice)}><Segments lv={t.ice} /></Row>
      <Row icon={I.bolt} label="Lightning Resistance" value={lv(t.lightning)}><Segments lv={t.lightning} /></Row>
      <p className="num mt-3 text-xs leading-relaxed text-white/50">
        ≈ {t.critPct.toFixed(0)}% crit chance on the main weapon · Attack Speed at {Math.round(capShare(t.as) * 100)}% of the cap&apos;s benefit · Movement at {Math.round(capShare(t.ms, CURVE_MOVE) * 100)}%. Health, Stamina and Spirit come from your Abyss Tree, not gear. Attack counts weapon + necklace + rings + Destruction gears; Crit counts weapon, chest and necklace; speed counts every global source. Gold bars are refinement; orbs are sockets.
      </p>
    </div>
  );
}
