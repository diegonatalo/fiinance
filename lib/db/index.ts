import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { assertDevDatabase } from "@/lib/dev-database";
import { hideQueryValues } from "./safe-errors";
import * as schema from "./schema";

// o erro de uma consulta nunca leva os valores dela para o log
hideQueryValues();

// só no `next dev`: a trava não roda no site publicado
if (process.env.NODE_ENV === "development") assertDevDatabase(process.env);

/**
 * One pool per server instance. `DATABASE_URL` is the pooled Neon URL in
 * production and a local Postgres in CI; the pool only connects on the first query.
 */
const globalForDb = globalThis as unknown as { dbPool?: Pool };

const createPool = () => {
  // idle connections close quickly, before the function is suspended (Vercel and Neon guidance)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 5000 });
  // An idle connection the server drops (Neon scaling to zero, a restart) emits "error" on the
  // pool; without a listener it is an uncaught exception. The pool replaces the client by itself.
  pool.on("error", (error: Error & { code?: string }) => {
    console.error("Postgres idle connection lost", error.code ?? error.message);
  });
  // on Vercel, closes idle connections before the instance is suspended; elsewhere it does nothing
  attachDatabasePool(pool);
  return pool;
};

const pool = globalForDb.dbPool ?? createPool();

// in dev, hot reloads would open a new pool on every edit
if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;

export const db = drizzle(pool, { schema });

export type Db = typeof db;
