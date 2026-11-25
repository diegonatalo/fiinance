import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPortfolioQuotes, fetchQuote, parseQuotesResult, parseTickers, quotesAreStale } from "@/lib/quotes";

const respond = (status: number, body: unknown = {}) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

describe("fetchQuote", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("devolve o preço da primeira cotação", async () => {
    const fetchMock = respond(200, { results: [{ regularMarketPrice: 10.5 }] });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchQuote("MXRF11", "tok")).resolves.toBe(10.5);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://brapi.dev/api/quote/MXRF11",
      expect.objectContaining({ headers: { Authorization: "Bearer tok" } }),
    );
  });

  it("não envia Authorization sem token", async () => {
    const fetchMock = respond(200, { results: [{ regularMarketPrice: 1 }] });
    vi.stubGlobal("fetch", fetchMock);

    await fetchQuote("MXRF11", "");
    expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();
  });

  it.each([401, 402, 403])("explica token ausente ou inválido no status %s", async (status) => {
    vi.stubGlobal("fetch", respond(status));
    await expect(fetchQuote("MXRF11", "x")).rejects.toThrow("Token da brapi ausente ou inválido");
  });

  it("informa o status em outras falhas", async () => {
    vi.stubGlobal("fetch", respond(500));
    await expect(fetchQuote("MXRF11", "x")).rejects.toThrow("Falha ao buscar MXRF11 (500)");
  });

  it.each([
    [{}],
    [{ results: [] }],
    [{ results: [{ regularMarketPrice: 0 }] }],
    [{ results: [{ regularMarketPrice: "10" }] }],
    [{ results: [{ regularMarketPrice: Number.NaN }] }],
  ])("recusa cotação indisponível (%j)", async (body) => {
    vi.stubGlobal("fetch", respond(200, body));
    await expect(fetchQuote("MXRF11", "x")).rejects.toThrow("Cotação de MXRF11 indisponível");
  });
});

describe("parseTickers", () => {
  it("normaliza e tira repetidos", () => {
    expect(parseTickers(" hglg11,MXRF11,hglg11 ")).toEqual(["HGLG11", "MXRF11"]);
  });

  it.each([null, undefined, "", "HGLG11,", "HGLG", "HGLG11;MXRF11", 12])("recusa %j", (raw) => {
    expect(parseTickers(raw)).toBeNull();
  });

  it("recusa mais de 30 tickers", () => {
    const many = Array.from({ length: 31 }, (_, i) => `ABCD${String(i).padStart(2, "0")}`).join(",");
    expect(parseTickers(many)).toBeNull();
  });
});

describe("parseQuotesResult", () => {
  it("fica só com preços e tickers válidos", () => {
    expect(
      parseQuotesResult({
        prices: { HGLG11: 160, MXRF11: 0, XPML11: "10", bad: 5 },
        failed: ["KNRI11", 3, "x"],
      }),
    ).toEqual({ prices: { HGLG11: 160 }, failed: ["KNRI11"] });
  });

  it("devolve vazio para resposta fora do formato", () => {
    expect(parseQuotesResult(null)).toEqual({ prices: {}, failed: [] });
    expect(parseQuotesResult("oi")).toEqual({ prices: {}, failed: [] });
  });
});

describe("fetchPortfolioQuotes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("chama a rota do app com os tickers", async () => {
    const fetchMock = respond(200, { prices: { HGLG11: 160 }, failed: [] });
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchPortfolioQuotes(["HGLG11", "MXRF11"])).resolves.toEqual({ prices: { HGLG11: 160 }, failed: [] });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/quotes?tickers=HGLG11,MXRF11");
  });

  it("lança erro quando a rota falha", async () => {
    vi.stubGlobal("fetch", respond(400));
    await expect(fetchPortfolioQuotes(["HGLG11"])).rejects.toThrow("Falha ao buscar as cotações (400)");
  });
});

describe("quotesAreStale", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");

  it("sem fundos, nada a buscar", () => {
    expect(quotesAreStale([], now)).toBe(false);
  });

  it("busca quando falta cotação ou a mais antiga passou de 15 minutos", () => {
    expect(quotesAreStale([undefined], now)).toBe(true);
    expect(quotesAreStale(["2026-11-24T11:50:00Z"], now)).toBe(false);
    expect(quotesAreStale(["2026-11-24T11:50:00Z", "2026-11-24T11:40:00Z"], now)).toBe(true);
    expect(quotesAreStale(["data ruim"], now)).toBe(true);
  });
});
