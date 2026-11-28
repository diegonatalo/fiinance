import { targetWeights } from "./targets";
import type { Asset } from "@/types/fii";

/** Cotas × preço médio. */
export function positionValue(a: Asset): number {
  return a.shares * a.averagePrice;
}

/** Último rendimento × cotas: o que o fundo deve pagar no próximo mês. */
export function expectedIncome(a: Asset): number {
  return a.shares * a.lastDividend;
}

export type Summary = {
  totalInvested: number;
  totalShares: number;
  /** fundos com cotas */
  activeAssets: number;
  /** soma do último rendimento × cotas de cada fundo, por mês */
  expectedIncome: number;
};

export function calculateSummary(assets: Asset[]): Summary {
  return {
    totalInvested: assets.reduce((acc, a) => acc + positionValue(a), 0),
    totalShares: assets.reduce((acc, a) => acc + a.shares, 0),
    activeAssets: assets.filter((a) => a.shares > 0).length,
    expectedIncome: assets.reduce((acc, a) => acc + expectedIncome(a), 0),
  };
}

/** Uma linha da carteira: o investido, o peso no total e a meta. */
export type PositionRow = {
  asset: Asset;
  invested: number;
  /** fatia do total investido, em % */
  weight: number;
  /** % ideal, pela nota do fundo */
  target: number;
  /** peso − meta, em pontos percentuais: negativo é abaixo da meta */
  gap: number;
  /** proventos esperados do fundo, por mês */
  income: number;
};

export function positionRows(assets: Asset[]): PositionRow[] {
  const total = assets.reduce((acc, a) => acc + positionValue(a), 0);
  const targets = targetWeights(assets);
  return assets.map((asset) => {
    const invested = positionValue(asset);
    const weight = total > 0 ? (invested / total) * 100 : 0;
    const target = targets.get(asset.id) ?? 0;
    return { asset, invested, weight, target, gap: weight - target, income: expectedIncome(asset) };
  });
}
