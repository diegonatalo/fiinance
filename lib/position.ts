import type { Asset, Fii, Transaction } from "@/types/fii";

/**
 * Consolida as transações de um ativo em cotas e preço médio.
 * Compras recalculam o preço médio; vendas reduzem as cotas mantendo o preço médio.
 */
export function calculatePosition(asset: Asset, transactions: Transaction[]): Fii {
  const sorted = transactions
    .filter((t) => t.assetId === asset.id)
    .toSorted((a, b) => a.date.localeCompare(b.date));

  let shares = 0;
  let cost = 0;
  for (const t of sorted) {
    if (t.type === "compra") {
      shares += t.shares;
      cost += t.shares * t.price;
    } else {
      const sold = Math.min(t.shares, shares);
      if (shares > 0) cost -= (cost / shares) * sold;
      shares -= sold;
    }
  }

  return { ...asset, shares, averagePrice: shares > 0 ? cost / shares : 0 };
}

export function calculatePositions(
  assets: Asset[],
  transactions: Transaction[],
): Fii[] {
  return assets.map((a) => calculatePosition(a, transactions));
}

/** Cotas em carteira numa data, considerando só operações até ela. */
export function sharesOn(
  assetId: string,
  date: string,
  transactions: Transaction[],
): number {
  return transactions
    .filter((t) => t.assetId === assetId && t.date <= date)
    .reduce((acc, t) => acc + (t.type === "compra" ? t.shares : -t.shares), 0);
}
