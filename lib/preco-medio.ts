export interface ResultadoPrecoMedio {
  novoPrecoMedio: number;
  totalCotas: number;
  aporte: number;
  novoTotalInvestido: number;
  variacao: number;
  variacaoPct: number;
}

export function simularPrecoMedio(
  cotasAtuais: number,
  precoAtual: number,
  novasCotas: number,
  precoNovo: number,
): ResultadoPrecoMedio | null {
  if (
    !Number.isFinite(cotasAtuais) ||
    cotasAtuais < 0 ||
    !Number.isFinite(precoAtual) ||
    precoAtual <= 0 ||
    !Number.isFinite(novasCotas) ||
    novasCotas <= 0 ||
    !Number.isFinite(precoNovo) ||
    precoNovo <= 0
  ) {
    return null;
  }
  const totalAtual = cotasAtuais * precoAtual;
  const aporte = novasCotas * precoNovo;
  const totalCotas = cotasAtuais + novasCotas;
  const novoPrecoMedio = (totalAtual + aporte) / totalCotas;
  const variacao = novoPrecoMedio - precoAtual;
  return {
    novoPrecoMedio,
    totalCotas,
    aporte,
    novoTotalInvestido: totalAtual + aporte,
    variacao,
    variacaoPct: (variacao / precoAtual) * 100,
  };
}
