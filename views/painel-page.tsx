"use client";

import { useTheme } from "@/hooks/useTheme";
import { SummaryCards } from "@/components/summary-card";
import { ChartsGrid } from "@/components/charts-grid";
import { MetasCard } from "@/components/metas-card";
import { EvolucaoChart } from "@/components/evolucao-chart";
import { useCarteiraContext } from "@/contexts/carteira-context";
import { evolucaoAportes } from "@/lib/evolucao";
import { hoje, mesDe } from "@/lib/data";
import { resumirProventos } from "@/lib/proventos";

export function PainelPage() {
  const { theme } = useTheme();
  const { ativos, dados, resumo } = useCarteiraContext();
  const proventos = resumirProventos(
    dados.proventos,
    resumo.totalInvestido,
    mesDe(hoje()),
  );

  return (
    <>
      <SummaryCards resumo={resumo} proventos={proventos} />

      <section className="grid gap-3">
        <h2 className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
          Alocação
        </h2>
        <MetasCard />
        <ChartsGrid ativos={ativos} theme={theme} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
          Evolução
        </h2>
        <EvolucaoChart dados={evolucaoAportes(dados.transacoes)} theme={theme} />
      </section>
    </>
  );
}
