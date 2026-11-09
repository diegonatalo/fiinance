export interface Alocacao {
  papelPct: number;
  tijoloPct: number;
}

export function alocacaoAtual(papel: number, tijolo: number): Alocacao {
  const total = papel + tijolo;
  return {
    papelPct: total > 0 ? (papel / total) * 100 : 0,
    tijoloPct: total > 0 ? (tijolo / total) * 100 : 0,
  };
}

export interface Sugestao {
  classe: "papel" | "tijolo";
  /** aporte necessário, só em compras, para atingir a meta */
  aporte: number;
}

/**
 * Menor aporte em uma única classe que leva a carteira à meta.
 * Resolve (A + x) / (T + x) = alvo  =>  x = (alvo·T − A) / (1 − alvo).
 */
export function sugerirAporte(
  papel: number,
  tijolo: number,
  metaPapel: number,
): Sugestao | null {
  const total = papel + tijolo;
  if (total <= 0) return null;
  const alvoPapel = metaPapel / 100;
  const alvoTijolo = 1 - alvoPapel;

  if (papel / total < alvoPapel && alvoPapel < 1) {
    const aporte = (alvoPapel * total - papel) / (1 - alvoPapel);
    return aporte > 0.005 ? { classe: "papel", aporte } : null;
  }
  if (tijolo / total < alvoTijolo && alvoTijolo < 1) {
    const aporte = (alvoTijolo * total - tijolo) / (1 - alvoTijolo);
    return aporte > 0.005 ? { classe: "tijolo", aporte } : null;
  }
  return null;
}
