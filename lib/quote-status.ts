export type QuoteFetchState = "idle" | "loading" | "error";

export type QuoteStatus = {
  label: string;
  /** fresh: de hoje · old: de outro dia · error: sem cotação · loading: buscando */
  tone: "fresh" | "old" | "error" | "loading";
};

type QuoteStatusInput = {
  /** fundos com cotas na carteira */
  held: number;
  /** quando cada um desses fundos teve a cotação atualizada (ISO), se tiver */
  updatedAt: (string | undefined)[];
  state: QuoteFetchState;
  /** agora, em ms; null no servidor e na hidratação */
  now: number | null;
};

const localDay = (time: number) => new Date(time).toLocaleDateString("sv-SE");

const ago = (ms: number) => {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  return `há ${Math.floor(minutes / 60)} h`;
};

/** Texto do selo de cotações ("Cotações de hoje · há 3 min"). Null quando não há fundos. */
export function quoteStatus({ held, updatedAt, state, now }: QuoteStatusInput): QuoteStatus | null {
  if (held === 0) return null;
  const times = updatedAt
    .map((iso) => (iso ? Date.parse(iso) : Number.NaN))
    .filter((t) => Number.isFinite(t));
  if (times.length === 0) {
    return state === "error"
      ? { label: "Cotações indisponíveis", tone: "error" }
      : { label: "Buscando cotações…", tone: "loading" };
  }
  if (state === "loading") return { label: "Atualizando cotações…", tone: "loading" };
  // a mais antiga manda: o selo nunca promete mais frescor do que a carteira tem
  const oldest = Math.min(...times);
  if (now === null) return { label: "Cotações", tone: "old" };
  if (localDay(oldest) === localDay(now)) {
    return { label: `Cotações de hoje · ${ago(now - oldest)}`, tone: state === "error" ? "error" : "fresh" };
  }
  const [, month, day] = localDay(oldest).split("-");
  return { label: `Cotações de ${day}/${month}`, tone: state === "error" ? "error" : "old" };
}
