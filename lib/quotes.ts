import { TICKER_REGEX } from "./data";

const BASE_URL = "https://brapi.dev/api/quote";

/** Quantos fundos uma busca de cotações aceita de uma vez. */
export const MAX_TICKERS = 30;

/** Depois desse tempo, o app busca as cotações de novo. */
export const QUOTES_MAX_AGE_MS = 15 * 60 * 1000;

/** Busca a cotação atual de um ticker na brapi. Lança erro com mensagem legível. */
export async function fetchQuote(
  ticker: string,
  token: string,
  signal?: AbortSignal,
): Promise<number> {
  const resp = await fetch(`${BASE_URL}/${encodeURIComponent(ticker)}`, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (resp.status === 401 || resp.status === 402 || resp.status === 403) {
    throw new Error("Token da brapi ausente ou inválido");
  }
  if (!resp.ok) throw new Error(`Falha ao buscar ${ticker} (${resp.status})`);
  const json = (await resp.json()) as {
    results?: { regularMarketPrice?: unknown }[];
  };
  const price = json?.results?.[0]?.regularMarketPrice;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    throw new Error(`Cotação de ${ticker} indisponível`);
  }
  return price;
}

/**
 * Lê a lista `?tickers=HGLG11,MXRF11` da rota de cotações.
 * Devolve os tickers em maiúsculas e sem repetição, ou null se algum for inválido.
 */
export function parseTickers(raw: unknown): string[] | null {
  if (typeof raw !== "string" || raw.length > MAX_TICKERS * 8) return null;
  const tickers = [...new Set(raw.split(",").map((t) => t.trim().toUpperCase()))];
  if (tickers.length === 0 || tickers.length > MAX_TICKERS) return null;
  return tickers.every((t) => TICKER_REGEX.test(t)) ? tickers : null;
}

export type QuotesResult = {
  /** preço por ticker */
  prices: Record<string, number>;
  /** tickers que a brapi não devolveu */
  failed: string[];
};

/** Confere a resposta da rota de cotações; o que vier fora do formato é descartado. */
export function parseQuotesResult(body: unknown): QuotesResult {
  const prices: Record<string, number> = {};
  const failed: string[] = [];
  if (typeof body !== "object" || body === null) return { prices, failed };
  const raw = body as { prices?: unknown; failed?: unknown };
  if (typeof raw.prices === "object" && raw.prices !== null) {
    for (const [ticker, price] of Object.entries(raw.prices)) {
      if (TICKER_REGEX.test(ticker) && typeof price === "number" && Number.isFinite(price) && price > 0) {
        prices[ticker] = price;
      }
    }
  }
  if (Array.isArray(raw.failed)) {
    for (const ticker of raw.failed) if (typeof ticker === "string" && TICKER_REGEX.test(ticker)) failed.push(ticker);
  }
  return { prices, failed };
}

/** Busca as cotações dos tickers pela rota do próprio app (`/api/quotes`). */
export async function fetchPortfolioQuotes(tickers: string[], signal?: AbortSignal): Promise<QuotesResult> {
  const resp = await fetch(`/api/quotes?tickers=${tickers.map(encodeURIComponent).join(",")}`, { signal });
  if (!resp.ok) throw new Error(`Falha ao buscar as cotações (${resp.status})`);
  return parseQuotesResult(await resp.json());
}

/** As cotações precisam ser buscadas de novo? (falta alguma ou a mais antiga passou do prazo) */
export function quotesAreStale(updatedAt: (string | undefined)[], now: number): boolean {
  if (updatedAt.length === 0) return false;
  return updatedAt.some((iso) => {
    const time = iso ? Date.parse(iso) : Number.NaN;
    return !Number.isFinite(time) || now - time > QUOTES_MAX_AGE_MS;
  });
}
