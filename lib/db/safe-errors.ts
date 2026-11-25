import { PgPreparedQuery } from "drizzle-orm/pg-core";

/*
 * Drizzle puts the query's values in the error message, and Postgres repeats them
 * in its message and detail. Whoever logs the error (Next, Better Auth, our code)
 * would log names, e-mails, session tokens and health data. Here the error is
 * replaced where it is born, keeping only what identifies the failure.
 */

/** A failed query, without any of its values. `code` is the Postgres or network code. */
export class DatabaseError extends Error {
  override name = "DatabaseError";
  readonly code: string | undefined;

  constructor(code?: string, table?: string, constraint?: string) {
    const details = [code, table && `table ${table}`, constraint && `constraint ${constraint}`].filter(Boolean);
    super(`Database query failed${details.length ? ` (${details.join(", ")})` : ""}`, code ? { cause: { code } } : undefined);
    this.code = code;
  }
}

const IDENTIFIER = /^\w+$/;

/** The code and constraint from the error or its causes; nothing else is copied. */
export const toSafeError = (error: unknown, query = ""): DatabaseError => {
  if (error instanceof DatabaseError) return error;
  let code: string | undefined;
  let constraint: string | undefined;
  let current = error;
  for (let depth = 0; depth < 6 && typeof current === "object" && current !== null; depth++) {
    const entry = current as { code?: unknown; constraint?: unknown; cause?: unknown; sourceError?: unknown };
    if (typeof entry.code === "string" && IDENTIFIER.test(entry.code)) code ??= entry.code;
    if (typeof entry.constraint === "string" && IDENTIFIER.test(entry.constraint)) constraint ??= entry.constraint;
    current = entry.cause ?? entry.sourceError;
  }
  // only the table name: the SQL itself can have values written into it
  const table = /^\s*(?:insert into|update|delete from|select\b.*?\bfrom) "(\w+)"/i.exec(query)?.[1];
  return new DatabaseError(code, table, constraint);
};

type Run = (this: unknown, query: string, params: unknown[], run: () => Promise<unknown>) => Promise<unknown>;

const PATCHED = Symbol.for("safe-query-errors");

/**
 * Every query of Drizzle's Postgres drivers goes through `queryWithCache`, which is
 * internal: safe-errors.test.ts fails if an update renames it. The exception is
 * `batch` (neon-http), which needs `toSafeError` where it is called.
 */
export const hideQueryValues = () => {
  const prototype = PgPreparedQuery.prototype as unknown as { queryWithCache?: Run; [PATCHED]?: true };
  if (prototype[PATCHED]) return;
  const original = prototype.queryWithCache;
  if (!original) throw new Error("Drizzle changed: lib/db/safe-errors.ts needs an update.");
  prototype.queryWithCache = async function (query, params, run) {
    try {
      return await original.call(this, query, params, run);
    } catch (error) {
      throw toSafeError(error, query);
    }
  };
  prototype[PATCHED] = true;
};
