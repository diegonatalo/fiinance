"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets, payouts, transactions, userSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import {
  normalizeAsset,
  normalizePaperTarget,
  normalizePayout,
  normalizeTransaction,
  validId,
} from "@/lib/validation";
import { assetToRow, payoutToRow, transactionToRow } from "./rows";

/*
 * Cada ação confere a sessão de novo e valida o que chegou: elas são endpoints
 * públicos, e o navegador pode mandar qualquer coisa. Toda escrita é limitada
 * às linhas da própria pessoa (user_id).
 *
 * O primeiro argumento é a conta para a qual a tela foi carregada. Ele não dá
 * acesso a nada: só faz a ação recusar quando outra conta entrou em outra aba,
 * em vez de gravar os dados de uma pessoa na conta da outra.
 */

/** Mais registros que isso num "desfazer" é recusado. */
const MAX_RESTORE = 10_000;

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

function validList<T>(raw: unknown, normalize: (v: unknown) => T | null): T[] {
  if (!Array.isArray(raw) || raw.length > MAX_RESTORE) throw new Error("Dados inválidos.");
  return raw.map((item) => valid(normalize(item)));
}

/* ---------- Fundos ---------- */

/**
 * Primeira compra de um fundo. Se o fundo já existe (mesmo id), só a compra é gravada:
 * é assim que uma segunda compra do mesmo ticker soma na posição.
 */
export async function addAsset(owner: unknown, asset: unknown, buy: unknown) {
  const userId = await requireUserId(owner);
  const a = valid(normalizeAsset(asset));
  const t = valid(normalizeTransaction(buy));
  if (t.assetId !== a.id || t.type !== "compra") throw new Error("Dados inválidos.");
  await db.transaction(async (tx) => {
    await tx.insert(assets).values(assetToRow(userId, a)).onConflictDoNothing({ target: [assets.userId, assets.id] });
    await tx.insert(transactions).values(transactionToRow(userId, t));
  });
}

export async function updateAsset(owner: unknown, asset: unknown) {
  const userId = await requireUserId(owner);
  const a = valid(normalizeAsset(asset));
  await db
    .update(assets)
    .set({ ticker: a.ticker, type: a.type, segment: a.segment })
    .where(and(eq(assets.userId, userId), eq(assets.id, a.id)));
}

/** Apaga o fundo; as operações e os proventos dele vão junto (cascade). */
export async function removeAsset(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db.delete(assets).where(and(eq(assets.userId, userId), eq(assets.id, valid(validId(id)))));
}

/** "Desfazer" a exclusão: devolve o fundo com as operações e os proventos dele. */
export async function restoreAsset(owner: unknown, asset: unknown, assetTransactions: unknown, assetPayouts: unknown) {
  const userId = await requireUserId(owner);
  const a = valid(normalizeAsset(asset));
  const ts = validList(assetTransactions, normalizeTransaction);
  const ps = validList(assetPayouts, normalizePayout);
  if ([...ts, ...ps].some((item) => item.assetId !== a.id)) throw new Error("Dados inválidos.");
  await db.transaction(async (tx) => {
    await tx.insert(assets).values(assetToRow(userId, a)).onConflictDoNothing();
    if (ts.length) await tx.insert(transactions).values(ts.map((t) => transactionToRow(userId, t))).onConflictDoNothing();
    if (ps.length) await tx.insert(payouts).values(ps.map((p) => payoutToRow(userId, p))).onConflictDoNothing();
  });
}

/* ---------- Operações ---------- */

export async function recordOperation(owner: unknown, operation: unknown) {
  const userId = await requireUserId(owner);
  await db.insert(transactions).values(transactionToRow(userId, valid(normalizeTransaction(operation))));
}

export async function removeTransaction(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db
    .delete(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.id, valid(validId(id)))));
}

/* ---------- Proventos ---------- */

export async function addPayout(owner: unknown, payout: unknown) {
  const userId = await requireUserId(owner);
  await db.insert(payouts).values(payoutToRow(userId, valid(normalizePayout(payout))));
}

export async function removePayout(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db.delete(payouts).where(and(eq(payouts.userId, userId), eq(payouts.id, valid(validId(id)))));
}

/* ---------- Meta ---------- */

export async function setPaperTarget(owner: unknown, target: unknown) {
  const userId = await requireUserId(owner);
  const paperTarget = normalizePaperTarget(target);
  if (paperTarget === undefined) throw new Error("Dados inválidos.");
  await db
    .insert(userSettings)
    .values({ userId, paperTarget })
    .onConflictDoUpdate({ target: userSettings.userId, set: { paperTarget } });
}
