"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { normalizeAsset, validId } from "@/lib/validation";
import { assetToRow } from "./rows";

/*
 * Cada ação confere a sessão de novo e valida o que chegou: elas são endpoints
 * públicos, e o navegador pode mandar qualquer coisa. Toda escrita é limitada
 * às linhas da própria pessoa (user_id).
 *
 * O primeiro argumento é a conta para a qual a tela foi carregada. Ele não dá
 * acesso a nada: só faz a ação recusar quando outra conta entrou em outra aba,
 * em vez de gravar os dados de uma pessoa na conta da outra.
 */

async function requireUserId(owner: unknown) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão expirada. Entre de novo.");
  if (user.id !== owner) throw new Error("Outra conta entrou neste navegador.");
  return user.id;
}

function valid<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Dados inválidos.");
  return value;
}

/* ---------- Fundos ---------- */

export async function addAsset(owner: unknown, asset: unknown) {
  const userId = await requireUserId(owner);
  await db.insert(assets).values(assetToRow(userId, valid(normalizeAsset(asset))));
}

export async function updateAsset(owner: unknown, asset: unknown) {
  const userId = await requireUserId(owner);
  const row = assetToRow(userId, valid(normalizeAsset(asset)));
  await db
    .update(assets)
    .set({
      ticker: row.ticker,
      type: row.type,
      segment: row.segment,
      risk: row.risk,
      shares: row.shares,
      averagePriceCents: row.averagePriceCents,
      lastDividendHundredthCents: row.lastDividendHundredthCents,
      rating: row.rating,
    })
    .where(and(eq(assets.userId, userId), eq(assets.id, row.id)));
}

/** Apaga o fundo (e, em cascata, o que sobrou da versão anterior: operações e proventos). */
export async function removeAsset(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db.delete(assets).where(and(eq(assets.userId, userId), eq(assets.id, valid(validId(id)))));
}

/** "Desfazer" a exclusão: devolve o fundo como estava. */
export async function restoreAsset(owner: unknown, asset: unknown) {
  const userId = await requireUserId(owner);
  await db.insert(assets).values(assetToRow(userId, valid(normalizeAsset(asset)))).onConflictDoNothing();
}
