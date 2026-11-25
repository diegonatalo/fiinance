import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

const request = (query: string) => ({ nextUrl: new URL(`http://localhost/api/quotes${query}`) }) as NextRequest;

describe("GET /api/quotes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("recusa tickers inválidos sem chamar a brapi", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET(request("?tickers=HGLG11,xx"));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("devolve os preços e os que falharam, com o token do servidor", async () => {
    vi.stubEnv("BRAPI_TOKEN", "segredo");
    const fetchMock = vi.fn(async (url: string) => {
      const ok = url.endsWith("/HGLG11");
      return {
        ok,
        status: ok ? 200 : 404,
        json: async () => ({ results: [{ regularMarketPrice: 160.5 }] }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request("?tickers=hglg11,MXRF11"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ prices: { HGLG11: 160.5 }, failed: ["MXRF11"] });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://brapi.dev/api/quote/HGLG11",
      expect.objectContaining({ headers: { Authorization: "Bearer segredo" } }),
    );
  });
});
