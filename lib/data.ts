import { isValidDate } from "./date";
import {
  PAPER_SEGMENTS,
  BRICK_SEGMENTS,
  type Asset,
  type Quote,
  type AppData,
  type Payout,
  type Transaction,
} from "@/types/fii";

export const EMPTY_DATA: AppData = {
  version: 2,
  assets: [],
  transactions: [],
  payouts: [],
  quotes: {},
  paperTarget: null,
};

export const TICKER_REGEX = /^[A-Z]{4}\d{2}B?$/;

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function positive(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function list(v: unknown): Obj[] {
  return Array.isArray(v) ? v.filter(isObj) : [];
}

function sanitizeAsset(o: Obj): Asset | null {
  if (typeof o.id !== "string" || typeof o.ticker !== "string") return null;
  if (o.type !== "papel" && o.type !== "tijolo") return null;
  const segments: readonly string[] =
    o.type === "papel" ? PAPER_SEGMENTS : BRICK_SEGMENTS;
  if (typeof o.segment !== "string" || !segments.includes(o.segment))
    return null;
  return {
    id: o.id,
    ticker: o.ticker.trim().toUpperCase(),
    type: o.type,
    segment: o.segment as Asset["segment"],
  };
}

function sanitizeTransaction(o: Obj): Transaction | null {
  if (typeof o.id !== "string" || typeof o.assetId !== "string") return null;
  if (o.type !== "compra" && o.type !== "venda") return null;
  if (typeof o.date !== "string" || !isValidDate(o.date)) return null;
  if (!positive(o.shares) || !positive(o.price)) return null;
  return {
    id: o.id,
    assetId: o.assetId,
    type: o.type,
    date: o.date,
    shares: o.shares,
    price: o.price,
  };
}

function sanitizePayout(o: Obj): Payout | null {
  if (typeof o.id !== "string" || typeof o.assetId !== "string") return null;
  if (typeof o.date !== "string" || !isValidDate(o.date)) return null;
  if (!positive(o.valuePerShare) || !positive(o.shares)) return null;
  return {
    id: o.id,
    assetId: o.assetId,
    date: o.date,
    valuePerShare: o.valuePerShare,
    shares: o.shares,
  };
}

/**
 * Valida e normaliza qualquer valor vindo do storage ou de um arquivo importado.
 * Descarta itens inválidos e registros órfãos. Retorna null se não parecer um backup.
 */
export function sanitizeData(raw: unknown): AppData | null {
  if (!isObj(raw) || !Array.isArray(raw.assets)) return null;

  const assets: Asset[] = [];
  const ids = new Set<string>();
  for (const o of list(raw.assets)) {
    const a = sanitizeAsset(o);
    if (a && !ids.has(a.id)) {
      ids.add(a.id);
      assets.push(a);
    }
  }

  const transactions = list(raw.transactions)
    .map(sanitizeTransaction)
    .filter((t): t is Transaction => t !== null && ids.has(t.assetId));
  const payouts = list(raw.payouts)
    .map(sanitizePayout)
    .filter((p): p is Payout => p !== null && ids.has(p.assetId));

  const quotes: Record<string, Quote> = {};
  if (isObj(raw.quotes)) {
    for (const [id, c] of Object.entries(raw.quotes)) {
      if (ids.has(id) && isObj(c) && positive(c.price)) {
        quotes[id] = {
          price: c.price,
          updatedAt:
            typeof c.updatedAt === "string" ? c.updatedAt : "",
        };
      }
    }
  }

  const target = raw.paperTarget;
  const paperTarget =
    typeof target === "number" && Number.isFinite(target) && target >= 0 && target <= 100
      ? target
      : null;

  return { version: 2, assets, transactions, payouts, quotes, paperTarget };
}

/** Versão para o `useLocalStorage`: nunca falha, cai no estado vazio. */
export function sanitizeOrEmpty(raw: unknown): AppData {
  return sanitizeData(raw) ?? EMPTY_DATA;
}
