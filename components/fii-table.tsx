import { useState } from "react";
import { ArrowsDownUpIcon, CaretRightIcon, PencilSimpleIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { formatBRL, formatChange, formatDeltaBRL, formatKind, formatNumber, formatPct } from "@/lib/format";
import { positionRows, type PositionRow } from "@/lib/summary";
import type { Fii, FiiType, Quote } from "@/types/fii";

export type TypeFilter = "all" | FiiType;

type FiiTableProps = {
  assets: Fii[];
  quotes: Record<string, Quote>;
  filter: TypeFilter;
  onEdit: (fii: Fii) => void;
  onDelete: (fii: Fii) => void;
  onOperation: (fii: Fii) => void;
};

type SortField = "ticker" | "value" | "result";

const typeBar = (asset: Fii) => (asset.type === "papel" ? "bg-paper" : "bg-brick");
const tone = (value: number) => (value >= 0 ? "text-up" : "text-down");

const BuySellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" />
  </svg>
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

const Plain = ({ children, className }: { children: string; className?: string }) => (
  <th scope="col" className={cn("px-3 py-[18px] text-right font-medium", className)}>
    {children}
  </th>
);

export const FiiTable = ({ assets, quotes, filter, onEdit, onDelete, onOperation }: FiiTableProps) => {
  const [sort, setSort] = useState<SortField>("value");
  const [asc, setAsc] = useState(false);
  const [open, setOpen] = useState<PositionRow | null>(null);

  const all = positionRows(assets, quotes);
  const rows = all
    .filter((r) => filter === "all" || r.asset.type === filter)
    .toSorted((x, y) => {
      const direction = asc ? 1 : -1;
      if (sort === "ticker") return x.asset.ticker.localeCompare(y.asset.ticker) * direction;
      if (sort === "value") return (x.value - y.value) * direction;
      // sem cotação vai sempre para o fim
      if (x.resultPct === undefined) return 1;
      if (y.resultPct === undefined) return -1;
      return (x.resultPct - y.resultPct) * direction;
    });

  const held = all.filter((r) => r.asset.shares > 0);
  const totalShares = held.reduce((acc, r) => acc + r.asset.shares, 0);
  const invested = held.reduce((acc, r) => acc + r.invested, 0);
  const value = held.reduce((acc, r) => acc + r.value, 0);
  const allQuoted = held.length > 0 && held.every((r) => r.quote !== undefined);
  const maxWeight = Math.max(...rows.map((r) => r.weight), 0);

  function onSort(field: SortField) {
    if (field === sort) setAsc(!asc);
    else {
      setSort(field);
      setAsc(field === "ticker");
    }
  }

  const actions = (a: Fii) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => onOperation(a)} aria-label={`Comprar ou vender ${a.ticker}`}>
        <BuySellIcon />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onEdit(a)} aria-label={`Editar ${a.ticker}`}>
        <PencilSimpleIcon size={18} />
      </Button>
      <Button variant="danger" size="icon" onClick={() => onDelete(a)} aria-label={`Excluir ${a.ticker}`}>
        <TrashSimpleIcon size={18} />
      </Button>
    </div>
  );

  const result = (r: PositionRow, align = "items-end") =>
    r.result === undefined || r.resultPct === undefined ? (
      <span className="text-faint">—</span>
    ) : (
      <span className={cn("flex flex-col gap-0.5", align)}>
        <span className={cn("text-sm font-medium", tone(r.result))}>{formatDeltaBRL(r.result)}</span>
        <span className={cn("text-xs", tone(r.result))}>{formatChange(r.resultPct)}</span>
      </span>
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
                <span className="text-sm font-semibold">{formatBRL(r.value)}</span>
                {r.resultPct !== undefined && (
                  <span className={cn("text-xs", tone(r.resultPct))}>
                    {r.resultPct >= 0 ? "▲" : "▼"} {formatChange(r.resultPct)}
                  </span>
                )}
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
              <Plain>Cotas</Plain>
              <Plain>Preço médio</Plain>
              <Plain>Cotação</Plain>
              <SortHeader field="value" sort={sort} asc={asc} onSort={onSort} className="text-right">
                Valor hoje
              </SortHeader>
              <SortHeader field="result" sort={sort} asc={asc} onSort={onSort} className="text-right">
                Resultado
              </SortHeader>
              <th scope="col" className="py-[18px] pr-3 pl-7 text-left font-medium">
                Peso
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
                        {r.asset.shares === 0 && <span className="ml-2 font-sans text-xs text-muted">zerado</span>}
                      </span>
                      <span className="text-xs text-muted">{formatKind(r.asset.type, r.asset.segment)}</span>
                    </div>
                  </div>
                </th>
                <td className="px-3 py-4 text-right text-sm">{formatNumber(r.asset.shares)}</td>
                <td className="px-3 py-4 text-right text-sm text-muted">{formatBRL(r.asset.averagePrice)}</td>
                <td className="px-3 py-4 text-right text-sm">{r.quote !== undefined ? formatBRL(r.quote) : "—"}</td>
                <td className="px-3 py-4 text-right text-sm font-semibold">{formatBRL(r.value)}</td>
                <td className="px-3 py-4 text-right">{result(r)}</td>
                <td className="py-4 pr-3 pl-7">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-20 rounded-full bg-hairline" aria-hidden="true">
                      <span
                        className={cn("block h-1.5 rounded-full", typeBar(r.asset))}
                        style={{ width: `${maxWeight > 0 ? (r.weight / maxWeight) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="text-[13px] text-muted">{formatPct(r.weight)}</span>
                  </div>
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
              <td className="px-3 py-5 text-right text-[13px] text-muted">{formatBRL(invested)} investido</td>
              <td className="px-3 py-5" />
              <td className="px-3 py-5 text-right text-base font-semibold">{formatBRL(value)}</td>
              <td className={cn("px-3 py-5 text-right text-sm font-medium", allQuoted ? tone(value - invested) : "text-faint")}>
                {allQuoted ? formatDeltaBRL(value - invested) : "—"}
              </td>
              <td className="py-5 pr-3 pl-7 text-[13px] text-muted">100%</td>
              <td className="px-6 py-5" />
            </tr>
          </tfoot>
        </table>
      </div>

      <Modal open={!!open} title={open?.asset.ticker ?? ""} onClose={() => setOpen(null)}>
        {open && (
          <div className="flex flex-col gap-5 tabular-nums">
            <p className="text-sm text-muted">{formatKind(open.asset.type, open.asset.segment)}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted">Cotas</dt>
              <dd className="text-right">{formatNumber(open.asset.shares)}</dd>
              <dt className="text-muted">Preço médio</dt>
              <dd className="text-right">{formatBRL(open.asset.averagePrice)}</dd>
              <dt className="text-muted">Cotação</dt>
              <dd className="text-right">{open.quote !== undefined ? formatBRL(open.quote) : "—"}</dd>
              <dt className="text-muted">Valor hoje</dt>
              <dd className="text-right font-semibold">{formatBRL(open.value)}</dd>
              <dt className="text-muted">Resultado</dt>
              <dd className="flex justify-end">{result(open)}</dd>
              <dt className="text-muted">Peso</dt>
              <dd className="text-right">{formatPct(open.weight)}</dd>
            </dl>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => { setOpen(null); onOperation(open.asset); }}>
                Operar
              </Button>
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
