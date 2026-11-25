import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToast } from "@/hooks/use-toast";
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
      <CardTitle className="mb-3">Histórico de operações</CardTitle>
      <ul className="grid divide-y divide-hairline">
        {sorted.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2.5 text-sm tabular-nums">
            <span className="w-20 shrink-0 text-[13px] text-muted">
              {formatDate(t.date)}
            </span>
            <span
              className={cn(
                "w-16 shrink-0 rounded-full py-1 text-center text-xs font-medium",
                t.type === "compra" ? "bg-up/10 text-up" : "bg-down/10 text-down",
              )}
            >
              {t.type}
            </span>
            <span className="font-mono font-medium">{tickers.get(t.assetId)}</span>
            <span className="ml-auto text-right text-xs text-muted">
              {formatNumber(t.shares)} × {formatBRL(t.price)}
              <span className="block text-sm font-semibold text-fg">
                {formatBRL(t.shares * t.price)}
              </span>
            </span>
            <Button
              variant="danger"
              size="icon"
              aria-label={`Excluir operação de ${tickers.get(t.assetId)}`}
              onClick={() => {
                if (window.confirm("Excluir esta operação? O preço médio será recalculado.")) {
                  removeTransaction(t.id);
                  notify("Operação excluída");
                }
              }}
            >
              <TrashSimpleIcon size={18} />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
