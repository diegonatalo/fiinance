import { cacheLife } from "next/cache";
import type { NextRequest } from "next/server";
import { fetchQuote, parseTickers, type QuotesResult } from "@/lib/quotes";

/**
 * Cotação de um fundo, guardada por alguns minutos para não gastar a cota da brapi
 * a cada visita. O token fica só no servidor (`BRAPI_TOKEN`).
 */
async function cachedQuote(ticker: string): Promise<number> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });
  return fetchQuote(ticker, process.env.BRAPI_TOKEN ?? "");
}

/** `GET /api/quotes?tickers=HGLG11,MXRF11` devolve `{ prices, failed }`. */
export async function GET(request: NextRequest) {
  const tickers = parseTickers(request.nextUrl.searchParams.get("tickers"));
  if (!tickers) {
    return Response.json({ error: "Informe de 1 a 30 tickers válidos, separados por vírgula." }, { status: 400 });
  }

  const results = await Promise.allSettled(tickers.map((t) => cachedQuote(t)));
  const body: QuotesResult = { prices: {}, failed: [] };
  results.forEach((result, i) => {
    if (result.status === "fulfilled") body.prices[tickers[i]] = result.value;
    else body.failed.push(tickers[i]);
  });
  return Response.json(body, { headers: { "Cache-Control": "private, max-age=60" } });
}
