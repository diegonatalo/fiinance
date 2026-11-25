import {
  bigint,
  boolean,
  date,
  doublePrecision,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { FiiType, OperationType, Segment } from "@/types/fii";

/* ---------- Better Auth ----------
 * Tables and columns follow the core schema Better Auth expects.
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/**
 * Tentativas de login e cadastro por IP. No banco, e não na memória, para o
 * limite valer entre todas as instâncias do servidor na Vercel.
 */
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

/* ---------- FIInance ----------
 * Ids are generated in the browser (`uid`), so every key is (user_id, id):
 * one person can never write over a row of another, whatever id they send.
 * Money is stored in cents (integer).
 */

const owner = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const assets = pgTable(
  "assets",
  {
    userId: owner(),
    id: text("id").notNull(),
    ticker: text("ticker").notNull(),
    type: text("type").$type<FiiType>().notNull(),
    segment: text("segment").$type<Segment>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    // um ticker por pessoa: a segunda compra soma na posição do fundo que já existe
    uniqueIndex("assets_user_ticker_idx").on(t.userId, t.ticker),
  ],
);

/** Compras e vendas. A posição de cada fundo (cotas e preço médio) é calculada a partir delas. */
export const transactions = pgTable(
  "transactions",
  {
    userId: owner(),
    id: text("id").notNull(),
    assetId: text("asset_id").notNull(),
    type: text("type").$type<OperationType>().notNull(),
    /** dia da operação (aaaa-mm-dd), sem horário nem fuso */
    date: date("date", { mode: "string" }).notNull(),
    shares: integer("shares").notNull(),
    priceCents: integer("price_cents").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    // excluir o fundo apaga as operações dele; e só aponta para um fundo da mesma pessoa
    foreignKey({ columns: [t.userId, t.assetId], foreignColumns: [assets.userId, assets.id] }).onDelete("cascade"),
    index("transactions_asset_idx").on(t.userId, t.assetId),
  ],
);

/** Proventos recebidos. Guarda o total recebido; o valor por cota sai de total ÷ cotas. */
export const payouts = pgTable(
  "payouts",
  {
    userId: owner(),
    id: text("id").notNull(),
    assetId: text("asset_id").notNull(),
    /** dia do pagamento (aaaa-mm-dd) */
    date: date("date", { mode: "string" }).notNull(),
    shares: integer("shares").notNull(),
    totalCents: integer("total_cents").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    foreignKey({ columns: [t.userId, t.assetId], foreignColumns: [assets.userId, assets.id] }).onDelete("cascade"),
    index("payouts_asset_idx").on(t.userId, t.assetId),
  ],
);

/** Uma linha por pessoa, criada na primeira vez que ela define a meta. */
export const userSettings = pgTable("user_settings", {
  userId: owner().primaryKey(),
  /** meta de alocação em papel, de 0 a 100 (o restante vai para tijolo) */
  paperTarget: doublePrecision("paper_target"),
});
