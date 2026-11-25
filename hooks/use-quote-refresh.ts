import { useEffect, useEffectEvent, useState } from "react";
import { fetchPortfolioQuotes, QUOTES_MAX_AGE_MS, quotesAreStale } from "@/lib/quotes";
import type { QuoteFetchState } from "@/lib/quote-status";
import type { Fii, Quote } from "@/types/fii";

/**
 * Busca sozinho as cotações dos fundos com cotas: ao abrir o app, quando a carteira
 * muda e a cada 15 minutos, só se alguma estiver faltando ou velha.
 */
export const useQuoteRefresh = (
  assets: Fii[],
  quotes: Record<string, Quote>,
  setQuotes: (prices: Record<string, number>) => void,
): QuoteFetchState => {
  const [state, setState] = useState<QuoteFetchState>("idle");
  const held = assets.filter((a) => a.shares > 0);
  const key = held
    .map((a) => `${a.id}:${a.ticker}`)
    .sort()
    .join("|");

  const refresh = useEffectEvent(async (signal: AbortSignal) => {
    if (held.length === 0 || !quotesAreStale(held.map((a) => quotes[a.id]?.updatedAt), Date.now())) return;
    setState("loading");
    try {
      const { prices } = await fetchPortfolioQuotes(held.map((a) => a.ticker), signal);
      const byId: Record<string, number> = {};
      for (const a of held) if (prices[a.ticker]) byId[a.id] = prices[a.ticker];
      if (Object.keys(byId).length > 0) setQuotes(byId);
      setState(Object.keys(byId).length === held.length ? "idle" : "error");
    } catch {
      if (!signal.aborted) setState("error");
    }
  });

  useEffect(() => {
    const controller = new AbortController();
    // logo depois da pintura, e de novo a cada 15 minutos
    const first = window.setTimeout(() => void refresh(controller.signal), 0);
    const id = window.setInterval(() => void refresh(controller.signal), QUOTES_MAX_AGE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [key]);

  return state;
};
