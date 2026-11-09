import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { TrashSimpleIcon } from "@phosphor-icons/react";

export const HistoryCard = () => {
  const { data, removeTransaction } = usePortfolioContext();
  const notify = useToast();
  const tickers = new Map(data.assets.map((a) => [a.id, a.ticker]));
  const sorted = data.transactions.toSorted((a, b) =>
    b.date.localeCompare(a.date),
  );

  if (sorted.length === 0) return null;

  return (
    <Card>
      <CardTitle className="mb-4">Histórico de operações</CardTitle>
      <ul className="grid divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {sorted.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
            <span className="w-20 shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatDate(t.date)}
            </span>
            <span
              className={cn(
                "w-14 shrink-0 rounded-md px-2 py-0.5 text-center text-xs font-medium",
                t.type === "compra"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
              )}
            >
              {t.type}
            </span>
            <span className="font-semibold">{tickers.get(t.assetId)}</span>
            <span className="ml-auto text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
              {formatNumber(t.shares)} × {formatBRL(t.price)}
              <span className="block font-medium">
                {formatBRL(t.shares * t.price)}
              </span>
            </span>
            <Button
              variant="danger"
              className="px-2!"
              aria-label={`Excluir operação de ${tickers.get(t.assetId)}`}
              onClick={() => {
                if (window.confirm("Excluir esta operação? O preço médio será recalculado.")) {
                  removeTransaction(t.id);
                  notify("Operação excluída");
                }
              }}
            >
              <TrashSimpleIcon size={16} />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
