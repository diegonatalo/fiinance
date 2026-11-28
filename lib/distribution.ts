import type { Asset } from "@/types/fii";

export type Slice = {
  name: string;
  amount: number;
};

export const NO_SEGMENT = "Sem segmento";
export const NO_RISK = "Sem perfil";

function group(assets: Asset[], key: (a: Asset) => string): Slice[] {
  const lookup = new Map<string, number>();
  for (const a of assets) {
    const amount = a.shares * a.averagePrice;
    if (amount <= 0) continue;
    const k = key(a);
    lookup.set(k, (lookup.get(k) ?? 0) + amount);
  }
  return Array.from(lookup.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((x, y) => y.amount - x.amount);
}

/** Papel × tijolo, pelo valor investido. */
export function distributionByType(assets: Asset[]): Slice[] {
  return group(assets, (a) => (a.type === "papel" ? "Papel" : "Tijolo"));
}

/** Só os fundos de tijolo, por segmento. */
export function distributionBySegment(assets: Asset[]): Slice[] {
  return group(
    assets.filter((a) => a.type === "tijolo"),
    (a) => a.segment ?? NO_SEGMENT,
  );
}

/** Só os fundos de papel, por perfil de risco. */
export function distributionByRisk(assets: Asset[]): Slice[] {
  return group(
    assets.filter((a) => a.type === "papel"),
    (a) => a.risk ?? NO_RISK,
  );
}
