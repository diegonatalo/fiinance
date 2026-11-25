// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * O lib/auth.ts de verdade, com o banco trocado pelo adaptador em memória do Better Auth:
 * confere pela API (como qualquer cliente faria) as regras de lib/auth-guard.ts.
 */

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: {} }));

const store = vi.hoisted(() => ({}) as Record<string, Record<string, unknown>[]>);
vi.mock("better-auth/adapters/drizzle", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory");
  return { drizzleAdapter: () => memoryAdapter(store) };
});

const ORIGIN = "http://localhost:3000";
const PASSWORD = "senha-de-teste-123";

let auth: typeof import("@/lib/auth").auth;
let ACCOUNT_HEADER: string;

beforeAll(async () => {
  vi.stubEnv("BETTER_AUTH_SECRET", "segredo-so-dos-testes-0123456789-abcdefghij");
  vi.stubEnv("BETTER_AUTH_URL", ORIGIN);
  ({ auth } = await import("@/lib/auth"));
  ({ ACCOUNT_HEADER } = await import("@/lib/auth-form"));
});

beforeEach(() => {
  for (const model of ["user", "session", "account", "verification", "rateLimit"]) store[model] = [];
});

const post = async (path: string, body: object, headers: Record<string, string> = {}) => {
  const response = await auth.handler(
    new Request(`${ORIGIN}/api/auth/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN, ...headers },
      body: JSON.stringify(body),
    }),
  );
  const json = (await response.json().catch(() => null)) as { code?: string } | null;
  const cookie = response.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  return { status: response.status, code: json?.code, cookie };
};

let count = 0;
const signUp = (name = "Ana") => post("sign-up/email", { name, email: `pessoa${++count}@exemplo.test`, password: PASSWORD });
const users = () => store.user as { id: string; name: string; image?: string | null }[];

describe("cadastro e edição da conta", () => {
  it("recusa nome grande demais no cadastro e não cria a conta", async () => {
    const result = await signUp("a".repeat(200_000));
    expect(result.status).toBe(400);
    expect(result.code).toBe("INVALID_NAME");
    expect(users()).toHaveLength(0);
  });

  // 400 pelo limite, ou 404 no app que desliga o /update-user: nos dois casos, nada é gravado
  it("na edição, não grava nome grande demais nem imagem", async () => {
    const { cookie } = await signUp();
    expect((await post("update-user", { name: "a".repeat(500_000) }, { cookie })).status).not.toBe(200);
    await post("update-user", { image: "x".repeat(100_000) }, { cookie });
    expect(users()[0].name).toBe("Ana");
    expect(users()[0].image ?? null).toBeNull();
  });
});

describe("excluir a conta", () => {
  const remove = (body: object, cookie: string, account = users()[0]?.id) =>
    post("delete-user", body, { cookie, [ACCOUNT_HEADER]: account });

  it("sem a senha, recusa mesmo com a sessão recém-criada", async () => {
    const { cookie } = await signUp();
    const result = await remove({}, cookie);
    expect(result.code).toBe("PASSWORD_REQUIRED");
    expect(users()).toHaveLength(1);
  });

  it("com a senha errada, recusa", async () => {
    const { cookie } = await signUp();
    expect((await remove({ password: "outra-senha-123" }, cookie)).code).toBe("INVALID_PASSWORD");
    expect(users()).toHaveLength(1);
  });

  it("com a tela de outra conta, recusa", async () => {
    const { cookie } = await signUp();
    expect((await remove({ password: PASSWORD }, cookie, "outra-conta")).code).toBe("ACCOUNT_CHANGED");
    expect(users()).toHaveLength(1);
  });

  it("com a senha certa, apaga a conta", async () => {
    const { cookie } = await signUp();
    expect((await remove({ password: PASSWORD }, cookie)).status).toBe(200);
    expect(users()).toHaveLength(0);
  });
});
