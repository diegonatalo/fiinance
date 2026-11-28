import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { formatBRL, formatNumber, formatPct } from "@/lib/format";
import type { Summary } from "@/lib/summary";

type DashboardHeroProps = {
  summary: Summary;
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1.5">
    <dt className="text-[13px] text-muted">{label}</dt>
    <dd className="text-[28px] font-semibold tracking-[-0.03em] tabular-nums">{value}</dd>
  </div>
);

const Tile = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-3.5">
    <dt className="text-xs text-muted">{label}</dt>
    <dd className="text-xl font-semibold tracking-[-0.02em] tabular-nums">{value}</dd>
    <dd className="text-xs text-muted">{note}</dd>
  </div>
);

/** Patrimônio (o total investido) em destaque, com os proventos esperados. */
export const DashboardHero = ({ summary }: DashboardHeroProps) => {
  // último rendimento de cada fundo repetido por 12 meses, sobre o custo
  const yieldOnCost = summary.totalInvested > 0 ? ((summary.expectedIncome * 12) / summary.totalInvested) * 100 : 0;
  const funds = `${formatNumber(summary.activeAssets)} ${summary.activeAssets === 1 ? "fundo" : "fundos"}`;
  return (
    <section className="flex flex-col gap-4 md:pb-6">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-2 md:gap-3">
          <h1 className="text-sm font-medium text-muted md:text-[15px]">Patrimônio</h1>
          <p className="text-[44px] leading-none font-semibold tracking-[-0.045em] tabular-nums md:text-[clamp(48px,7vw,84px)] md:leading-[0.95] md:tracking-[-0.05em]">
            {formatBRL(summary.totalInvested)}
          </p>
          <p className="text-sm text-muted tabular-nums md:text-base">
            investido em {funds} · {formatNumber(summary.totalShares)} cotas
          </p>
        </div>
        <dl className="hidden flex-wrap gap-x-10 gap-y-6 md:flex">
          <Stat label="Proventos esperados por mês" value={formatBRL(summary.expectedIncome)} />
          <Stat label="Em 12 meses" value={formatBRL(summary.expectedIncome * 12)} />
          <Stat label="Yield on cost" value={formatPct(yieldOnCost, 2)} />
        </dl>
      </div>
      <dl className="grid grid-cols-2 gap-2.5 md:hidden">
        <Tile label="Proventos esperados" value={formatBRL(summary.expectedIncome)} note="por mês" />
        <Tile label="Yield on cost" value={formatPct(yieldOnCost, 2)} note="ao ano, pelo último rendimento" />
      </dl>
      {summary.activeAssets === 0 && summary.totalShares === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-dashed border-line-strong p-6">
          <p className="text-[15px] text-fg-soft">Sua carteira está vazia. Cadastre o primeiro fundo para ver o painel.</p>
          <Link href="/app/carteira" className={buttonClasses()}>
            Cadastrar fundo
          </Link>
        </div>
      )}
    </section>
  );
};
