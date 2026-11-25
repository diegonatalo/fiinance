import { describe, expect, it } from "vitest";
import {
  assetFromRow,
  assetToRow,
  payoutFromRow,
  payoutToRow,
  transactionFromRow,
  transactionToRow,
} from "@/lib/data/rows";

const createdAt = new Date("2026-01-10T12:00:00Z");

describe("linhas do banco", () => {
  it("o fundo vai e volta igual", () => {
    const asset = { id: "a", ticker: "HGLG11", type: "tijolo" as const, segment: "logística" as const };
    const row = assetToRow("u1", asset);
    expect(row).toMatchObject({ userId: "u1", ...asset });
    expect(assetFromRow({ ...row, createdAt })).toEqual(asset);
  });

  it("a operação guarda o preço em centavos", () => {
    const t = { id: "t", assetId: "a", type: "compra" as const, date: "2026-01-10", shares: 10, price: 158.4 };
    const row = transactionToRow("u1", t);
    expect(row.priceCents).toBe(15840);
    expect(transactionFromRow({ ...row, createdAt })).toEqual(t);
  });

  it("o provento guarda o total em centavos e devolve o valor por cota", () => {
    const p = { id: "p", assetId: "a", date: "2026-02-15", valuePerShare: 0.07, shares: 750 };
    const row = payoutToRow("u1", p);
    expect(row.totalCents).toBe(5250);
    const back = payoutFromRow({ ...row, createdAt });
    expect(back.valuePerShare).toBeCloseTo(0.07, 10);
    expect(back.valuePerShare * back.shares).toBeCloseTo(52.5, 10);
  });
});
