import { mesDe } from "./data";
import type { Provento } from "../models/fii";

export function totalProvento(p: Provento): number {
  return p.valorPorCota * p.cotas;
}

export interface MesProvento {
  mes: string;
  total: number;
}

/** Últimos `n` meses terminando em `fim` (yyyy-mm); meses sem proventos valem 0. */
export function ultimosMeses(
  proventos: Provento[],
  fim: string,
  n = 12,
): MesProvento[] {
  const porMes = new Map<string, number>();
  for (const p of proventos) {
    const mes = mesDe(p.data);
    porMes.set(mes, (porMes.get(mes) ?? 0) + totalProvento(p));
  }
  const [ano, mes] = fim.split("-").map(Number);
  const serie: MesProvento[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    serie.push({ mes: chave, total: porMes.get(chave) ?? 0 });
  }
  return serie;
}

export interface ResumoProventos {
  total12m: number;
  mediaMensal: number;
  /** proventos dos últimos 12 meses ÷ total investido, em % */
  dyOnCost: number;
}

export function resumirProventos(
  proventos: Provento[],
  totalInvestido: number,
  mesAtual: string,
): ResumoProventos {
  const total12m = ultimosMeses(proventos, mesAtual, 12).reduce(
    (acc, m) => acc + m.total,
    0,
  );
  return {
    total12m,
    mediaMensal: total12m / 12,
    dyOnCost: totalInvestido > 0 ? (total12m / totalInvestido) * 100 : 0,
  };
}
