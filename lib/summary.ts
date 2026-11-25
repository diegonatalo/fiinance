import type { Quote, Fii } from "@/types/fii";

export function positionValue(a: Fii): number {
  return a.shares * a.averagePrice;
}

export type Summary = {
  totalInvested: number;
  totalShares: number;
  activeAssets: number;
  /** valor a mercado (usa o custo quando falta cotação) */
  marketValue: number;
  /** true quando todos os ativos com cotas têm cotação */
  completeQuotes: boolean;
  result: number;
  resultPct: number;
};

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

/** Uma linha da carteira: custo, valor de hoje, resultado e peso. */
export type PositionRow = {
  asset: Fii;
  invested: number;
  quote?: number;
  /** valor a mercado; sem cotação, o custo */
  value: number;
  result?: number;
  /** variação da cotação sobre o preço médio, em % */
  resultPct?: number;
  /** fatia do valor total da carteira, em % */
  weight: number;
};

/** Linhas da carteira com o peso de cada fundo no valor de hoje. */
export function positionRows(assets: Fii[], quotes: Record<string, Quote>): PositionRow[] {
  const rows = assets.map((asset) => {
    const invested = positionValue(asset);
    const quote = quotes[asset.id]?.price;
    if (quote === undefined || asset.shares === 0) return { asset, invested, quote, value: invested, weight: 0 };
    const value = asset.shares * quote;
    const result = value - invested;
    return { asset, invested, quote, value, result, resultPct: invested > 0 ? (result / invested) * 100 : 0, weight: 0 };
  });
  const total = rows.reduce((acc, r) => acc + r.value, 0);
  return rows.map((r) => ({ ...r, weight: total > 0 ? (r.value / total) * 100 : 0 }));
}
