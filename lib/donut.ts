import type { Slice } from "./distribution";

export type DonutArc = Slice & {
  /** fatia do total, em % */
  pct: number;
  /** comprimento do traço no círculo */
  length: number;
  /** onde o traço começa, a partir do topo, no sentido horário */
  offset: number;
};

/** Espaço entre as fatias, no mesmo comprimento do círculo. */
const GAP = 2;

/**
 * As fatias de um donut desenhado com `stroke-dasharray` num círculo de
 * comprimento `circumference`. Com mais de uma fatia, cada uma perde `GAP` para
 * o respiro entre elas (sem passar de metade dela).
 */
export function donutArcs(slices: Slice[], circumference: number): DonutArc[] {
  const total = slices.reduce((acc, s) => acc + s.amount, 0);
  if (total <= 0) return [];
  const gap = slices.length > 1 ? GAP : 0;
  let start = 0;
  return slices.map((s) => {
    const full = (s.amount / total) * circumference;
    const arc = { ...s, pct: (s.amount / total) * 100, length: Math.max(full - Math.min(gap, full / 2), 0), offset: start };
    start += full;
    return arc;
  });
}
