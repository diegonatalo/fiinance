/** Rotas de conta. O app mora em `/app`; `/` é a landing. */
export const paths = {
  home: "/app",
  account: "/app/conta",
  signIn: "/entrar",
  signUp: "/cadastro",
} as const;

/** Parâmetro com a página para onde voltar depois de entrar. */
export const RETURN_PARAM = "de";

/** Link de entrar que traz a pessoa de volta para `from` depois. */
export const signInPath = (from?: string) =>
  from && from !== paths.home ? `${paths.signIn}?${RETURN_PARAM}=${encodeURIComponent(from)}` : paths.signIn;
