import { describe, expect, it } from "vitest";
import { assertDevDatabase, isVercelBuild } from "@/lib/dev-database";

const REMOTE = "postgres://user:s3cret@ep-example.sa-east-1.aws.neon.tech";
const check = (url: string) => () => assertDevDatabase({ DATABASE_URL: url });

describe("assertDevDatabase", () => {
  it.each([
    `${REMOTE}/app_dev`,
    `${REMOTE}/app_dev_test?sslmode=require`,
    "postgres://app:app@localhost:5432/app",
    "postgres://app:app@127.0.0.1:5432/app",
    "postgres://app:app@[::1]:5432/app",
  ])("aceita %s", (url) => {
    expect(check(url)).not.toThrow();
  });

  it.each([
    `${REMOTE}/neondb?sslmode=require`,
    `${REMOTE}/app_test`,
    `${REMOTE}/app_dev_old`,
    `${REMOTE}/app_development`,
    REMOTE,
    `${REMOTE}/neondb?database=app_dev`,
    `${REMOTE}/neondb?host=localhost`,
    `postgres://app:app@localhost/neondb?host=ep-example.neon.tech`,
    `${REMOTE}/$DATABASE_NAME`,
    "não é uma URL",
  ])("recusa %s", (url) => {
    expect(check(url)).toThrow("Banco recusado");
  });

  it("recusa se só a URL das migrações estiver errada", () => {
    const env = { DATABASE_URL: `${REMOTE}/app_dev`, DATABASE_URL_UNPOOLED: `${REMOTE}/neondb` };
    expect(() => assertDevDatabase(env)).toThrow("DATABASE_URL_UNPOOLED");
  });

  it("confere a variável que for pedida", () => {
    const env = { TEST_DATABASE_URL: `${REMOTE}/app_test` };
    expect(() => assertDevDatabase(env, ["TEST_DATABASE_URL"])).toThrow("TEST_DATABASE_URL");
  });

  it("sem banco configurado, não atrapalha", () => {
    expect(() => assertDevDatabase({})).not.toThrow();
    expect(() => assertDevDatabase({ PGHOST: "localhost" })).not.toThrow();
  });

  it("sem URL, confere o PGHOST", () => {
    expect(() => assertDevDatabase({ PGHOST: "ep-example.neon.tech" })).toThrow("PGHOST");
  });

  it("o erro não mostra a URL nem a senha", () => {
    expect(check(`${REMOTE}/neondb`)).toThrow(expect.not.stringContaining("s3cret"));
    expect(check(`${REMOTE}/neondb`)).toThrow(expect.not.stringContaining("ep-example"));
  });
});

describe("isVercelBuild", () => {
  it("só o build da Vercel fica de fora da trava", () => {
    expect(isVercelBuild({ VERCEL: "1" }, false)).toBe(true);
    expect(isVercelBuild({}, false)).toBe(false);
  });

  it("um VERCEL=1 vindo do vercel env pull não conta", () => {
    expect(isVercelBuild({ VERCEL: "1" }, true)).toBe(false);
  });
});
