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
import type { BrickSegment, FiiType, RiskProfile } from "@/types/fii";

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

/**
 * Cada fundo com a posição que a pessoa digitou. Os padrões das colunas só
 * existem para a versão anterior do app continuar gravando durante o deploy.
 */
export const assets = pgTable(
  "assets",
  {
    userId: owner(),
    id: text("id").notNull(),
    ticker: text("ticker").notNull(),
    type: text("type").$type<FiiType>().notNull(),
    /** só tijolo */
    segment: text("segment").$type<BrickSegment>(),
    /** só papel */
    risk: text("risk").$type<RiskProfile>(),
    shares: integer("shares").notNull().default(0),
    averagePriceCents: integer("average_price_cents").notNull().default(0),
    /** último rendimento por cota em centésimos de centavo (R$ 0,0825 = 825), para fundos de cota barata */
    lastDividendHundredthCents: integer("last_dividend_hundredth_cents").notNull().default(0),
    rating: integer("rating").notNull().default(5),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    // um ticker por pessoa
    uniqueIndex("assets_user_ticker_idx").on(t.userId, t.ticker),
  ],
);

/*
 * As tabelas abaixo são da versão anterior (posição calculada pelas operações,
 * proventos recebidos e meta papel × tijolo). O app não as usa mais; saem num
 * próximo PR, depois que este estiver em produção.
 */

/** @deprecated não usada; a posição fica em `assets`. */
export const transactions = pgTable(
  "transactions",
  {
    userId: owner(),
    id: text("id").notNull(),
    assetId: text("asset_id").notNull(),
    type: text("type").$type<"compra" | "venda">().notNull(),
    date: date("date", { mode: "string" }).notNull(),
    shares: integer("shares").notNull(),
    priceCents: integer("price_cents").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    foreignKey({ columns: [t.userId, t.assetId], foreignColumns: [assets.userId, assets.id] }).onDelete("cascade"),
    index("transactions_asset_idx").on(t.userId, t.assetId),
  ],
);

/** @deprecated não usada; o último rendimento fica em `assets`. */
export const payouts = pgTable(
  "payouts",
  {
    userId: owner(),
    id: text("id").notNull(),
    assetId: text("asset_id").notNull(),
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

/** @deprecated não usada; a meta vem da nota de cada fundo. */
export const userSettings = pgTable("user_settings", {
  userId: owner().primaryKey(),
  paperTarget: doublePrecision("paper_target"),
});
