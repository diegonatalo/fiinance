import type { Fii } from "@/types/fii";

export function positionValue(a: Fii): number {
  return a.shares * a.averagePrice;
}

export type Summary = {
  totalInvested: number;
  totalShares: number;
  activeAssets: number;
};

export function calculateSummary(positions: Fii[]): Summary {
  const assets = positions.filter((p) => p.shares > 0);
  return {
    totalInvested: assets.reduce((acc, p) => acc + positionValue(p), 0),
    totalShares: assets.reduce((acc, p) => acc + p.shares, 0),
    activeAssets: assets.length,
  };
}

/** Uma linha da carteira: o investido e o peso no total. */
export type PositionRow = {
  asset: Fii;
  invested: number;
  /** fatia do total investido, em % */
  weight: number;
};

/** Linhas da carteira com o peso de cada fundo no total investido. */
export function positionRows(assets: Fii[]): PositionRow[] {
  const rows = assets.map((asset) => ({ asset, invested: positionValue(asset) }));
  const total = rows.reduce((acc, r) => acc + r.invested, 0);
  return rows.map((r) => ({ ...r, weight: total > 0 ? (r.invested / total) * 100 : 0 }));
}
