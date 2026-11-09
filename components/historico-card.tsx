import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCarteiraContext } from "../contexts/carteira-context";
import { useToast } from "../contexts/toast-context";
import { cn, formatBRL, formatNumber } from "../lib/format";
import { formatData } from "../lib/data";
import { TrashSimpleIcon } from "@phosphor-icons/react";

export function HistoricoCard() {
  const { dados, removerTransacao } = useCarteiraContext();
  const notify = useToast();
  const tickers = new Map(dados.ativos.map((a) => [a.id, a.ticker]));
  const ordenadas = dados.transacoes.toSorted((a, b) =>
    b.data.localeCompare(a.data),
  );

  if (ordenadas.length === 0) return null;

  return (
    <Card>
      <CardTitle className="mb-4">Histórico de operações</CardTitle>
      <ul className="grid divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {ordenadas.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
            <span className="w-20 shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatData(t.data)}
            </span>
            <span
              className={cn(
                "w-14 shrink-0 rounded-md px-2 py-0.5 text-center text-xs font-medium",
                t.tipo === "compra"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
              )}
            >
              {t.tipo}
            </span>
            <span className="font-semibold">{tickers.get(t.ativoId)}</span>
            <span className="ml-auto text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
              {formatNumber(t.cotas)} × {formatBRL(t.preco)}
              <span className="block font-medium">
                {formatBRL(t.cotas * t.preco)}
              </span>
            </span>
            <Button
              variant="danger"
              className="px-2!"
              aria-label={`Excluir operação de ${tickers.get(t.ativoId)}`}
              onClick={() => {
                if (window.confirm("Excluir esta operação? O preço médio será recalculado.")) {
                  removerTransacao(t.id);
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
}
