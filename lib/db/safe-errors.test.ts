// @vitest-environment node
import { inspect } from "node:util";
import { drizzle } from "drizzle-orm/pg-proxy";
import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { DatabaseError, hideQueryValues, toSafeError } from "@/lib/db/safe-errors";

const SECRET = "hérnia-de-disco";

// what pg throws: the value is in the message and in the detail
const driverError = () =>
  Object.assign(new Error(`invalid input syntax for type integer: "${SECRET}"`), {
    code: "22P02",
    constraint: "records_value_check",
    detail: `Failing row contains (${SECRET}).`,
  });

const everything = (error: unknown) => inspect(error, { depth: 10, showHidden: true });

describe("hideQueryValues", () => {
  it("tira os valores do erro de uma consulta de verdade do Drizzle", async () => {
    hideQueryValues();
    hideQueryValues(); // chamar de novo não embrulha duas vezes
    const db = drizzle(async () => {
      throw driverError();
    });

    const error = await db.execute(sql`insert into "records" values (${SECRET})`).then(
      () => null,
      (failure: unknown) => failure,
    );

    expect(error).toBeInstanceOf(DatabaseError);
    expect(everything(error)).not.toContain(SECRET);
    expect((error as Error).message).toBe("Database query failed (22P02, table records, constraint records_value_check)");
    expect(error).toMatchObject({ code: "22P02", cause: { code: "22P02" } });
  });
});

describe("toSafeError", () => {
  it("acha o código nas causas sem copiar as mensagens", () => {
    const wrapped = new Error(`Failed query\nparams: ${SECRET}`, { cause: driverError() });
    const safe = toSafeError(wrapped);
    expect(safe.code).toBe("22P02");
    expect(everything(safe)).not.toContain(SECRET);
  });

  it("acha o código de rede do driver do Neon", () => {
    const failure = Object.assign(new Error("fetch failed"), { sourceError: { cause: { code: "ECONNRESET" } } });
    expect(toSafeError(failure).code).toBe("ECONNRESET");
  });

  it("sem código, ainda não mostra nada da consulta", () => {
    const safe = toSafeError(new Error(SECRET), `select '${SECRET}'`);
    expect(safe.message).toBe("Database query failed");
    expect(everything(safe)).not.toContain(SECRET);
  });

  it("não aceita texto livre no lugar do código", () => {
    expect(toSafeError({ code: SECRET }).code).toBeUndefined();
  });

  it("um erro já limpo passa como está", () => {
    const safe = new DatabaseError("23505");
    expect(toSafeError(safe)).toBe(safe);
  });
});
