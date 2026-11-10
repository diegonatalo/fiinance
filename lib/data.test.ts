import { describe, expect, it } from "vitest";
import { EMPTY_DATA, TICKER_REGEX, sanitizeData, sanitizeOrEmpty } from "@/lib/data";
import { dataToJson, transactionsToCsv } from "@/lib/export-data";
import type { AppData } from "@/types/fii";

const valid = {
  version: 2,
  assets: [{ id: "a", ticker: " mxrf11 ", type: "papel", segment: "CDI" }],
  transactions: [
    { id: "t1", assetId: "a", type: "compra", date: "2026-01-10", shares: 10, price: 9.5 },
  ],
  payouts: [{ id: "p1", assetId: "a", date: "2026-02-10", valuePerShare: 0.1, shares: 10 }],
  quotes: { a: { price: 10, updatedAt: "2026-02-10T10:00:00Z" } },
  paperTarget: 40,
};

describe("TICKER_REGEX", () => {
  it.each(["MXRF11", "HGLG11", "XPLG11B"])("aceita %s", (ticker) => {
    expect(TICKER_REGEX.test(ticker)).toBe(true);
  });

  it.each(["mxrf11", "MXRF1", "MXRF111", "MXR11", "1234AB"])("recusa %s", (ticker) => {
    expect(TICKER_REGEX.test(ticker)).toBe(false);
  });
});

describe("sanitizeData", () => {
  it("normaliza o ticker e mantém dados válidos", () => {
    const data = sanitizeData(valid)!;
    expect(data.assets[0].ticker).toBe("MXRF11");
    expect(data.transactions).toHaveLength(1);
    expect(data.payouts).toHaveLength(1);
    expect(data.quotes.a.price).toBe(10);
    expect(data.paperTarget).toBe(40);
  });

  it("devolve null quando não parece um backup", () => {
    expect(sanitizeData(null)).toBeNull();
    expect(sanitizeData([])).toBeNull();
    expect(sanitizeData({ assets: "x" })).toBeNull();
  });

  it("descarta ativos inválidos e com id repetido", () => {
    const data = sanitizeData({
      assets: [
        { id: "a", ticker: "AAAA11", type: "papel", segment: "CDI" },
        { id: "a", ticker: "BBBB11", type: "papel", segment: "IPCA" },
        { id: "b", ticker: "CCCC11", type: "papel", segment: "lajes" },
        { id: "c", ticker: "DDDD11", type: "outro", segment: "CDI" },
        { ticker: "EEEE11", type: "tijolo", segment: "lajes" },
      ],
    })!;
    expect(data.assets.map((a) => a.ticker)).toEqual(["AAAA11"]);
  });

  it("descarta operações órfãs, com data impossível ou valores não positivos", () => {
    const data = sanitizeData({
      ...valid,
      transactions: [
        valid.transactions[0],
        { ...valid.transactions[0], id: "t2", assetId: "fantasma" },
        { ...valid.transactions[0], id: "t3", date: "2026-02-30" },
        { ...valid.transactions[0], id: "t4", shares: 0 },
        { ...valid.transactions[0], id: "t5", price: -1 },
        { ...valid.transactions[0], id: "t6", type: "troca" },
      ],
    })!;
    expect(data.transactions.map((t) => t.id)).toEqual(["t1"]);
  });

  it("descarta proventos e cotações inválidos", () => {
    const data = sanitizeData({
      ...valid,
      payouts: [valid.payouts[0], { ...valid.payouts[0], id: "p2", valuePerShare: 0 }],
      quotes: { a: { price: 10 }, fantasma: { price: 5 }, b: { price: -1 } },
    })!;
    expect(data.payouts).toHaveLength(1);
    expect(Object.keys(data.quotes)).toEqual(["a"]);
    expect(data.quotes.a.updatedAt).toBe("");
  });

  it.each([[-1], [101], ["40"], [Number.NaN]])("recusa meta de papel fora de 0–100 (%s)", (target) => {
    expect(sanitizeData({ ...valid, paperTarget: target })!.paperTarget).toBeNull();
  });

  it("aceita meta nos limites", () => {
    expect(sanitizeData({ ...valid, paperTarget: 0 })!.paperTarget).toBe(0);
    expect(sanitizeData({ ...valid, paperTarget: 100 })!.paperTarget).toBe(100);
  });

  it("sanitizeOrEmpty cai no estado vazio", () => {
    expect(sanitizeOrEmpty("lixo")).toBe(EMPTY_DATA);
    expect(sanitizeOrEmpty(valid).assets).toHaveLength(1);
  });
});

describe("exportação", () => {
  const data = sanitizeData({
    ...valid,
    transactions: [
      { id: "t2", assetId: "a", type: "venda", date: "2026-03-01", shares: 2, price: 11 },
      valid.transactions[0],
    ],
  }) as AppData;

  it("dataToJson gera um JSON que volta idêntico pelo sanitizeData", () => {
    expect(sanitizeData(JSON.parse(dataToJson(data)))).toEqual(data);
  });

  it("transactionsToCsv ordena por data e usa ponto e vírgula", () => {
    expect(transactionsToCsv(data).split("\n")).toEqual([
      "data;ticker;tipo;cotas;preco;total",
      "2026-01-10;MXRF11;compra;10;9.50;95.00",
      "2026-03-01;MXRF11;venda;2;11.00;22.00",
    ]);
  });
});
