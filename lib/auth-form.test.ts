import { describe, expect, it } from "vitest";
import {
  PASSWORD_MIN,
  authErrorMessage,
  deleteErrorMessage,
  hasErrors,
  safeRedirect,
  validateSignIn,
  validateSignUp,
} from "@/lib/auth-form";

describe("validateSignIn", () => {
  it("pede e-mail e senha", () => {
    expect(validateSignIn({ email: "", password: "" })).toEqual({
      email: "Informe seu e-mail.",
      password: "Informe sua senha.",
    });
  });

  it("recusa e-mail sem formato de e-mail", () => {
    expect(validateSignIn({ email: "diego", password: "x" }).email).toBe(
      "Esse e-mail não parece válido.",
    );
  });

  it("aceita e-mail com espaços nas pontas", () => {
    expect(hasErrors(validateSignIn({ email: " a@b.co ", password: "x" }))).toBe(false);
  });
});

describe("validateSignUp", () => {
  const ok = { name: "Ana", email: "ana@exemplo.com", password: "12345678" };

  it("aceita um cadastro completo", () => {
    expect(validateSignUp(ok)).toEqual({});
  });

  it("pede nome, que não pode ser só espaços", () => {
    expect(validateSignUp({ ...ok, name: "   " }).name).toBe("Informe seu nome.");
  });

  it("limita o tamanho do nome", () => {
    expect(validateSignUp({ ...ok, name: "a".repeat(61) }).name).toMatch(/no máximo/);
  });

  it(`pede pelo menos ${PASSWORD_MIN} caracteres na senha`, () => {
    expect(validateSignUp({ ...ok, password: "1234567" }).password).toMatch(/pelo menos 8/);
    expect(validateSignUp({ ...ok, password: "a".repeat(129) }).password).toMatch(/no máximo/);
  });
});

describe("authErrorMessage", () => {
  it("traduz os erros do Better Auth", () => {
    expect(authErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe("E-mail ou senha incorretos.");
    expect(authErrorMessage({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" })).toMatch(/Já existe/);
    expect(authErrorMessage({ code: "USER_ALREADY_EXISTS" })).toMatch(/Já existe/);
  });

  it("muitas tentativas vira um pedido para esperar", () => {
    expect(authErrorMessage({ status: 429 })).toMatch(/Espere um minuto/);
  });

  it("erro desconhecido ou sem resposta tem uma mensagem genérica", () => {
    expect(authErrorMessage({ code: "OUTRO" })).toMatch(/Não foi possível/);
    expect(authErrorMessage(null)).toMatch(/Não foi possível/);
  });
});

describe("safeRedirect", () => {
  it("volta para a página do app pedida", () => {
    expect(safeRedirect("/app/historico")).toBe("/app/historico");
    expect(safeRedirect("/app/carteira?x=1")).toBe("/app/carteira?x=1");
  });

  it("sem destino ou com destino fora do app, vai para o início do app", () => {
    expect(safeRedirect(null)).toBe("/app");
    expect(safeRedirect("")).toBe("/app");
    expect(safeRedirect("https://outro.site/app")).toBe("/app");
    expect(safeRedirect("//outro.site")).toBe("/app");
    expect(safeRedirect("/privacidade")).toBe("/app");
  });
});

describe("deleteErrorMessage", () => {
  it("explica cada recusa ao excluir a conta", () => {
    expect(deleteErrorMessage("ACCOUNT_CHANGED")).toMatch(/Outra conta entrou/);
    expect(deleteErrorMessage("INVALID_PASSWORD")).toMatch(/Senha incorreta/);
    expect(deleteErrorMessage("PASSWORD_REQUIRED")).toMatch(/Digite sua senha/);
    expect(deleteErrorMessage(undefined)).toMatch(/Não foi possível excluir/);
  });
});
