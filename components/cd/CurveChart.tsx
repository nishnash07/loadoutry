import { CURVE_CRIT, CURVE_MOVE, CRIT_BASE, CRIT_K } from "@/lib/cd/stats";

export function CurveChart() {
  const W = 520, H = 300, L = 44, R = 60, T = 16, B = 36;
  const x = (i: number) => L + ((W - L - R) * i) / 15;
  const y = (v: number) => T + (H - T - B) * (1 - v / 64);
  const path = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-ink-2" role="img" aria-label="Per-level stat curves decoded from the game status table">
      {[0, 16, 32, 48, 64].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.2} />
          <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize={11} fill="currentColor">{v}</text>
          <text x={W - R + 6} y={y(v) + 4} fontSize={11} fill="currentColor">{(CRIT_BASE + CRIT_K * v).toFixed(0)}%</text>
        </g>
      ))}
      {[0, 5, 10, 15].map((i) => <text key={i} x={x(i)} y={H - 14} textAnchor="middle" fontSize={11} fill="currentColor">Lv {i}</text>)}
      <path d={path(CURVE_MOVE)} fill="none" stroke="#d4a53c" strokeWidth={2.5} />
      <path d={path(CURVE_CRIT)} fill="none" stroke="#c8102e" strokeWidth={2.5} />
      {CURVE_CRIT.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={2.6} fill="#c8102e" />)}
      <text x={L} y={T - 4} fontSize={11} fill="currentColor">table units</text>
      <text x={W - R + 6} y={T - 4} fontSize={11} fill="currentColor">est. crit</text>
    </svg>
  );
}
