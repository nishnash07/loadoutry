/**
 * Per-level stat curves decoded from Crimson Desert's gamedata/statusinfo table
 * (raw u64 / 1e9). Critical Rate and Attack Speed share one curve.
 * Units are unlabeled in the table; CRIT_K/CRIT_BASE calibrate to community
 * measurements (Lv5 13-16%, Lv10 24-25%, Lv15 33-35%).
 */
export const CURVE_CRIT = [0, 7.424, 14.08, 19.968, 25.344, 30.208, 34.816, 38.912, 42.752, 46.336, 49.664, 52.736, 55.808, 58.624, 61.44, 64];
export const CURVE_MOVE = [0, 5.12, 10.24, 15.36, 20.48, 25.6, 30.72, 35.584, 40.192, 44.544, 48.64, 52.224, 55.552, 58.624, 61.44, 64];
export const CAP = 15;
export const CRIT_BASE = 5;
export const CRIT_K = 0.53;

export const clampLv = (lv: number) => Math.max(0, Math.min(CAP, Math.round(lv)));
export const critPct = (lv: number) => CRIT_BASE + CRIT_K * CURVE_CRIT[clampLv(lv)];
/** Share of the cap's total benefit reached at this level (0..1). */
export const capShare = (lv: number, curve = CURVE_CRIT) => curve[clampLv(lv)] / 64;
/** Expected damage index: Attack × (1 + crit chance), crits at 2×. Comparison only. */
export const damageIndex = (attack: number, critLv: number) => attack * (1 + critPct(critLv) / 100);
