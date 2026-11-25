import { isValidDate } from "./date";
import {
  PAPER_SEGMENTS,
  BRICK_SEGMENTS,
  type Asset,
  type AppData,
  type Payout,
  type Transaction,
} from "@/types/fii";

/*
 * Validação do que chega às Server Actions. Tudo entra como `unknown`, porque o
 * navegador pode mandar qualquer coisa, e sai normalizado ou null. Pura: roda nos
 * testes sem banco.
 */

export const EMPTY_DATA: AppData = {
  assets: [],
  transactions: [],
  payouts: [],
  paperTarget: null,
};

export const TICKER_REGEX = /^[A-Z]{4}\d{2}B?$/;

/** Limites de tamanho de cada campo. Valores em centavos cabem num `integer` do Postgres. */
export const LIMITS = {
  /** ids gerados no navegador (`uid`) */
  idLength: 64,
  /** cotas numa operação ou num provento */
  shares: 10_000_000,
  /** preço de uma cota: até R$ 1 milhão */
  priceCents: 100_000_000,
  /** total de um provento: até R$ 10 milhões */
  payoutCents: 1_000_000_000,
  /** datas aceitas (aaaa-mm-dd) */
  firstDate: "1990-01-01",
  lastDate: "2100-12-31",
} as const;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Id gerado no navegador, ou null. */
export function validId(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 && v.length <= LIMITS.idLength ? v : null;
}

const validDate = (v: unknown): v is string =>
  typeof v === "string" && isValidDate(v) && v >= LIMITS.firstDate && v <= LIMITS.lastDate;

const validShares = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v > 0 && v <= LIMITS.shares;

/** Reais para centavos; null com mais de 2 casas decimais ou fora de (0, máximo]. */
export function toCents(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  const cents = Math.round(value * 100);
  if (Math.abs(value * 100 - cents) > 1e-6 || cents > max) return null;
  return cents;
}

export function normalizeAsset(raw: unknown): Asset | null {
  if (!isObj(raw) || typeof raw.ticker !== "string") return null;
  const id = validId(raw.id);
  const ticker = raw.ticker.trim().toUpperCase();
  if (!id || !TICKER_REGEX.test(ticker)) return null;
  if (raw.type !== "papel" && raw.type !== "tijolo") return null;
  const segments: readonly string[] = raw.type === "papel" ? PAPER_SEGMENTS : BRICK_SEGMENTS;
  if (typeof raw.segment !== "string" || !segments.includes(raw.segment)) return null;
  return { id, ticker, type: raw.type, segment: raw.segment as Asset["segment"] };
}

export function normalizeTransaction(raw: unknown): Transaction | null {
  if (!isObj(raw)) return null;
  const id = validId(raw.id);
  const assetId = validId(raw.assetId);
  if (!id || !assetId) return null;
  if (raw.type !== "compra" && raw.type !== "venda") return null;
  if (!validDate(raw.date) || !validShares(raw.shares)) return null;
  const cents = toCents(raw.price, LIMITS.priceCents);
  if (cents === null) return null;
  return { id, assetId, type: raw.type, date: raw.date, shares: raw.shares, price: cents / 100 };
}

/** O total de um provento em centavos (o que fica no banco). */
export const payoutCents = (p: Pick<Payout, "valuePerShare" | "shares">) => Math.round(p.valuePerShare * p.shares * 100);

export function normalizePayout(raw: unknown): Payout | null {
  if (!isObj(raw)) return null;
  const id = validId(raw.id);
  const assetId = validId(raw.assetId);
  if (!id || !assetId || !validDate(raw.date) || !validShares(raw.shares)) return null;
  const value = raw.valuePerShare;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  const total = payoutCents({ valuePerShare: value, shares: raw.shares });
  if (total < 1 || total > LIMITS.payoutCents) return null;
  return { id, assetId, date: raw.date, valuePerShare: value, shares: raw.shares };
}

/** Meta de papel de 0 a 100, ou null para "sem meta"; undefined quando inválida. */
export function normalizePaperTarget(raw: unknown): number | null | undefined {
  if (raw === null) return null;
  return typeof raw === "number" && Number.isFinite(raw) && raw >= 0 && raw <= 100 ? raw : undefined;
}
