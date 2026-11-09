export interface AveragePriceResult {
  newAveragePrice: number;
  totalShares: number;
  contribution: number;
  newTotalInvested: number;
  variation: number;
  variationPct: number;
}

export function simulateAveragePrice(
  currentShares: number,
  currentPrice: number,
  newShares: number,
  newPrice: number,
): AveragePriceResult | null {
  if (
    !Number.isFinite(currentShares) ||
    currentShares < 0 ||
    !Number.isFinite(currentPrice) ||
    currentPrice <= 0 ||
    !Number.isFinite(newShares) ||
    newShares <= 0 ||
    !Number.isFinite(newPrice) ||
    newPrice <= 0
  ) {
    return null;
  }
  const currentTotal = currentShares * currentPrice;
  const contribution = newShares * newPrice;
  const totalShares = currentShares + newShares;
  const newAveragePrice = (currentTotal + contribution) / totalShares;
  const variation = newAveragePrice - currentPrice;
  return {
    newAveragePrice,
    totalShares,
    contribution,
    newTotalInvested: currentTotal + contribution,
    variation,
    variationPct: (variation / currentPrice) * 100,
  };
}
