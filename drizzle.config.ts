import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";
import { assertDevDatabase, isVercelBuild } from "./lib/dev-database";

// Lê o .env.local, para `pnpm db:migrate` usar o mesmo banco do `pnpm dev`.
// No CI as variáveis já vêm do ambiente.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
// trava: fora do build da Vercel, só migra banco de desenvolvimento
if (!isVercelBuild(process.env, existsSync(".env.local") || existsSync(".env"))) assertDevDatabase(process.env);

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // migrações rodam fora do pgbouncer do Neon
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
