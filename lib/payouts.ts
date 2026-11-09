import { monthOf } from "./date";
import type { Payout } from "@/types/fii";

export function payoutTotal(p: Payout): number {
  return p.valuePerShare * p.shares;
}

export type PayoutMonth = {
  month: string;
  total: number;
};

/** Últimos `n` meses terminando em `fim` (yyyy-mm); meses sem proventos valem 0. */
export function lastMonths(
  payouts: Payout[],
  end: string,
  n = 12,
): PayoutMonth[] {
  if (!end) return [];
  const byMonth = new Map<string, number>();
  for (const p of payouts) {
    const month = monthOf(p.date);
    byMonth.set(month, (byMonth.get(month) ?? 0) + payoutTotal(p));
  }
  const [year, month] = end.split("-").map(Number);
  const series: PayoutMonth[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    series.push({ month: key, total: byMonth.get(key) ?? 0 });
  }
  return series;
}

export type PayoutsSummary = {
  total12m: number;
  monthlyAverage: number;
  /** proventos dos últimos 12 meses ÷ total investido, em % */
  dyOnCost: number;
};

export function summarizePayouts(
  payouts: Payout[],
  totalInvested: number,
  currentMonth: string,
): PayoutsSummary {
  const total12m = lastMonths(payouts, currentMonth, 12).reduce(
    (acc, m) => acc + m.total,
    0,
  );
  return {
    total12m,
    monthlyAverage: total12m / 12,
    dyOnCost: totalInvested > 0 ? (total12m / totalInvested) * 100 : 0,
  };
}
