import type { Ativo, Fii, Transacao } from "../models/fii";

/**
 * Consolida as transações de um ativo em cotas e preço médio.
 * Compras recalculam o preço médio; vendas reduzem as cotas mantendo o preço médio.
 */
export function calcularPosicao(ativo: Ativo, transacoes: Transacao[]): Fii {
  const ordenadas = transacoes
    .filter((t) => t.ativoId === ativo.id)
    .toSorted((a, b) => a.data.localeCompare(b.data));

  let cotas = 0;
  let custo = 0;
  for (const t of ordenadas) {
    if (t.tipo === "compra") {
      cotas += t.cotas;
      custo += t.cotas * t.preco;
    } else {
      const vendidas = Math.min(t.cotas, cotas);
      if (cotas > 0) custo -= (custo / cotas) * vendidas;
      cotas -= vendidas;
    }
  }

  return { ...ativo, cotas, precoMedio: cotas > 0 ? custo / cotas : 0 };
}

export function calcularPosicoes(
  ativos: Ativo[],
  transacoes: Transacao[],
): Fii[] {
  return ativos.map((a) => calcularPosicao(a, transacoes));
}

/** Cotas em carteira numa data, considerando só operações até ela. */
export function cotasEm(
  ativoId: string,
  data: string,
  transacoes: Transacao[],
): number {
  return transacoes
    .filter((t) => t.ativoId === ativoId && t.data <= data)
    .reduce((acc, t) => acc + (t.tipo === "compra" ? t.cotas : -t.cotas), 0);
}
