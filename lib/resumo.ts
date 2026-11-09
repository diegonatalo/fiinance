import type { Cotacao, Fii } from "../models/fii";

export function valorPosicao(a: Fii): number {
  return a.cotas * a.precoMedio;
}

export interface Resumo {
  totalInvestido: number;
  totalCotas: number;
  ativosAtivos: number;
  /** valor a mercado (usa o custo quando falta cotação) */
  valorMercado: number;
  /** true quando todos os ativos com cotas têm cotação */
  cotacoesCompletas: boolean;
  resultado: number;
  resultadoPct: number;
}

export function calcularResumo(
  posicoes: Fii[],
  cotacoes: Record<string, Cotacao>,
): Resumo {
  const ativos = posicoes.filter((p) => p.cotas > 0);
  let totalInvestido = 0;
  let totalCotas = 0;
  let valorMercado = 0;
  let cotacoesCompletas = true;

  for (const p of ativos) {
    const custo = valorPosicao(p);
    const cot = cotacoes[p.id];
    totalInvestido += custo;
    totalCotas += p.cotas;
    if (cot) {
      valorMercado += p.cotas * cot.preco;
    } else {
      valorMercado += custo;
      cotacoesCompletas = false;
    }
  }

  const resultado = valorMercado - totalInvestido;
  return {
    totalInvestido,
    totalCotas,
    ativosAtivos: ativos.length,
    valorMercado,
    cotacoesCompletas: ativos.length > 0 && cotacoesCompletas,
    resultado,
    resultadoPct: totalInvestido > 0 ? (resultado / totalInvestido) * 100 : 0,
  };
}
