import { formatMonth, monthOf } from "./date";
import type { Transaction } from "@/types/fii";

export type EvolutionPoint = {
  month: string;
  /** compras − vendas acumuladas até o fim do mês */
  contributed: number;
};

export function contributionsEvolution(transactions: Transaction[]): EvolutionPoint[] {
  const byMonth = new Map<string, number>();
  for (const t of transactions) {
    const amount = t.shares * t.price * (t.type === "compra" ? 1 : -1);
    const month = monthOf(t.date);
    byMonth.set(month, (byMonth.get(month) ?? 0) + amount);
  }
  let accumulated = 0;
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, delta]) => {
      accumulated += delta;
      return { month, contributed: accumulated };
    });
}

/** Área do gráfico (viewBox 800 × 250): eixo x de 20 a 780, eixo y de 220 (zero) a 20 (topo). */
const LEFT = 20;
const RIGHT = 780;
const BOTTOM = 220;
const HEIGHT = 200;
const MAX_LABELS = 10;

export type EvolutionChart = {
  /** linha do valor investido */
  invested: string;
  /** área sob a linha */
  area: string;
  /** o último mês, destacado com um ponto */
  last: { x: number; y: number };
  /** altura (y) das linhas de grade, do zero ao topo */
  grid: number[];
  /** meses no eixo x, com a posição em % da largura */
  labels: { left: number; text: string }[];
};

/** Arredonda para cima num valor "redondo" (1, 2, 2,5 ou 5 × 10ⁿ), para a grade. */
export function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

const nextMonth = (month: string) => {
  const [year, m] = month.split("-").map(Number);
  return m === 12 ? `${year + 1}-01` : `${year}-${String(m + 1).padStart(2, "0")}`;
};

/**
 * Um ponto por mês, do primeiro até `currentMonth` (ou o último com operação):
 * mês sem operação repete o investido do anterior, para o eixo seguir o tempo.
 */
export function fillMonths(points: EvolutionPoint[], currentMonth: string): EvolutionPoint[] {
  if (points.length === 0) return [];
  const byMonth = new Map(points.map((p) => [p.month, p.contributed]));
  const end = currentMonth && currentMonth > points.at(-1)!.month ? currentMonth : points.at(-1)!.month;
  const filled: EvolutionPoint[] = [];
  let value = 0;
  for (let month = points[0].month; month <= end; month = nextMonth(month)) {
    value = byMonth.get(month) ?? value;
    filled.push({ month, contributed: value });
  }
  return filled;
}

/**
 * Geometria do gráfico de evolução: o investido acumulado mês a mês.
 * `currentMonth` (aaaa-mm) estende a linha até o mês atual.
 */
export function evolutionChart(points: EvolutionPoint[], currentMonth: string): EvolutionChart | null {
  const series = fillMonths(points, currentMonth);
  if (series.length < 2) return null;

  const max = niceCeil(Math.max(...series.map((p) => p.contributed)) * 1.08);
  const x = (i: number) => LEFT + ((RIGHT - LEFT) * i) / (series.length - 1);
  const y = (v: number) => Math.round((BOTTOM - (Math.max(v, 0) / max) * HEIGHT) * 100) / 100;

  const invested = series.map((p, i) => `${i === 0 ? "M" : "L"}${Math.round(x(i))} ${y(p.contributed)}`).join(" ");
  const spansYears = series[0].month.slice(0, 4) !== series.at(-1)!.month.slice(0, 4);
  const step = Math.ceil(series.length / MAX_LABELS);
  const labels = series
    .map((p, i) => ({ i, p }))
    .filter(({ i }) => (series.length - 1 - i) % step === 0)
    .map(({ i, p }) => ({
      left: (x(i) / 800) * 100,
      text: spansYears ? formatMonth(p.month) : formatMonth(p.month).slice(0, 3),
    }));

  const end = { x: Math.round(x(series.length - 1)), y: y(series.at(-1)!.contributed) };
  return {
    invested,
    area: `${invested} L${end.x} ${BOTTOM} L${LEFT} ${BOTTOM} Z`,
    last: end,
    grid: [0, 0.25, 0.5, 0.75, 1].map((f) => BOTTOM - f * HEIGHT),
    labels,
  };
}
