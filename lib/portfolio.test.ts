import { describe, expect, it } from "vitest";
import { distributionByRisk, distributionBySegment, distributionByType, NO_RISK, NO_SEGMENT } from "@/lib/distribution";
import { donutArcs } from "@/lib/donut";
import { calculateSummary, positionRows } from "@/lib/summary";
import { minimumContribution, splitContribution, targetWeights } from "@/lib/targets";
import type { Asset } from "@/types/fii";

const asset = (over: Partial<Asset> & Pick<Asset, "id">): Asset => ({
  ticker: `${over.id.toUpperCase().padEnd(4, "X").slice(0, 4)}11`,
  type: "tijolo",
  segment: "logístico",
  risk: null,
  shares: 10,
  averagePrice: 100,
  lastDividend: 1,
  rating: 5,
  ...over,
});

// 1.000 em HGLG (nota 8), 500 em MXRF (nota 6), 500 em KNRI (nota 6)
const hglg = asset({ id: "hglg", shares: 10, averagePrice: 100, lastDividend: 1.1, rating: 8 });
const mxrf = asset({
  id: "mxrf",
  type: "papel",
  segment: null,
  risk: "High Yield",
  shares: 50,
  averagePrice: 10,
  lastDividend: 0.1,
  rating: 6,
});
const knri = asset({ id: "knri", segment: "híbrido", shares: 5, averagePrice: 100, lastDividend: 0.8, rating: 6 });
const wallet = [hglg, mxrf, knri];

describe("calculateSummary", () => {
  it("soma o investido, as cotas e os proventos esperados", () => {
    const summary = calculateSummary(wallet);
    expect(summary).toMatchObject({ totalInvested: 2000, totalShares: 65, activeAssets: 3 });
    // 10 × 1,10 + 50 × 0,10 + 5 × 0,80
    expect(summary.expectedIncome).toBeCloseTo(20);
  });

  it("fundo sem cotas não conta como ativo", () => {
    expect(calculateSummary([asset({ id: "a", shares: 0, averagePrice: 0 })])).toMatchObject({
      totalInvested: 0,
      activeAssets: 0,
    });
  });

  it("carteira vazia", () => {
    expect(calculateSummary([])).toEqual({ totalInvested: 0, totalShares: 0, activeAssets: 0, expectedIncome: 0 });
  });
});

describe("positionRows", () => {
  it("traz o peso, a meta pela nota e a diferença", () => {
    const [h, m, k] = positionRows(wallet);
    expect(h).toMatchObject({ invested: 1000, weight: 50, target: 40, gap: 10 });
    expect(h.income).toBeCloseTo(11);
    expect(m).toMatchObject({ invested: 500, weight: 25, target: 30, gap: -5, income: 5 });
    expect(k).toMatchObject({ invested: 500, weight: 25, target: 30, gap: -5 });
  });

  it("sem nada investido, o peso é zero e a meta continua valendo", () => {
    const [row] = positionRows([asset({ id: "a", shares: 0, averagePrice: 0 })]);
    expect(row).toMatchObject({ weight: 0, target: 100, gap: -100 });
  });
});

describe("targetWeights", () => {
  it("divide 100% pela nota de cada fundo", () => {
    const targets = targetWeights(wallet);
    expect(targets.get("hglg")).toBe(40);
    expect(targets.get("mxrf")).toBe(30);
    expect(targets.get("knri")).toBe(30);
  });

  it("notas iguais dividem igual", () => {
    const targets = targetWeights([asset({ id: "a" }), asset({ id: "b" })]);
    expect([...targets.values()]).toEqual([50, 50]);
  });
});

describe("minimumContribution", () => {
  it("o fundo mais acima da meta define o aporte", () => {
    // HGLG precisa ser 40%: 1.000 ÷ 0,4 = 2.500 no total, 500 a mais
    expect(minimumContribution(wallet)).toBeCloseTo(500);
  });

  it("carteira na meta não precisa de aporte", () => {
    expect(minimumContribution([asset({ id: "a" }), asset({ id: "b" })])).toBe(0);
  });

  it("sem nada investido não há sugestão", () => {
    expect(minimumContribution([])).toBeNull();
  });
});

describe("splitContribution", () => {
  it("com o aporte mínimo, cada fundo abaixo da meta recebe o que falta", () => {
    const split = splitContribution(wallet, 500);
    // total 2.500: MXRF e KNRI precisam de 750 cada, têm 500
    expect(split.map((s) => s.asset.id)).toEqual(["mxrf", "knri"]);
    expect(split[0].amount).toBeCloseTo(250);
    expect(split[1].amount).toBeCloseTo(250);
  });

  it("um aporte menor é dividido na proporção do que falta", () => {
    const lopsided = [
      asset({ id: "a", averagePrice: 100 }),
      asset({ id: "b", averagePrice: 50 }),
      asset({ id: "c", averagePrice: 0, shares: 0 }),
    ];
    // total 1.500 + 300 = 1.800; meta 600 cada: faltam 100 em b e 600 em c
    const split = splitContribution(lopsided, 300);
    expect(split.map((s) => s.asset.id)).toEqual(["c", "b"]);
    expect(split[0].amount).toBeCloseTo((600 / 700) * 300);
    expect(split[1].amount).toBeCloseTo((100 / 700) * 300);
    expect(split.reduce((acc, s) => acc + s.amount, 0)).toBeCloseTo(300);
  });

  it.each([0, -10, Number.NaN])("aporte %s não divide nada", (amount) => {
    expect(splitContribution(wallet, amount)).toEqual([]);
  });
});

describe("distribuição", () => {
  it("por tipo", () => {
    expect(distributionByType(wallet)).toEqual([
      { name: "Tijolo", amount: 1500 },
      { name: "Papel", amount: 500 },
    ]);
  });

  it("por segmento, só tijolo; tijolo sem segmento aparece à parte", () => {
    const noSegment = asset({ id: "x", segment: null, shares: 1, averagePrice: 50 });
    expect(distributionBySegment([...wallet, noSegment])).toEqual([
      { name: "logístico", amount: 1000 },
      { name: "híbrido", amount: 500 },
      { name: NO_SEGMENT, amount: 50 },
    ]);
  });

  it("por risco, só papel; papel sem perfil aparece à parte", () => {
    const old = asset({ id: "old", type: "papel", segment: null, risk: null, shares: 1, averagePrice: 10 });
    expect(distributionByRisk([...wallet, old])).toEqual([
      { name: "High Yield", amount: 500 },
      { name: NO_RISK, amount: 10 },
    ]);
  });

  it("ignora fundos sem valor investido", () => {
    expect(distributionByType([asset({ id: "a", shares: 0, averagePrice: 0 })])).toEqual([]);
  });
});

describe("donutArcs", () => {
  it("cada fatia começa onde a anterior terminou, com um respiro entre elas", () => {
    const arcs = donutArcs(
      [
        { name: "a", amount: 75 },
        { name: "b", amount: 25 },
      ],
      100,
    );
    expect(arcs).toEqual([
      { name: "a", amount: 75, pct: 75, length: 73, offset: 0 },
      { name: "b", amount: 25, pct: 25, length: 23, offset: 75 },
    ]);
  });

  it("uma fatia só fecha o círculo", () => {
    expect(donutArcs([{ name: "a", amount: 10 }], 100)).toEqual([
      { name: "a", amount: 10, pct: 100, length: 100, offset: 0 },
    ]);
  });

  it("fatia minúscula não fica com comprimento negativo", () => {
    const arcs = donutArcs(
      [
        { name: "a", amount: 999 },
        { name: "b", amount: 1 },
      ],
      100,
    );
    expect(arcs[1].length).toBeGreaterThanOrEqual(0);
  });

  it("sem valor, sem fatias", () => {
    expect(donutArcs([], 100)).toEqual([]);
  });
});
