import type { Dados } from "../models/fii";

export function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function dadosParaJson(dados: Dados): string {
  return JSON.stringify(dados, null, 2);
}

export function transacoesParaCsv(dados: Dados): string {
  const tickers = new Map(dados.ativos.map((a) => [a.id, a.ticker]));
  const linhas = dados.transacoes
    .toSorted((a, b) => a.data.localeCompare(b.data))
    .map((t) =>
      [
        t.data,
        tickers.get(t.ativoId) ?? "",
        t.tipo,
        t.cotas,
        t.preco.toFixed(2),
        (t.cotas * t.preco).toFixed(2),
      ].join(";"),
    );
  return ["data;ticker;tipo;cotas;preco;total", ...linhas].join("\n");
}
