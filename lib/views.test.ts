import { describe, expect, it } from "vitest";
import { evolutionChart, fillMonths, niceCeil } from "@/lib/evolution";
import { latestPayoutMonth, payoutsByMonth } from "@/lib/payouts";
import { positionRows } from "@/lib/summary";
import type { Fii, Payout } from "@/types/fii";

describe("niceCeil", () => {
  it("arredonda para cima num valor redondo", () => {
    expect(niceCeil(0)).toBe(1);
    expect(niceCeil(7)).toBe(10);
    expect(niceCeil(1800)).toBe(2000);
    expect(niceCeil(2300)).toBe(2500);
    expect(niceCeil(31_000)).toBe(50_000);
  });
});

describe("fillMonths", () => {
  it("preenche os meses sem operação com o investido anterior, até o mês atual", () => {
    const filled = fillMonths(
      [
        { month: "2025-11", contributed: 100 },
        { month: "2026-02", contributed: 300 },
      ],
      "2026-03",
    );
    expect(filled).toEqual([
      { month: "2025-11", contributed: 100 },
      { month: "2025-12", contributed: 100 },
      { month: "2026-01", contributed: 100 },
      { month: "2026-02", contributed: 300 },
      { month: "2026-03", contributed: 300 },
    ]);
  });

  it("sem operações, não há meses", () => {
    expect(fillMonths([], "2026-03")).toEqual([]);
  });
});

describe("evolutionChart", () => {
  const points = [
    { month: "2026-02", contributed: 1000 },
    { month: "2026-03", contributed: 2000 },
  ];

  it("precisa de pelo menos dois meses", () => {
    expect(evolutionChart(points.slice(0, 1), "", null)).toBeNull();
  });

  it("estende o investido até o mês atual e põe o patrimônio no fim", () => {
    const chart = evolutionChart(points, "2026-05", 2500)!;
    // fev, mar, abr (repete mar) e o mês atual, de x=20 a x=780
    expect(chart.invested.startsWith("M20 ")).toBe(true);
    expect(chart.invested.split(" L")).toHaveLength(4);
    expect(chart.today?.x).toBe(780);
    // topo da escala: 2500 × 1,08 → 5000; 2500 fica no meio da altura
    expect(chart.today?.y).toBe(120);
    expect(chart.labels.map((l) => l.text)).toEqual(["fev", "mar", "abr", "mai"]);
    expect(chart.grid).toEqual([220, 170, 120, 70, 20]);
  });

  it("mostra o ano nos meses quando a série atravessa anos", () => {
    const chart = evolutionChart([{ month: "2025-12", contributed: 10 }, ...points], "", null)!;
    expect(chart.labels[0].text).toBe("dez/25");
    expect(chart.today).toBeNull();
  });

  it("com muitos meses, mostra no máximo dez rótulos, sempre com o último", () => {
    const many = Array.from({ length: 24 }, (_, i) => ({
      month: `${2025 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`,
      contributed: (i + 1) * 100,
    }));
    const chart = evolutionChart(many, "", null)!;
    expect(chart.labels.length).toBeLessThanOrEqual(10);
    expect(chart.labels.at(-1)?.text).toBe("dez/26");
  });
});

describe("positionRows", () => {
  const fii = (id: string, shares: number, averagePrice: number): Fii => ({
    id,
    ticker: `${id.toUpperCase()}AAA11`.slice(0, 6),
    type: "tijolo",
    segment: "lajes",
    shares,
    averagePrice,
  });

  it("calcula valor de hoje, resultado e peso; sem cotação vale o custo", () => {
    const rows = positionRows([fii("a", 10, 100), fii("b", 10, 50)], { a: { price: 150, updatedAt: "" } });
    expect(rows[0]).toMatchObject({ invested: 1000, value: 1500, result: 500, resultPct: 50, weight: 75 });
    expect(rows[1]).toMatchObject({ invested: 500, value: 500, weight: 25 });
    expect(rows[1].result).toBeUndefined();
  });

  it("carteira zerada não divide por zero", () => {
    expect(positionRows([fii("a", 0, 0)], {})[0].weight).toBe(0);
  });
});

describe("latestPayoutMonth", () => {
  it("pega o último mês com proventos e compara com o anterior", () => {
    const series = [
      { month: "2026-09", total: 100 },
      { month: "2026-10", total: 90 },
      { month: "2026-11", total: 0 },
    ];
    expect(latestPayoutMonth(series)).toEqual({ month: "2026-10", total: 90, changePct: -10 });
  });

  it("sem mês anterior com proventos, não há variação", () => {
    expect(latestPayoutMonth([{ month: "2026-10", total: 0 }, { month: "2026-11", total: 5 }])?.changePct).toBeNull();
    expect(latestPayoutMonth([{ month: "2026-11", total: 0 }])).toBeNull();
  });
});

describe("payoutsByMonth", () => {
  it("agrupa por mês, do mais recente, com o total", () => {
    const payouts: Payout[] = [
      { id: "1", assetId: "a", date: "2026-09-10", valuePerShare: 1, shares: 10 },
      { id: "2", assetId: "a", date: "2026-10-15", valuePerShare: 0.5, shares: 10 },
      { id: "3", assetId: "b", date: "2026-10-14", valuePerShare: 2, shares: 1 },
    ];
    const groups = payoutsByMonth(payouts);
    expect(groups.map((g) => [g.month, g.total, g.items.map((p) => p.id)])).toEqual([
      ["2026-10", 7, ["2", "3"]],
      ["2026-09", 10, ["1"]],
    ]);
  });
});
