import { describe, expect, it } from "vitest";
import { simulateAveragePrice } from "@/lib/average-price";
import { calculateMagicNumber } from "@/lib/magic-number";
import { currentAllocation, suggestContribution } from "@/lib/targets";

describe("simulateAveragePrice", () => {
  it("calcula o novo preço médio de uma compra adicional", () => {
    const result = simulateAveragePrice(100, 10, 100, 8);
    expect(result).toMatchObject({
      newAveragePrice: 9,
      totalShares: 200,
      contribution: 800,
      newTotalInvested: 1800,
      variation: -1,
      variationPct: -10,
    });
  });

  it("aceita começar sem cotas", () => {
    expect(simulateAveragePrice(0, 10, 50, 12)?.newAveragePrice).toBe(12);
  });

  it.each([
    [-1, 10, 1, 10],
    [1, 0, 1, 10],
    [1, 10, 0, 10],
    [1, 10, 1, 0],
    [Number.NaN, 10, 1, 10],
    [1, 10, 1, Infinity],
  ])("devolve null para entrada inválida (%s, %s, %s, %s)", (a, b, c, d) => {
    expect(simulateAveragePrice(a, b, c, d)).toBeNull();
  });
});

describe("calculateMagicNumber", () => {
  it("arredonda para cima cotação ÷ dividendo", () => {
    const result = calculateMagicNumber(1, 95, 40);
    expect(result).toMatchObject({
      magicNumber: 95,
      missing: 55,
      reached: false,
      missingContribution: 55 * 95,
    });
    expect(calculateMagicNumber(1.1, 100, 0)?.magicNumber).toBe(91);
  });

  it("marca como atingido e limita o progresso a 100%", () => {
    const result = calculateMagicNumber(1, 100, 250);
    expect(result).toMatchObject({ reached: true, missing: 0, progress: 100 });
  });

  it("calcula o progresso proporcional", () => {
    expect(calculateMagicNumber(1, 100, 25)?.progress).toBe(25);
  });

  it("devolve null sem dividendo ou cotação válidos", () => {
    expect(calculateMagicNumber(0, 100, 1)).toBeNull();
    expect(calculateMagicNumber(1, -5, 1)).toBeNull();
    expect(calculateMagicNumber(Number.NaN, 100, 1)).toBeNull();
  });
});

describe("currentAllocation", () => {
  it("divide a carteira em papel e tijolo", () => {
    expect(currentAllocation(300, 700)).toEqual({ paperPct: 30, brickPct: 70 });
  });

  it("devolve zero para carteira vazia", () => {
    expect(currentAllocation(0, 0)).toEqual({ paperPct: 0, brickPct: 0 });
  });
});

describe("suggestContribution", () => {
  it("sugere aporte em papel quando ele está abaixo da meta", () => {
    // 200 papel + 800 tijolo, meta 50%: (A + x) / (T + x) = 0,5 => x = 600
    expect(suggestContribution(200, 800, 50)).toEqual({
      variantClass: "papel",
      contribution: 600,
    });
  });

  it("sugere aporte em tijolo quando papel passou da meta", () => {
    expect(suggestContribution(800, 200, 50)).toEqual({
      variantClass: "tijolo",
      contribution: 600,
    });
  });

  it("não sugere nada quando a carteira já está na meta", () => {
    expect(suggestContribution(500, 500, 50)).toBeNull();
  });

  it("não sugere nada para carteira vazia", () => {
    expect(suggestContribution(0, 0, 50)).toBeNull();
  });
});
