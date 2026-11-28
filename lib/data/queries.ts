import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import type { AppData } from "@/types/fii";
import { assetFromRow } from "./rows";

/** A carteira inteira da pessoa logada. */
export async function loadPortfolio(userId: string): Promise<AppData> {
  const rows = await db.select().from(assets).where(eq(assets.userId, userId)).orderBy(asc(assets.createdAt));
  return { assets: rows.map(assetFromRow) };
}
