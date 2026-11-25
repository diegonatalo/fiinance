import "server-only";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

/*
 * Regras das contas que valem em todo projeto com Better Auth. Sozinho, ele aceita
 * nome e e-mail de qualquer tamanho (no cadastro e no /update-user) e exclui a conta
 * sem pedir a senha quando a sessão tem menos de um dia. Aqui isso fica fechado no
 * servidor, qualquer que seja a tela ou o cliente que chamou a API.
 */

/** Maior e-mail aceito (RFC 5321). */
export const EMAIL_MAX = 254;

type UserFields = { name?: unknown; email?: unknown; image?: unknown };

/** Código do erro para os campos de uma conta criada ou editada, ou `null` se estão bons. */
export const userFieldsError = (user: UserFields, nameMax: number): string | null => {
  // na edição, o Better Auth manda `undefined` nos campos que não vieram
  if (user.name !== undefined && (typeof user.name !== "string" || !user.name.trim() || user.name.trim().length > nameMax)) {
    return "INVALID_NAME";
  }
  if (user.email !== undefined && (typeof user.email !== "string" || user.email.length > EMAIL_MAX)) {
    return "INVALID_EMAIL";
  }
  return null;
};

/**
 * Os campos da conta prontos para gravar: nome sem espaços nas pontas e sem imagem (os apps
 * não usam foto, e o campo aceitaria qualquer texto). Para `databaseHooks.user.create` e
 * `update`; recusa com 400 o que passar dos limites.
 */
export const limitUser = <T extends UserFields>(user: T, nameMax: number): T => {
  const code = userFieldsError(user, nameMax);
  if (code) throw new APIError("BAD_REQUEST", { code, message: "Dados da conta inválidos." });
  const clean = { ...user };
  if (typeof clean.name === "string") clean.name = clean.name.trim();
  if (clean.image !== undefined) clean.image = null;
  return clean;
};

type DeleteRequest = {
  password: unknown;
  /** Conta para a qual a tela foi carregada (cabeçalho), quando o app confere. */
  screenAccount?: string | null;
  sessionAccount?: string;
};

/** Código do erro para excluir a conta, ou `null` se pode seguir. Se a senha está certa, o Better Auth confere. */
export const deleteAccountError = ({ password, screenAccount, sessionAccount }: DeleteRequest): string | null => {
  if (screenAccount !== undefined && sessionAccount !== undefined && screenAccount !== sessionAccount) {
    return "ACCOUNT_CHANGED";
  }
  if (typeof password !== "string" || !password) return "PASSWORD_REQUIRED";
  return null;
};

/**
 * `hooks.before` do Better Auth: excluir a conta sempre pede a senha. Com `accountHeader`, também
 * recusa quando outra conta entrou neste navegador depois que a tela abriu (uma aba antiga).
 */
export const guardAccountRoutes = ({ accountHeader }: { accountHeader?: string } = {}) =>
  createAuthMiddleware(async (ctx) => {
    if (ctx.path !== "/delete-user") return;
    let screenAccount: string | null | undefined;
    let sessionAccount: string | undefined;
    if (accountHeader) {
      const current = await getSessionFromCtx(ctx);
      screenAccount = ctx.headers?.get(accountHeader) ?? null;
      sessionAccount = current?.user.id;
    }
    const body = ctx.body as { password?: unknown } | undefined;
    const code = deleteAccountError({ password: body?.password, screenAccount, sessionAccount });
    if (code === "ACCOUNT_CHANGED") throw new APIError("CONFLICT", { code, message: "Account changed" });
    if (code) throw new APIError("BAD_REQUEST", { code, message: "Password required" });
  });
