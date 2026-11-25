import type { assets, payouts, transactions } from "@/lib/db/schema";
import { payoutCents } from "@/lib/validation";
import type { Asset, Payout, Transaction } from "@/types/fii";

/*
 * Conversão entre as linhas do banco (dinheiro em centavos) e os tipos do app
 * (reais). Pura: testada sem banco.
 */

type AssetRow = typeof assets.$inferSelect;
type TransactionRow = typeof transactions.$inferSelect;
type PayoutRow = typeof payouts.$inferSelect;

export const assetFromRow = (row: AssetRow): Asset => ({
  id: row.id,
  ticker: row.ticker,
  type: row.type,
  segment: row.segment,
});

export const assetToRow = (userId: string, a: Asset) => ({
  userId,
  id: a.id,
  ticker: a.ticker,
  type: a.type,
  segment: a.segment,
});

export const transactionFromRow = (row: TransactionRow): Transaction => ({
  id: row.id,
  assetId: row.assetId,
  type: row.type,
  date: row.date,
  shares: row.shares,
  price: row.priceCents / 100,
});

export const transactionToRow = (userId: string, t: Transaction) => ({
  userId,
  id: t.id,
  assetId: t.assetId,
  type: t.type,
  date: t.date,
  shares: t.shares,
  priceCents: Math.round(t.price * 100),
});

export const payoutFromRow = (row: PayoutRow): Payout => ({
  id: row.id,
  assetId: row.assetId,
  date: row.date,
  shares: row.shares,
  valuePerShare: row.totalCents / 100 / row.shares,
});

export const payoutToRow = (userId: string, p: Payout) => ({
  userId,
  id: p.id,
  assetId: p.assetId,
  date: p.date,
  shares: p.shares,
  totalCents: payoutCents(p),
});
