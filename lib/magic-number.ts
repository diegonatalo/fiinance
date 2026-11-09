export interface MagicNumberResult {
  magicNumber: number;
  missing: number;
  progress: number;
  reached: boolean;
  missingContribution: number;
}

/** Magic number = cotação ÷ dividendo por cota, arredondado para cima. */
export function calculateMagicNumber(
  dividend: number,
  quote: number,
  currentShares: number,
): MagicNumberResult | null {
  if (
    !Number.isFinite(dividend) ||
    dividend <= 0 ||
    !Number.isFinite(quote) ||
    quote <= 0
  ) {
    return null;
  }
  const magicNumber = Math.ceil(quote / dividend);
  const missing = Math.max(0, magicNumber - currentShares);
  return {
    magicNumber,
    missing,
    progress: Math.min(100, (currentShares / magicNumber) * 100),
    reached: currentShares >= magicNumber,
    missingContribution: missing * quote,
  };
}
