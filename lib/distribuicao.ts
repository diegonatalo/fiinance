import type { Fii } from "../models/fii";

export interface Fatia {
  nome: string;
  valor: number;
}

function valorAtivo(a: Fii) {
  return a.cotas * a.precoMedio;
}

function agrupar(ativos: Fii[], chave: (a: Fii) => string): Fatia[] {
  const mapa = new Map<string, number>();
  for (const a of ativos) {
    if (a.cotas <= 0) continue;
    const k = chave(a);
    mapa.set(k, (mapa.get(k) ?? 0) + valorAtivo(a));
  }
  return Array.from(mapa.entries())
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((x, y) => y.valor - x.valor);
}

export function distribuicaoPorAtivo(ativos: Fii[]): Fatia[] {
  return agrupar(ativos, (a) => a.ticker.toUpperCase());
}

export function distribuicaoPorTipo(ativos: Fii[]): Fatia[] {
  return agrupar(ativos, (a) => (a.tipo === "papel" ? "Papel" : "Tijolo"));
}

export function distribuicaoSegmentoPapel(ativos: Fii[]): Fatia[] {
  return agrupar(
    ativos.filter((a) => a.tipo === "papel"),
    (a) => a.segmento,
  );
}

export function distribuicaoSegmentoTijolo(ativos: Fii[]): Fatia[] {
  return agrupar(
    ativos.filter((a) => a.tipo === "tijolo"),
    (a) => a.segmento,
  );
}
