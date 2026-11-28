import type { NextConfig } from "next";

export type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

/**
 * Redirecionamentos do projeto, lidos pelo `next.config.ts` (que é igual em todos os projetos).
 * As telas do app saíram da raiz para `/app` quando a landing entrou em `/`, e a página de
 * proventos virou os proventos esperados do painel.
 */
export const REDIRECTS: Redirect[] = [
  ...["/carteira", "/calculadoras"].map((source) => ({ source, destination: `/app${source}`, permanent: true })),
  { source: "/proventos", destination: "/app", permanent: true },
  { source: "/app/proventos", destination: "/app", permanent: true },
];
