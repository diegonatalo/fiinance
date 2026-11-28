import { describe, expect, it } from "vitest";
import { assetFromRow, assetToRow } from "@/lib/data/rows";
import type { Asset } from "@/types/fii";

const createdAt = new Date("2026-01-10T12:00:00Z");

const mxrf: Asset = {
  id: "a",
  ticker: "MXRF11",
  type: "papel",
  segment: null,
  risk: "High Yield",
  shares: 750,
  averagePrice: 9.87,
  lastDividend: 0.0825,
  rating: 7,
};

describe("linhas do banco", () => {
  it("o fundo vai e volta igual, com dinheiro em inteiros", () => {
    const row = assetToRow("u1", mxrf);
    expect(row).toMatchObject({ userId: "u1", averagePriceCents: 987, lastDividendHundredthCents: 825 });
    expect(assetFromRow({ ...row, createdAt })).toEqual(mxrf);
  });

  it("segmento ou risco fora da lista viram null", () => {
    const old = { ...assetToRow("u1", mxrf), createdAt };
    expect(assetFromRow({ ...old, risk: "CDI" as never }).risk).toBeNull();
    const brick = { ...old, type: "tijolo" as const, risk: null, segment: "lajes" as never };
    expect(assetFromRow(brick).segment).toBeNull();
    // papel nunca tem segmento, mesmo que a linha tenha sobrado com um
    expect(assetFromRow({ ...old, segment: "IPCA" as never }).segment).toBeNull();
  });
});
