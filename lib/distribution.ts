import type { Fii } from "@/types/fii";

export interface Slice {
  name: string;
  amount: number;
}

function assetValue(a: Fii) {
  return a.shares * a.averagePrice;
}

function group(assets: Fii[], key: (a: Fii) => string): Slice[] {
  const lookup = new Map<string, number>();
  for (const a of assets) {
    if (a.shares <= 0) continue;
    const k = key(a);
    lookup.set(k, (lookup.get(k) ?? 0) + assetValue(a));
  }
  return Array.from(lookup.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((x, y) => y.amount - x.amount);
}

export function distributionByAsset(assets: Fii[]): Slice[] {
  return group(assets, (a) => a.ticker.toUpperCase());
}

export function distributionByType(assets: Fii[]): Slice[] {
  return group(assets, (a) => (a.type === "papel" ? "Papel" : "Tijolo"));
}

export function paperSegmentDistribution(assets: Fii[]): Slice[] {
  return group(
    assets.filter((a) => a.type === "papel"),
    (a) => a.segment,
  );
}

export function brickSegmentDistribution(assets: Fii[]): Slice[] {
  return group(
    assets.filter((a) => a.type === "tijolo"),
    (a) => a.segment,
  );
}
