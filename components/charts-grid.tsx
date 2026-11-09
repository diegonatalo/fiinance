import { PieChartCard } from "./pie-chart";
import {
  distributionByAsset,
  distributionByType,
  paperSegmentDistribution,
  brickSegmentDistribution,
} from "@/lib/distribution";
import type { Fii } from "@/types/fii";

type ChartsGridProps = {
  assets: Fii[];
  theme: "light" | "dark";
};

export const ChartsGrid = ({ assets, theme }: ChartsGridProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PieChartCard
        title="Distribuição por ativo"
        data={distributionByAsset(assets)}
        theme={theme}
      />
      <PieChartCard
        title="Distribuição por tipo"
        data={distributionByType(assets)}
        theme={theme}
      />
      <PieChartCard
        title="Distribuição por segmento"
        data={brickSegmentDistribution(assets)}
        theme={theme}
      />
      <PieChartCard
        title="Distribuição por indexador"
        data={paperSegmentDistribution(assets)}
        theme={theme}
      />
    </div>
  );
};
