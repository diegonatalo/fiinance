export type MagicNumberResult = {
  magicNumber: number;
  missing: number;
  progress: number;
  reached: boolean;
  missingContribution: number;
};

/** Número mágico = preço da cota ÷ provento por cota, arredondado para cima. */
export function calculateMagicNumber(
  dividend: number,
  price: number,
  currentShares: number,
): MagicNumberResult | null {
  if (
    !Number.isFinite(dividend) ||
    dividend <= 0 ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return null;
  }
  const magicNumber = Math.ceil(price / dividend);
  const missing = Math.max(0, magicNumber - currentShares);
  return {
    magicNumber,
    missing,
    progress: Math.min(100, (currentShares / magicNumber) * 100),
    reached: currentShares >= magicNumber,
    missingContribution: missing * price,
  };
}
