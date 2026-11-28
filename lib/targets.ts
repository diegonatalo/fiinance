import type { Asset } from "@/types/fii";

const value = (a: Asset) => a.shares * a.averagePrice;

/** % ideal de cada fundo: a nota dele ÷ a soma das notas, em %. */
export function targetWeights(assets: Asset[]): Map<string, number> {
  const sum = assets.reduce((acc, a) => acc + a.rating, 0);
  return new Map(assets.map((a) => [a.id, sum > 0 ? (a.rating / sum) * 100 : 0]));
}

/**
 * Menor aporte, só com compras, que deixa todos os fundos na meta. O fundo mais
 * acima da meta define o tamanho da carteira: T' = max(valor ÷ meta), aporte = T' − T.
 * null sem nada investido.
 */
export function minimumContribution(assets: Asset[]): number | null {
  const total = assets.reduce((acc, a) => acc + value(a), 0);
  if (total <= 0) return null;
  const targets = targetWeights(assets);
  const needed = Math.max(...assets.map((a) => value(a) / ((targets.get(a.id) ?? 0) / 100)));
  const contribution = needed - total;
  return contribution > 0.005 ? contribution : 0;
}

export type ContributionShare = {
  asset: Asset;
  amount: number;
};

/**
 * Divide um aporte entre os fundos que ficariam abaixo da meta depois dele,
 * na proporção do que falta a cada um. Fundos que não recebem nada ficam de fora.
 */
export function splitContribution(assets: Asset[], amount: number): ContributionShare[] {
  if (!Number.isFinite(amount) || amount <= 0) return [];
  const total = assets.reduce((acc, a) => acc + value(a), 0);
  const targets = targetWeights(assets);
  const after = total + amount;
  const deficits = assets.map((asset) => ({
    asset,
    missing: Math.max(0, ((targets.get(asset.id) ?? 0) / 100) * after - value(asset)),
  }));
  const missing = deficits.reduce((acc, d) => acc + d.missing, 0);
  if (missing <= 0) return [];
  return deficits
    .filter((d) => d.missing > 0)
    .map((d) => ({ asset: d.asset, amount: (d.missing / missing) * amount }))
    .toSorted((x, y) => y.amount - x.amount);
}
