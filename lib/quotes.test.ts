import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchQuote } from "@/lib/quotes";

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
