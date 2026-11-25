import { describe, expect, it } from "vitest";
import {
  LIMITS,
  TICKER_REGEX,
  normalizeAsset,
  normalizePaperTarget,
  normalizePayout,
  normalizeTransaction,
  toCents,
  validId,
} from "@/lib/validation";

const asset = { id: "a", ticker: " mxrf11 ", type: "papel", segment: "CDI" };
const buy = { id: "t1", assetId: "a", type: "compra", date: "2026-01-10", shares: 10, price: 9.5 };
const payout = { id: "p1", assetId: "a", date: "2026-02-10", valuePerShare: 0.1, shares: 10 };

describe("TICKER_REGEX", () => {
  it.each(["MXRF11", "HGLG11", "XPLG11B"])("aceita %s", (ticker) => {
    expect(TICKER_REGEX.test(ticker)).toBe(true);
  });

  it.each(["mxrf11", "MXRF1", "MXRF111", "MXR11", "1234AB"])("recusa %s", (ticker) => {
    expect(TICKER_REGEX.test(ticker)).toBe(false);
  });
});

describe("validId", () => {
  it("aceita texto curto e recusa o resto", () => {
    expect(validId("abc")).toBe("abc");
    expect(validId("")).toBeNull();
    expect(validId(1)).toBeNull();
    expect(validId("x".repeat(LIMITS.idLength + 1))).toBeNull();
  });
});

describe("toCents", () => {
  it("converte reais com até 2 casas", () => {
    expect(toCents(9.82, LIMITS.priceCents)).toBe(982);
    expect(toCents(0.1 + 0.2, LIMITS.priceCents)).toBe(30);
  });

  it.each([0, -1, 1.234, Number.NaN, "10", 2_000_000])("recusa %s", (value) => {
    expect(toCents(value, LIMITS.priceCents)).toBeNull();
  });
});

describe("normalizeAsset", () => {
  it("normaliza o ticker", () => {
    expect(normalizeAsset(asset)).toEqual({ id: "a", ticker: "MXRF11", type: "papel", segment: "CDI" });
  });

  it.each([
    [null],
    [{ ...asset, ticker: "XX" }],
    [{ ...asset, type: "outro" }],
    [{ ...asset, segment: "lajes" }],
    [{ ...asset, id: "" }],
  ])("recusa %j", (raw) => {
    expect(normalizeAsset(raw)).toBeNull();
  });
});

describe("normalizeTransaction", () => {
  it("aceita uma compra válida", () => {
    expect(normalizeTransaction(buy)).toEqual(buy);
  });

  it.each([
    [{ ...buy, type: "troca" }],
    [{ ...buy, date: "2026-02-31" }],
    [{ ...buy, date: "1980-01-01" }],
    [{ ...buy, shares: 1.5 }],
    [{ ...buy, shares: LIMITS.shares + 1 }],
    [{ ...buy, price: 9.555 }],
    [{ ...buy, price: 0 }],
    [{ ...buy, assetId: 5 }],
  ])("recusa %j", (raw) => {
    expect(normalizeTransaction(raw)).toBeNull();
  });
});

describe("normalizePayout", () => {
  it("aceita um provento válido, mesmo com mais de 2 casas por cota", () => {
    expect(normalizePayout(payout)).toEqual(payout);
    expect(normalizePayout({ ...payout, valuePerShare: 0.0807 })?.valuePerShare).toBe(0.0807);
  });

  it.each([
    [{ ...payout, valuePerShare: 0 }],
    [{ ...payout, valuePerShare: 0.0001, shares: 1 }],
    [{ ...payout, shares: 0 }],
    [{ ...payout, date: "amanhã" }],
    [{ ...payout, valuePerShare: 1_000_000, shares: 1_000 }],
  ])("recusa %j", (raw) => {
    expect(normalizePayout(raw)).toBeNull();
  });
});

describe("normalizePaperTarget", () => {
  it("aceita de 0 a 100 e null (sem meta)", () => {
    expect(normalizePaperTarget(40)).toBe(40);
    expect(normalizePaperTarget(0)).toBe(0);
    expect(normalizePaperTarget(null)).toBeNull();
  });

  it.each([-1, 101, "40", Number.NaN, undefined])("recusa %s", (value) => {
    expect(normalizePaperTarget(value)).toBeUndefined();
  });
});
