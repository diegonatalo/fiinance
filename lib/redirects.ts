import type { NextConfig } from "next";

export type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

/**
 * Redirecionamentos do projeto, lidos pelo `next.config.ts` (que é igual em todos os projetos).
 * As telas do app saíram da raiz para `/app` quando a landing entrou em `/`.
 */
export const REDIRECTS: Redirect[] = ["/carteira", "/proventos", "/calculadoras"].map((source) => ({
  source,
  destination: `/app${source}`,
  permanent: true,
}));
