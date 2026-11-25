import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { deleteAccountError, EMAIL_MAX, limitUser, userFieldsError } from "@/lib/auth-guard";

describe("userFieldsError", () => {
  it("aceita nome e e-mail dentro dos limites", () => {
    expect(userFieldsError({ name: "Ana", email: "ana@exemplo.com" }, 60)).toBeNull();
  });

  it("recusa nome vazio, só com espaços, grande demais ou que não é texto", () => {
    for (const name of ["", "   ", "a".repeat(61), 42, null]) {
      expect(userFieldsError({ name }, 60)).toBe("INVALID_NAME");
    }
  });

  it("conta o tamanho do nome sem os espaços das pontas", () => {
    expect(userFieldsError({ name: `  ${"a".repeat(60)}  ` }, 60)).toBeNull();
  });

  it("recusa e-mail grande demais", () => {
    expect(userFieldsError({ email: `${"a".repeat(EMAIL_MAX)}@x.com` }, 60)).toBe("INVALID_EMAIL");
  });

  it("não confere o que não veio (o Better Auth manda undefined na edição)", () => {
    expect(userFieldsError({}, 60)).toBeNull();
    expect(userFieldsError({ name: undefined, email: undefined }, 60)).toBeNull();
  });
});

describe("limitUser", () => {
  it("tira os espaços do nome e descarta a imagem", () => {
    expect(limitUser({ name: " Ana ", image: "x".repeat(100_000) }, 60)).toEqual({ name: "Ana", image: null });
  });

  it("não cria nem troca campos que não vieram", () => {
    expect(limitUser({ name: "Ana" }, 60)).toEqual({ name: "Ana" });
    expect(limitUser({ image: undefined }, 60)).toEqual({ image: undefined });
  });

  it("lança erro 400 com o código quando o nome passa do limite", () => {
    expect(() => limitUser({ name: "a".repeat(500_000) }, 60)).toThrow(
      expect.objectContaining({ statusCode: 400, body: expect.objectContaining({ code: "INVALID_NAME" }) }),
    );
  });
});

describe("deleteAccountError", () => {
  it("pede a senha", () => {
    expect(deleteAccountError({ password: undefined })).toBe("PASSWORD_REQUIRED");
    expect(deleteAccountError({ password: "" })).toBe("PASSWORD_REQUIRED");
  });

  it("segue com a senha (o Better Auth confere se está certa)", () => {
    expect(deleteAccountError({ password: "senha-123" })).toBeNull();
  });

  it("recusa quando outra conta entrou depois que a tela abriu", () => {
    expect(deleteAccountError({ password: "senha-123", screenAccount: "ana", sessionAccount: "bia" })).toBe(
      "ACCOUNT_CHANGED",
    );
    expect(deleteAccountError({ password: "senha-123", screenAccount: null, sessionAccount: "bia" })).toBe(
      "ACCOUNT_CHANGED",
    );
  });

  it("aceita a tela da própria conta", () => {
    expect(deleteAccountError({ password: "senha-123", screenAccount: "ana", sessionAccount: "ana" })).toBeNull();
  });
});
