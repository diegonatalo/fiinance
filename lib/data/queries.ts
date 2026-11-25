import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets, payouts, transactions, userSettings } from "@/lib/db/schema";
import type { AppData } from "@/types/fii";
import { assetFromRow, payoutFromRow, transactionFromRow } from "./rows";

/** A carteira inteira da pessoa logada: fundos, operações, proventos e meta. */
export async function loadPortfolio(userId: string): Promise<AppData> {
  const [assetRows, transactionRows, payoutRows, settings] = await Promise.all([
    db.select().from(assets).where(eq(assets.userId, userId)).orderBy(asc(assets.createdAt)),
    db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(asc(transactions.date)),
    db.select().from(payouts).where(eq(payouts.userId, userId)).orderBy(asc(payouts.date)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId)),
  ]);
  return {
    assets: assetRows.map(assetFromRow),
    transactions: transactionRows.map(transactionFromRow),
    payouts: payoutRows.map(payoutFromRow),
    paperTarget: settings[0]?.paperTarget ?? null,
  };
}
