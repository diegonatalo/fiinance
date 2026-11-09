import type { Quote, Fii } from "@/types/fii";

export function positionValue(a: Fii): number {
  return a.shares * a.averagePrice;
}

export interface Summary {
  totalInvested: number;
  totalShares: number;
  activeAssets: number;
  /** valor a mercado (usa o custo quando falta cotação) */
  marketValue: number;
  /** true quando todos os ativos com cotas têm cotação */
  completeQuotes: boolean;
  result: number;
  resultPct: number;
}

export function calculateSummary(
  positions: Fii[],
  quotes: Record<string, Quote>,
): Summary {
  const assets = positions.filter((p) => p.shares > 0);
  let totalInvested = 0;
  let totalShares = 0;
  let marketValue = 0;
  let completeQuotes = true;

  for (const p of assets) {
    const cost = positionValue(p);
    const entry = quotes[p.id];
    totalInvested += cost;
    totalShares += p.shares;
    if (entry) {
      marketValue += p.shares * entry.price;
    } else {
      marketValue += cost;
      completeQuotes = false;
    }
  }

  const result = marketValue - totalInvested;
  return {
    totalInvested,
    totalShares,
    activeAssets: assets.length,
    marketValue,
    completeQuotes: assets.length > 0 && completeQuotes,
    result,
    resultPct: totalInvested > 0 ? (result / totalInvested) * 100 : 0,
  };
}
