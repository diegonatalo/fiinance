import { describe, expect, it } from "vitest";
import {
  brickSegmentDistribution,
  distributionByAsset,
  distributionByType,
  paperSegmentDistribution,
} from "@/lib/distribution";
import { contributionsEvolution } from "@/lib/evolution";
import { lastMonths, payoutTotal, summarizePayouts } from "@/lib/payouts";
import { calculatePosition, calculatePositions, sharesOn } from "@/lib/position";
import { calculateSummary } from "@/lib/summary";
import type { Asset, Fii, Payout, Transaction } from "@/types/fii";

const asset = (id: string, patch: Partial<Asset> = {}): Asset => ({
  id,
  ticker: id.toUpperCase(),
  type: "papel",
  segment: "CDI",
  ...patch,
});

const tx = (patch: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(),
  assetId: "a",
  type: "compra",
  date: "2026-01-10",
  shares: 10,
  price: 10,
  ...patch,
});

const fii = (id: string, shares: number, averagePrice: number, patch: Partial<Asset> = {}): Fii => ({
  ...asset(id, patch),
  shares,
  averagePrice,
});

describe("calculatePosition", () => {
  it("compras recalculam o preço médio", () => {
    const position = calculatePosition(asset("a"), [
      tx({ shares: 10, price: 10 }),
      tx({ shares: 10, price: 20, date: "2026-02-01" }),
    ]);
    expect(position).toMatchObject({ shares: 20, averagePrice: 15 });
  });

  it("vendas reduzem as cotas e mantêm o preço médio", () => {
    const position = calculatePosition(asset("a"), [
      tx({ shares: 10, price: 10 }),
      tx({ type: "venda", shares: 4, price: 30, date: "2026-02-01" }),
    ]);
    expect(position).toMatchObject({ shares: 6, averagePrice: 10 });
  });

  it("ordena as operações por data antes de calcular", () => {
    const position = calculatePosition(asset("a"), [
      tx({ type: "venda", shares: 5, date: "2026-03-01" }),
      tx({ shares: 10, price: 10, date: "2026-01-01" }),
    ]);
    expect(position.shares).toBe(5);
  });

  it("não vende mais cotas do que tem", () => {
    const position = calculatePosition(asset("a"), [
      tx({ shares: 5 }),
      tx({ type: "venda", shares: 50, date: "2026-02-01" }),
    ]);
    expect(position).toMatchObject({ shares: 0, averagePrice: 0 });
  });

  it("ignora operações de outro ativo", () => {
    const position = calculatePosition(asset("a"), [tx({ assetId: "b", shares: 99 })]);
    expect(position.shares).toBe(0);
  });

  it("calculatePositions devolve uma posição por ativo", () => {
    const positions = calculatePositions([asset("a"), asset("b")], [tx({ assetId: "b" })]);
    expect(positions.map((p) => p.shares)).toEqual([0, 10]);
  });
});

describe("sharesOn", () => {
  it("considera só as operações até a data", () => {
    const transactions = [
      tx({ shares: 10, date: "2026-01-01" }),
      tx({ shares: 5, date: "2026-02-01" }),
      tx({ type: "venda", shares: 3, date: "2026-03-01" }),
    ];
    expect(sharesOn("a", "2026-01-31", transactions)).toBe(10);
    expect(sharesOn("a", "2026-02-01", transactions)).toBe(15);
    expect(sharesOn("a", "2026-12-31", transactions)).toBe(12);
  });
});

describe("calculateSummary", () => {
  it("usa o custo quando falta cotação e sinaliza cotações incompletas", () => {
    const positions = [fii("a", 10, 10), fii("b", 5, 20)];
    const summary = calculateSummary(positions, {
      a: { price: 12, updatedAt: "" },
    });
    expect(summary).toMatchObject({
      totalInvested: 200,
      totalShares: 15,
      activeAssets: 2,
      marketValue: 220,
      completeQuotes: false,
      result: 20,
      resultPct: 10,
    });
  });

  it("marca as cotações como completas quando todas existem", () => {
    const summary = calculateSummary([fii("a", 10, 10)], { a: { price: 9, updatedAt: "" } });
    expect(summary.completeQuotes).toBe(true);
    expect(summary.result).toBe(-10);
  });

  it("ignora ativos sem cotas e zera uma carteira vazia", () => {
    const summary = calculateSummary([fii("a", 0, 0)], {});
    expect(summary).toMatchObject({
      activeAssets: 0,
      totalInvested: 0,
      resultPct: 0,
      completeQuotes: false,
    });
  });
});

describe("distribuição", () => {
  const assets = [
    fii("hglg", 10, 10, { ticker: "hglg11", type: "tijolo", segment: "logística" }),
    fii("knri", 5, 10, { ticker: "KNRI11", type: "tijolo", segment: "lajes" }),
    fii("mxrf", 20, 10, { ticker: "MXRF11", type: "papel", segment: "CDI" }),
    fii("zero", 0, 0, { ticker: "ZERO11" }),
  ];

  it("agrupa por ativo em ordem decrescente e ignora posições zeradas", () => {
    expect(distributionByAsset(assets)).toEqual([
      { name: "MXRF11", amount: 200 },
      { name: "HGLG11", amount: 100 },
      { name: "KNRI11", amount: 50 },
    ]);
  });

  it("agrupa por tipo", () => {
    expect(distributionByType(assets)).toEqual([
      { name: "Papel", amount: 200 },
      { name: "Tijolo", amount: 150 },
    ]);
  });

  it("separa os segmentos de papel e de tijolo", () => {
    expect(paperSegmentDistribution(assets)).toEqual([{ name: "CDI", amount: 200 }]);
    expect(brickSegmentDistribution(assets)).toEqual([
      { name: "logística", amount: 100 },
      { name: "lajes", amount: 50 },
    ]);
  });
});

describe("contributionsEvolution", () => {
  it("acumula compras menos vendas mês a mês, em ordem", () => {
    const result = contributionsEvolution([
      tx({ shares: 10, price: 10, date: "2026-02-05" }),
      tx({ shares: 5, price: 10, date: "2026-01-05" }),
      tx({ type: "venda", shares: 2, price: 10, date: "2026-02-20" }),
    ]);
    expect(result).toEqual([
      { month: "2026-01", contributed: 50 },
      { month: "2026-02", contributed: 130 },
    ]);
  });

  it("devolve lista vazia sem operações", () => {
    expect(contributionsEvolution([])).toEqual([]);
  });
});

describe("proventos", () => {
  const payout = (date: string, valuePerShare: number, shares: number): Payout => ({
    id: date,
    assetId: "a",
    date,
    valuePerShare,
    shares,
  });

  it("payoutTotal multiplica valor por cota pelas cotas", () => {
    expect(payoutTotal(payout("2026-01-10", 0.5, 100))).toBe(50);
  });

  it("lastMonths preenche com zero os meses sem provento e cruza o ano", () => {
    const series = lastMonths([payout("2025-12-10", 1, 10)], "2026-02", 3);
    expect(series).toEqual([
      { month: "2025-12", total: 10 },
      { month: "2026-01", total: 0 },
      { month: "2026-02", total: 0 },
    ]);
  });

  it("lastMonths soma proventos do mesmo mês e devolve vazio sem mês final", () => {
    const series = lastMonths([payout("2026-02-01", 1, 10), payout("2026-02-15", 2, 10)], "2026-02", 1);
    expect(series).toEqual([{ month: "2026-02", total: 30 }]);
    expect(lastMonths([], "")).toEqual([]);
  });

  it("summarizePayouts calcula total, média mensal e DY sobre o custo", () => {
    const payouts = [payout("2026-01-10", 1, 120)];
    expect(summarizePayouts(payouts, 1200, "2026-02")).toEqual({
      total12m: 120,
      monthlyAverage: 10,
      dyOnCost: 10,
    });
  });

  it("summarizePayouts não divide por zero sem investimento", () => {
    expect(summarizePayouts([], 0, "2026-02").dyOnCost).toBe(0);
  });
});
