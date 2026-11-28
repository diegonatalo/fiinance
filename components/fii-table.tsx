import { useState } from "react";
import { ArrowsDownUpIcon, CaretRightIcon, PencilSimpleIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { formatBRL, formatDividend, formatKind, formatNumber, formatPct } from "@/lib/format";
import { positionRows, type PositionRow } from "@/lib/summary";
import type { Asset, FiiType } from "@/types/fii";

export type TypeFilter = "all" | FiiType;

type FiiTableProps = {
  assets: Asset[];
  filter: TypeFilter;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
};

type SortField = "ticker" | "invested" | "gap";

const typeBar = (asset: Asset) => (asset.type === "papel" ? "bg-paper" : "bg-brick");

/** "+2,5 p.p." acima da meta, "−2,5 p.p." abaixo. */
const formatGap = (gap: number) => `${gap >= 0 ? "+" : "−"}${formatPct(Math.abs(gap)).replace("%", "")} p.p.`;

const Gap = ({ gap }: { gap: number }) => (
  <span className={cn("text-xs", Math.abs(gap) < 0.05 ? "text-muted" : gap < 0 ? "text-down" : "text-up")}>
    {formatGap(gap)}
  </span>
);

type SortHeaderProps = {
  field: SortField;
  sort: SortField;
  asc: boolean;
  onSort: (f: SortField) => void;
  children: string;
  className?: string;
};

const SortHeader = ({ field, sort, asc, onSort, children, className }: SortHeaderProps) => (
  <th
    scope="col"
    className={cn("px-3 py-[18px] font-medium", className)}
    aria-sort={sort === field ? (asc ? "ascending" : "descending") : "none"}
  >
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn("inline-flex items-center gap-1 uppercase hover:text-fg", sort === field && "text-fg")}
    >
      {children}
      <ArrowsDownUpIcon size={11} aria-hidden="true" />
    </button>
  </th>
);

export const FiiTable = ({ assets, filter, onEdit, onDelete }: FiiTableProps) => {
  const [sort, setSort] = useState<SortField>("invested");
  const [asc, setAsc] = useState(false);
  const [open, setOpen] = useState<PositionRow | null>(null);

  const all = positionRows(assets);
  const rows = all
    .filter((r) => filter === "all" || r.asset.type === filter)
    .toSorted((x, y) => {
      const direction = asc ? 1 : -1;
      if (sort === "ticker") return x.asset.ticker.localeCompare(y.asset.ticker) * direction;
      if (sort === "gap") return (x.gap - y.gap) * direction;
      return (x.invested - y.invested) * direction;
    });

  const totalShares = all.reduce((acc, r) => acc + r.asset.shares, 0);
  const invested = all.reduce((acc, r) => acc + r.invested, 0);
  const income = all.reduce((acc, r) => acc + r.income, 0);
  const maxWeight = Math.max(...rows.map((r) => Math.max(r.weight, r.target)), 0);

  function onSort(field: SortField) {
    if (field === sort) setAsc(!asc);
    else {
      setSort(field);
      // ticker de A a Z; abaixo da meta primeiro; maior investido primeiro
      setAsc(field !== "invested");
    }
  }

  const actions = (a: Asset) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => onEdit(a)} aria-label={`Editar ${a.ticker}`}>
        <PencilSimpleIcon size={18} />
      </Button>
      <Button variant="danger" size="icon" onClick={() => onDelete(a)} aria-label={`Excluir ${a.ticker}`}>
        <TrashSimpleIcon size={18} />
      </Button>
    </div>
  );

  return (
    <>
      {/* Celular: lista; cada fundo abre os detalhes e as ações. */}
      <ul className="overflow-hidden rounded-2xl border border-line bg-surface md:hidden">
        {rows.map((r, i) => (
          <li key={r.asset.id} className={cn(i > 0 && "border-t border-hairline")}>
            <button
              type="button"
              onClick={() => setOpen(r)}
              className={cn(
                "flex w-full items-center gap-3 px-3.5 py-[11px] text-left tabular-nums",
                r.asset.shares === 0 && "opacity-60",
              )}
            >
              <span className={cn("h-9 w-1 shrink-0 rounded", typeBar(r.asset))} aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="font-mono text-sm font-medium">{r.asset.ticker}</span>
                <span className="text-xs text-muted">
                  {formatNumber(r.asset.shares)} cotas · PM {formatBRL(r.asset.averagePrice)}
                </span>
              </span>
              <span className="flex flex-col items-end gap-[3px]">
                <span className="text-sm font-semibold">{formatBRL(r.invested)}</span>
                <span className="text-xs text-muted">
                  {formatPct(r.weight)} / meta {formatPct(r.target)}
                </span>
              </span>
              <CaretRightIcon size={14} className="shrink-0 text-faint" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {/* Computador: tabela. */}
      <div className="hidden overflow-x-auto rounded-[20px] border border-line bg-surface md:block">
        <table className="w-full min-w-[960px] border-collapse tabular-nums">
          <caption className="sr-only">Fundos da carteira</caption>
          <thead>
            <tr className="text-left font-mono text-[11px] tracking-[0.06em] text-subtle uppercase">
              <SortHeader field="ticker" sort={sort} asc={asc} onSort={onSort} className="pl-6 text-left">
                Fundo
              </SortHeader>
              <th scope="col" className="px-3 py-[18px] text-right font-medium">
                Cotas
              </th>
              <th scope="col" className="px-3 py-[18px] text-right font-medium">
                Preço médio
              </th>
              <SortHeader field="invested" sort={sort} asc={asc} onSort={onSort} className="text-right">
                Investido
              </SortHeader>
              <SortHeader field="gap" sort={sort} asc={asc} onSort={onSort} className="pl-7 text-left">
                Peso / meta
              </SortHeader>
              <th scope="col" className="px-3 py-[18px] text-right font-medium">
                Rendimento
              </th>
              <th scope="col" className="px-6 py-[18px] text-right font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.asset.id} className={cn("border-t border-hairline", r.asset.shares === 0 && "opacity-60")}>
                <th scope="row" className="py-4 pr-3 pl-6 text-left font-normal">
                  <div className="flex items-center gap-3.5">
                    <span className={cn("h-9 w-1 rounded", typeBar(r.asset))} aria-hidden="true" />
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[15px] font-medium">
                        {r.asset.ticker}
                        {r.asset.shares === 0 && <span className="ml-2 font-sans text-xs text-muted">sem cotas</span>}
                      </span>
                      <span className="text-xs text-muted">
                        {formatKind(r.asset)} · nota {r.asset.rating}
                      </span>
                    </div>
                  </div>
                </th>
                <td className="px-3 py-4 text-right text-sm">{formatNumber(r.asset.shares)}</td>
                <td className="px-3 py-4 text-right text-sm text-muted">{formatBRL(r.asset.averagePrice)}</td>
                <td className="px-3 py-4 text-right text-sm font-semibold">{formatBRL(r.invested)}</td>
                <td className="py-4 pr-3 pl-7">
                  <div className="flex items-center gap-2.5">
                    <span className="relative h-1.5 w-20 rounded-full bg-hairline" aria-hidden="true">
                      <span
                        className={cn("block h-1.5 rounded-full", typeBar(r.asset))}
                        style={{ width: `${maxWeight > 0 ? (r.weight / maxWeight) * 100 : 0}%` }}
                      />
                      <span
                        className="absolute -top-1 h-3.5 w-0.5 -translate-x-1/2 rounded-sm bg-fg"
                        style={{ left: `${maxWeight > 0 ? (r.target / maxWeight) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[13px]">
                        {formatPct(r.weight)} <span className="text-faint">/ {formatPct(r.target)}</span>
                      </span>
                      <Gap gap={r.gap} />
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 text-right">
                  <span className="flex flex-col items-end">
                    <span className="text-sm">{formatBRL(r.income)}</span>
                    <span className="text-xs text-muted">{formatDividend(r.asset.lastDividend)} por cota</span>
                  </span>
                </td>
                <td className="px-6 py-4">{actions(r.asset)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-sunken">
              <th scope="row" className="px-6 py-5 text-left text-sm font-medium text-muted">
                Total
              </th>
              <td className="px-3 py-5 text-right text-sm">{formatNumber(totalShares)}</td>
              <td className="px-3 py-5" />
              <td className="px-3 py-5 text-right text-base font-semibold">{formatBRL(invested)}</td>
              <td className="py-5 pr-3 pl-7 text-[13px] text-muted">100%</td>
              <td className="px-3 py-5 text-right text-sm font-semibold">{formatBRL(income)}</td>
              <td className="px-6 py-5" />
            </tr>
          </tfoot>
        </table>
      </div>

      <Modal open={!!open} title={open?.asset.ticker ?? ""} onClose={() => setOpen(null)}>
        {open && (
          <div className="flex flex-col gap-5 tabular-nums">
            <p className="text-sm text-muted">{formatKind(open.asset)}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted">Cotas</dt>
              <dd className="text-right">{formatNumber(open.asset.shares)}</dd>
              <dt className="text-muted">Preço médio</dt>
              <dd className="text-right">{formatBRL(open.asset.averagePrice)}</dd>
              <dt className="text-muted">Investido</dt>
              <dd className="text-right font-semibold">{formatBRL(open.invested)}</dd>
              <dt className="text-muted">Peso</dt>
              <dd className="text-right">{formatPct(open.weight)}</dd>
              <dt className="text-muted">Nota e meta</dt>
              <dd className="text-right">
                {open.asset.rating} · {formatPct(open.target)}
              </dd>
              <dt className="text-muted">Último rendimento</dt>
              <dd className="text-right">{formatDividend(open.asset.lastDividend)}</dd>
              <dt className="text-muted">Proventos esperados</dt>
              <dd className="text-right font-semibold">{formatBRL(open.income)}</dd>
            </dl>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setOpen(null); onEdit(open.asset); }}>
                Editar
              </Button>
              <Button variant="outline" className="text-down" onClick={() => { setOpen(null); onDelete(open.asset); }}>
                Excluir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
