import { mesDe } from "./data";
import type { Transacao } from "../models/fii";

export interface PontoEvolucao {
  mes: string;
  /** compras − vendas acumuladas até o fim do mês */
  aportado: number;
}

export function evolucaoAportes(transacoes: Transacao[]): PontoEvolucao[] {
  const porMes = new Map<string, number>();
  for (const t of transacoes) {
    const valor = t.cotas * t.preco * (t.tipo === "compra" ? 1 : -1);
    const mes = mesDe(t.data);
    porMes.set(mes, (porMes.get(mes) ?? 0) + valor);
  }
  let acumulado = 0;
  return Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, delta]) => {
      acumulado += delta;
      return { mes, aportado: acumulado };
    });
}
