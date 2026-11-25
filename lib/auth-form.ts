/**
 * Validação dos formulários de entrar e criar conta, e tradução dos erros do
 * Better Auth. Pura: as telas mostram as mensagens, o servidor valida de novo.
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const NAME_MAX = 60;

/** Cabeçalho com a conta da tela, exigido para excluir a conta. */
export const ACCOUNT_HEADER = "x-account-id";

export type SignInInput = { email: string; password: string };
export type SignUpInput = SignInInput & { name: string };

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailError = (email: string) => {
  if (!email.trim()) return "Informe seu e-mail.";
  if (!EMAIL_RE.test(email.trim())) return "Esse e-mail não parece válido.";
  return undefined;
};

const compact = <T>(errors: FieldErrors<T>): FieldErrors<T> =>
  Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message),
  ) as FieldErrors<T>;

export function validateSignIn(input: SignInInput): FieldErrors<SignInInput> {
  return compact({
    email: emailError(input.email),
    password: input.password ? undefined : "Informe sua senha.",
  });
}

export function validateSignUp(input: SignUpInput): FieldErrors<SignUpInput> {
  const name = input.name.trim();
  let password: string | undefined;
  if (input.password.length < PASSWORD_MIN)
    password = `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`;
  else if (input.password.length > PASSWORD_MAX)
    password = `A senha pode ter no máximo ${PASSWORD_MAX} caracteres.`;
  return compact({
    name: !name
      ? "Informe seu nome."
      : name.length > NAME_MAX
        ? `O nome pode ter no máximo ${NAME_MAX} caracteres.`
        : undefined,
    email: emailError(input.email),
    password,
  });
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;

type AuthError = { code?: string; status?: number } | null | undefined;

/** Mensagem em português para um erro devolvido pelo Better Auth. */
export function authErrorMessage(error: AuthError): string {
  if (error?.status === 429)
    return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
  switch (error?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-mail ou senha incorretos.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Já existe uma conta com esse e-mail. Tente entrar.";
    case "INVALID_EMAIL":
      return "Esse e-mail não parece válido.";
    case "PASSWORD_TOO_SHORT":
      return `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`;
    case "PASSWORD_TOO_LONG":
      return `A senha pode ter no máximo ${PASSWORD_MAX} caracteres.`;
    default:
      return "Não foi possível continuar. Verifique sua conexão e tente de novo.";
  }
}

/** Mensagem para um erro ao excluir a conta (códigos do Better Auth e de lib/auth-guard.ts). */
export function deleteErrorMessage(code: string | undefined): string {
  switch (code) {
    case "ACCOUNT_CHANGED":
      return "Outra conta entrou neste navegador. Entre com a sua para poder excluí-la.";
    case "INVALID_PASSWORD":
      return "Senha incorreta. A conta não foi excluída.";
    case "PASSWORD_REQUIRED":
      return "Digite sua senha para excluir a conta.";
    default:
      return "Não foi possível excluir a conta. Tente de novo.";
  }
}

/**
 * Para onde voltar depois de entrar. Só aceita caminhos do próprio app, para que
 * um link `?de=https://...` não leve a pessoa a outro site.
 */
export function safeRedirect(target: string | null | undefined): string {
  if (!target || !target.startsWith("/app") || target.startsWith("//")) return "/app";
  return target;
}
