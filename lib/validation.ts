import { BRICK_SEGMENTS, MAX_RATING, MIN_RATING, RISK_PROFILES, type Asset, type AppData } from "@/types/fii";

/*
 * Validação do que chega às Server Actions. Tudo entra como `unknown`, porque o
 * navegador pode mandar qualquer coisa, e sai normalizado ou null. Pura: roda nos
 * testes sem banco.
 */

export const EMPTY_DATA: AppData = { assets: [] };

export const TICKER_REGEX = /^[A-Z]{4}\d{2}B?$/;

/** Limites de tamanho de cada campo. Os valores guardados cabem num `integer` do Postgres. */
export const LIMITS = {
  /** ids gerados no navegador (`uid`) */
  idLength: 64,
  /** cotas de um fundo */
  shares: 10_000_000,
  /** preço médio de uma cota: até R$ 1 milhão, em centavos */
  priceCents: 100_000_000,
  /** último rendimento por cota: até R$ 10 mil, em centésimos de centavo */
  dividendHundredthCents: 100_000_000,
} as const;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Id gerado no navegador, ou null. */
export function validId(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 && v.length <= LIMITS.idLength ? v : null;
}

/** Reais em unidades de `1/scale` real; null com mais casas que a escala, negativo ou acima do máximo. */
function toUnits(value: unknown, scale: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  const units = Math.round(value * scale);
  if (Math.abs(value * scale - units) > 1e-6 || units > max) return null;
  return units;
}

/** Reais para centavos (até 2 casas); 0 é aceito. */
export const toCents = (value: unknown, max: number) => toUnits(value, 100, max);

/** Reais para centésimos de centavo (até 4 casas); 0 é aceito. */
export const toHundredthCents = (value: unknown, max: number) => toUnits(value, 10_000, max);

export function normalizeAsset(raw: unknown): Asset | null {
  if (!isObj(raw) || typeof raw.ticker !== "string") return null;
  const id = validId(raw.id);
  const ticker = raw.ticker.trim().toUpperCase();
  if (!id || !TICKER_REGEX.test(ticker)) return null;

  let segment: Asset["segment"] = null;
  let risk: Asset["risk"] = null;
  if (raw.type === "tijolo") {
    if (!BRICK_SEGMENTS.includes(raw.segment as never)) return null;
    segment = raw.segment as Asset["segment"];
  } else if (raw.type === "papel") {
    if (!RISK_PROFILES.includes(raw.risk as never)) return null;
    risk = raw.risk as Asset["risk"];
  } else return null;

  const { shares, rating } = raw;
  if (typeof shares !== "number" || !Number.isInteger(shares) || shares < 0 || shares > LIMITS.shares) return null;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) return null;
  const priceCents = toCents(raw.averagePrice, LIMITS.priceCents);
  const dividend = toHundredthCents(raw.lastDividend, LIMITS.dividendHundredthCents);
  if (priceCents === null || dividend === null) return null;
  // com cotas, o preço médio é obrigatório
  if (shares > 0 && priceCents === 0) return null;

  return {
    id,
    ticker,
    type: raw.type,
    segment,
    risk,
    shares,
    averagePrice: priceCents / 100,
    lastDividend: dividend / 10_000,
    rating,
  };
}
