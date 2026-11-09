import { monthOf } from "./date";
import type { Transaction } from "@/types/fii";

export interface EvolutionPoint {
  month: string;
  /** compras − vendas acumuladas até o fim do mês */
  contributed: number;
}

export function contributionsEvolution(transactions: Transaction[]): EvolutionPoint[] {
  const byMonth = new Map<string, number>();
  for (const t of transactions) {
    const amount = t.shares * t.price * (t.type === "compra" ? 1 : -1);
    const month = monthOf(t.date);
    byMonth.set(month, (byMonth.get(month) ?? 0) + amount);
  }
  let accumulated = 0;
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, delta]) => {
      accumulated += delta;
      return { month, contributed: accumulated };
    });
}
