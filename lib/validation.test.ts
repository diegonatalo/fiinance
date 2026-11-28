import { describe, expect, it } from "vitest";
import {
  LIMITS,
  TICKER_REGEX,
  normalizeAsset,
  toCents,
  toHundredthCents,
  validId,
} from "@/lib/validation";

const asset = {
  id: "a",
  ticker: " mxrf11 ",
  type: "papel",
  risk: "High Yield",
  shares: 100,
  averagePrice: 9.87,
  lastDividend: 0.0825,
  rating: 7,
};
const brick = { ...asset, ticker: "HGLG11", type: "tijolo", risk: undefined, segment: "logístico" };

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

  it("aceita zero", () => {
    expect(toCents(0, LIMITS.priceCents)).toBe(0);
  });

  it.each([-1, 1.234, Number.NaN, "10", 2_000_000])("recusa %s", (value) => {
    expect(toCents(value, LIMITS.priceCents)).toBeNull();
  });
});

describe("toHundredthCents", () => {
  it("aceita até 4 casas", () => {
    expect(toHundredthCents(0.0825, LIMITS.dividendHundredthCents)).toBe(825);
    expect(toHundredthCents(1.1, LIMITS.dividendHundredthCents)).toBe(11_000);
  });

  it.each([0.00001, -0.1, Number.NaN])("recusa %s", (value) => {
    expect(toHundredthCents(value, LIMITS.dividendHundredthCents)).toBeNull();
  });
});

describe("normalizeAsset", () => {
  it("normaliza o ticker e deixa o segmento vazio no papel", () => {
    expect(normalizeAsset({ ...asset, segment: "logístico" })).toEqual({
      id: "a",
      ticker: "MXRF11",
      type: "papel",
      segment: null,
      risk: "High Yield",
      shares: 100,
      averagePrice: 9.87,
      lastDividend: 0.0825,
      rating: 7,
    });
  });

  it("tijolo leva segmento e nunca perfil de risco", () => {
    expect(normalizeAsset({ ...brick, risk: "High Grade" })).toMatchObject({ segment: "logístico", risk: null });
  });

  it("aceita fundo sem cotas, sem preço médio e sem rendimento", () => {
    expect(normalizeAsset({ ...asset, shares: 0, averagePrice: 0, lastDividend: 0 })).not.toBeNull();
  });

  it.each([
    ["sem objeto", null],
    ["ticker inválido", { ...asset, ticker: "XX" }],
    ["tipo desconhecido", { ...asset, type: "outro" }],
    ["papel sem perfil de risco", { ...asset, risk: undefined }],
    ["perfil inexistente", { ...asset, risk: "CDI" }],
    ["tijolo sem segmento", { ...brick, segment: undefined }],
    ["segmento antigo", { ...brick, segment: "lajes" }],
    ["id vazio", { ...asset, id: "" }],
    ["cotas fracionadas", { ...asset, shares: 1.5 }],
    ["cotas negativas", { ...asset, shares: -1 }],
    ["cotas demais", { ...asset, shares: LIMITS.shares + 1 }],
    ["cotas sem preço médio", { ...asset, averagePrice: 0 }],
    ["preço com 3 casas", { ...asset, averagePrice: 9.875 }],
    ["rendimento com 5 casas", { ...asset, lastDividend: 0.08251 }],
    ["nota 0", { ...asset, rating: 0 }],
    ["nota 11", { ...asset, rating: 11 }],
    ["nota fracionada", { ...asset, rating: 7.5 }],
    ["nota em texto", { ...asset, rating: "7" }],
  ])("recusa %s", (_, raw) => {
    expect(normalizeAsset(raw)).toBeNull();
  });
});
