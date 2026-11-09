"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProventoForm } from "@/components/provento-form";
import { ProventosChart } from "@/components/proventos-chart";
import { useCarteiraContext } from "@/contexts/carteira-context";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/hooks/useTheme";
import { formatBRL, formatNumber } from "@/lib/format";
import { formatData, hoje, mesDe } from "@/lib/data";
import { totalProvento, ultimosMeses } from "@/lib/proventos";
import { TrashSimpleIcon } from "@phosphor-icons/react";

export function ProventosPage() {
  const { dados, removerProvento } = useCarteiraContext();
  const { theme } = useTheme();
  const notify = useToast();

  const tickers = new Map(dados.ativos.map((a) => [a.id, a.ticker]));
  const ordenados = dados.proventos.toSorted((a, b) =>
    b.data.localeCompare(a.data),
  );
  const serie = ultimosMeses(dados.proventos, mesDe(hoje()), 12);

  return (
    <>
      <Card>
        <CardTitle className="mb-4">Registrar provento</CardTitle>
        {dados.ativos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Adicione um ativo na aba Carteira para registrar proventos.
          </p>
        ) : (
          <ProventoForm />
        )}
      </Card>

      <ProventosChart serie={serie} theme={theme} />

      {ordenados.length > 0 && (
        <Card>
          <CardTitle className="mb-4">Histórico de proventos</CardTitle>
          <ul className="grid divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {ordenados.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-20 shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatData(p.data)}
                </span>
                <span className="font-semibold">{tickers.get(p.ativoId)}</span>
                <span className="ml-auto text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
                  {formatNumber(p.cotas)} × {formatBRL(p.valorPorCota)}
                  <span className="block font-medium text-emerald-600 dark:text-emerald-400">
                    {formatBRL(totalProvento(p))}
                  </span>
                </span>
                <Button
                  variant="danger"
                  className="px-2!"
                  aria-label={`Excluir provento de ${tickers.get(p.ativoId)}`}
                  onClick={() => {
                    removerProvento(p.id);
                    notify("Provento excluído");
                  }}
                >
                  <TrashSimpleIcon size={16} />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
