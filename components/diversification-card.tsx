import { DonutChart } from "@/components/donut-chart";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { distributionByRisk, distributionBySegment, distributionByType } from "@/lib/distribution";
import { BRICK_SEGMENTS, RISK_PROFILES, type Asset } from "@/types/fii";

const NEUTRAL = "var(--c-track)";

const typeColor = (name: string) => (name === "Papel" ? "var(--c-paper)" : "var(--c-brick)");

/** Cada nome da lista leva sempre a mesma cor; o que não está na lista ("sem segmento") fica neutro. */
const slotColor = (names: readonly string[]) => (name: string) => {
  const i = names.indexOf(name);
  return i < 0 ? NEUTRAL : `var(--c-series-${i + 1})`;
};

const segmentColor = slotColor(BRICK_SEGMENTS);
const riskColor = slotColor(RISK_PROFILES);

/** Diversificação pelo valor investido: por tipo, tijolo por segmento e papel por risco. */
export const DiversificationCard = ({ assets, className }: { assets: Asset[]; className?: string }) => (
  <Card className={cn("flex flex-col gap-6", className)}>
    <div className="flex items-baseline justify-between gap-3">
      <CardTitle>Diversificação</CardTitle>
      <span className="text-[13px] text-muted">pelo valor investido</span>
    </div>
    <div className="grid gap-8 lg:grid-cols-3">
      <DonutChart
        title="Por tipo"
        slices={distributionByType(assets)}
        color={typeColor}
        empty="Nenhum fundo com cotas."
      />
      <DonutChart
        title="Tijolo por segmento"
        slices={distributionBySegment(assets)}
        color={segmentColor}
        empty="Nenhum fundo de tijolo na carteira."
      />
      <DonutChart
        title="Papel por risco"
        slices={distributionByRisk(assets)}
        color={riskColor}
        empty="Nenhum fundo de papel na carteira."
      />
    </div>
  </Card>
);
