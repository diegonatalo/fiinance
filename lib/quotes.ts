const BASE_URL = "https://brapi.dev/api/quote";

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
