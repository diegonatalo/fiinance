import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { useToast } from "@/lib/toast-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { fetchQuote } from "@/lib/quotes";
import { formatBRL } from "@/lib/format";
import { parseDecimal } from "@/lib/numbers";
import { ArrowsClockwiseIcon, ChartLineUpIcon } from "@phosphor-icons/react";

const TOKEN_KEY = "fiinance:brapi-token:v1";

function sanitizeToken(raw: unknown): string {
  return typeof raw === "string" ? raw : "";
}

export const QuotesCard = () => {
  const { assets, data, setQuotes } = usePortfolioContext();
  const notify = useToast();
  const [token, setToken] = useLocalStorage(TOKEN_KEY, "", sanitizeToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState<Record<string, string>>({});

  const withShares = assets.filter((a) => a.shares > 0);

  async function update() {
    setLoading(true);
    setError(null);
    const results = await Promise.allSettled(
      withShares.map(async (a) => [a.id, await fetchQuote(a.ticker, token.trim())] as const),
    );
    const prices: Record<string, number> = {};
    const failures: string[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") prices[r.value[0]] = r.value[1];
      else failures.push(r.reason instanceof Error ? r.reason.message : "Erro de rede");
    }
    if (Object.keys(prices).length > 0) setQuotes(prices);
    if (failures.length > 0) {
      setError(`${failures.length} de ${withShares.length} falharam: ${[...new Set(failures)].join("; ")}`);
    } else {
      notify("Cotações atualizadas");
    }
    setLoading(false);
  }

  function saveManual(id: string) {
    const text = manual[id];
    if (text === undefined) return;
    const amount = parseDecimal(text);
    if (text.trim() === "") setQuotes({ [id]: 0 });
    else if (Number.isFinite(amount) && amount > 0) setQuotes({ [id]: amount });
    setManual((m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== id)));
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <ChartLineUpIcon size={16} className="text-emerald-500" />
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Cotações
        </CardTitle>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Informe a cotação manualmente ou busque na{" "}
        <a
          href="https://brapi.dev"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          brapi
        </a>{" "}
        (exige token gratuito para FIIs). O token fica só neste navegador.
      </p>

      {withShares.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Adicione ativos para acompanhar as cotações.
        </p>
      ) : (
        <div className="grid gap-4">
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Token da brapi (opcional)">
              <Input
                type="password"
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="seu token"
              />
            </Field>
            <Button onClick={update} disabled={loading}>
              <ArrowsClockwiseIcon
                size={16}
                className={loading ? "animate-spin" : undefined}
              />
              {loading ? "Buscando…" : "Atualizar cotações"}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}

          <ul className="grid gap-2 sm:grid-cols-2">
            {withShares.map((a) => {
              const entry = data.quotes[a.id];
              return (
                <li key={a.id} className="grid grid-cols-[5rem_1fr] items-center gap-2">
                  <span className="text-sm font-semibold">{a.ticker}</span>
                  <Input
                    inputMode="decimal"
                    aria-label={`Cotação de ${a.ticker}`}
                    placeholder={entry ? formatBRL(entry.price) : "R$ 0,00"}
                    value={manual[a.id] ?? (entry ? String(entry.price).replace(".", ",") : "")}
                    onChange={(e) =>
                      setManual((m) => ({ ...m, [a.id]: e.target.value }))
                    }
                    onBlur={() => saveManual(a.id)}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
};
