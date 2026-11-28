import type { assets } from "@/lib/db/schema";
import { BRICK_SEGMENTS, RISK_PROFILES, type Asset } from "@/types/fii";

/*
 * Conversão entre as linhas do banco (dinheiro em centavos) e os tipos do app
 * (reais). Pura: testada sem banco.
 */

type AssetRow = typeof assets.$inferSelect;

export const assetFromRow = (row: AssetRow): Asset => ({
  id: row.id,
  ticker: row.ticker,
  type: row.type,
  // um valor fora da lista (gravado pela versão anterior durante o deploy) vira "sem segmento"
  segment: row.type === "tijolo" && row.segment && BRICK_SEGMENTS.includes(row.segment) ? row.segment : null,
  risk: row.type === "papel" && row.risk && RISK_PROFILES.includes(row.risk) ? row.risk : null,
  shares: row.shares,
  averagePrice: row.averagePriceCents / 100,
  lastDividend: row.lastDividendHundredthCents / 10_000,
  rating: row.rating,
});

export const assetToRow = (userId: string, a: Asset) => ({
  userId,
  id: a.id,
  ticker: a.ticker,
  type: a.type,
  segment: a.segment,
  risk: a.risk,
  shares: a.shares,
  averagePriceCents: Math.round(a.averagePrice * 100),
  lastDividendHundredthCents: Math.round(a.lastDividend * 10_000),
  rating: a.rating,
});
