import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber, formatSignedPct } from "@/lib/format";
import { positionValue } from "@/lib/summary";
import type { Quote, Fii, FiiType } from "@/types/fii";
import {
  ArrowsDownUpIcon,
  PencilSimpleIcon,
  PlusMinusIcon,
  TrashSimpleIcon,
  WalletIcon,
} from "@phosphor-icons/react";

type FiiTableProps = {
  assets: Fii[];
  quotes: Record<string, Quote>;
  total: number;
  onEdit: (fii: Fii) => void;
  onDelete: (fii: Fii) => void;
  onOperation: (fii: Fii) => void;
};

type FieldName = "ticker" | "investido" | "resultado";
type Filter = "todos" | FiiType;

type Row = {
  asset: Fii;
  invested: number;
  quote?: number;
  /** variação da cotação sobre o preço médio, em % */
  resultPct?: number;
  result?: number;
};

function buildRow(asset: Fii, quotes: Record<string, Quote>): Row {
  const invested = positionValue(asset);
  const quote = quotes[asset.id]?.price;
  if (quote === undefined || asset.shares === 0) {
    return { asset, invested, quote };
  }
  const result = asset.shares * quote - invested;
  return {
    asset,
    invested,
    quote,
    result,
    resultPct: invested > 0 ? (result / invested) * 100 : 0,
  };
}

const Result = ({ row }: { row: Row }) => {
  if (row.result === undefined || row.resultPct === undefined) {
    return <span className="text-zinc-400 dark:text-zinc-600">—</span>;
  }
  const positive = row.result >= 0;
  return (
    <span
      className={cn(
        "tabular-nums",
        positive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      )}
    >
      {formatBRL(row.result)}{" "}
      <span className="text-xs">({formatSignedPct(row.resultPct)})</span>
    </span>
  );
};

const TypeBadge = ({ asset }: { asset: Fii }) => {
  return (
    <span
      className={
        asset.type === "papel"
          ? "rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium capitalize text-emerald-600 dark:text-emerald-400"
          : "rounded-md bg-zinc-200/70 px-2 py-0.5 text-xs font-medium capitalize text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-300"
      }
    >
      {asset.type} · {asset.segment}
    </span>
  );
};

type ThProps = {
  c: FieldName;
  asset: FieldName;
  asc: boolean;
  onSort: (c: FieldName) => void;
  children: string;
  right?: boolean;
};

const Th = ({ c, asset, asc, onSort, children, right }: ThProps) => {
  return (
    <th
      className={cn("px-3 py-3 font-medium", right && "text-right")}
      aria-sort={asset === c ? (asc ? "ascending" : "descending") : "none"}
    >
      <button
        onClick={() => onSort(c)}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-wide outline-none hover:text-zinc-900 focus-visible:text-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:text-zinc-100",
          asset === c && "text-zinc-900 dark:text-zinc-100",
        )}
      >
        {children}
        <ArrowsDownUpIcon size={12} />
      </button>
    </th>
  );
};

export const FiiTable = ({
  assets,
  quotes,
  total,
  onEdit,
  onDelete,
  onOperation,
}: FiiTableProps) => {
  const [field, setField] = useState<FieldName>("ticker");
  const [asc, setAsc] = useState(true);
  const [filter, setFilter] = useState<Filter>("todos");

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <WalletIcon size={22} />
        </div>
        <div>
          <p className="font-medium text-zinc-700 dark:text-zinc-200">
            Carteira vazia
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Adicione seu primeiro FII no formulário acima.
          </p>
        </div>
      </div>
    );
  }

  const rows = assets
    .filter((a) => filter === "todos" || a.type === filter)
    .map((a) => buildRow(a, quotes))
    .toSorted((x, y) => {
      const direction = asc ? 1 : -1;
      if (field === "ticker") return x.asset.ticker.localeCompare(y.asset.ticker) * direction;
      if (field === "investido") return (x.invested - y.invested) * direction;
      // sem cotação vai sempre para o fim
      if (x.resultPct === undefined) return 1;
      if (y.resultPct === undefined) return -1;
      return (x.resultPct - y.resultPct) * direction;
    });

  function sort(fresh: FieldName) {
    if (fresh === field) setAsc(!asc);
    else {
      setField(fresh);
      setAsc(fresh === "ticker");
    }
  }

  const actions = (a: Fii) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        onClick={() => onOperation(a)}
        className="px-2!"
        aria-label={`Registrar operação de ${a.ticker}`}
        title="Registrar compra ou venda"
      >
        <PlusMinusIcon size={16} />
      </Button>
      <Button
        variant="ghost"
        onClick={() => onEdit(a)}
        className="px-2!"
        aria-label={`Editar ${a.ticker}`}
      >
        <PencilSimpleIcon size={16} />
      </Button>
      <Button
        variant="danger"
        onClick={() => onDelete(a)}
        className="px-2!"
        aria-label={`Excluir ${a.ticker}`}
      >
        <TrashSimpleIcon size={16} />
      </Button>
    </div>
  );

  return (
    <div className="grid gap-3">
      <div className="flex gap-1.5" role="group" aria-label="Filtrar por tipo">
        {(["todos", "tijolo", "papel"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === f
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Mobile: cartões */}
      <ul className="grid gap-2 sm:hidden">
        {rows.map((l) => (
          <li
            key={l.asset.id}
            className={cn(
              "rounded-lg border border-zinc-200 p-3 dark:border-zinc-800",
              l.asset.shares === 0 && "opacity-60",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{l.asset.ticker}</p>
                <TypeBadge asset={l.asset} />
              </div>
              {actions(l.asset)}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <dt className="text-zinc-500 dark:text-zinc-400">Cotas</dt>
              <dd className="text-right tabular-nums">
                {formatNumber(l.asset.shares)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Preço médio</dt>
              <dd className="text-right tabular-nums">
                {formatBRL(l.asset.averagePrice)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Cotação</dt>
              <dd className="text-right tabular-nums">
                {l.quote !== undefined ? formatBRL(l.quote) : "—"}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Investido</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatBRL(l.invested)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Resultado</dt>
              <dd className="text-right">
                <Result row={l} />
              </dd>
            </dl>
          </li>
        ))}
        <li className="flex justify-between px-1 pt-1 text-sm">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            Total investido
          </span>
          <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBRL(total)}
          </span>
        </li>
      </ul>

      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <Th c="ticker" asset={field} asc={asc} onSort={sort}>Ativo</Th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Cotas
              </th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Preço médio
              </th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Cotação
              </th>
              <Th c="investido" asset={field} asc={asc} onSort={sort} right>
                Investido
              </Th>
              <Th c="resultado" asset={field} asc={asc} onSort={sort} right>
                Resultado
              </Th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr
                key={l.asset.id}
                className={cn(
                  "border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40",
                  l.asset.shares === 0 && "opacity-60",
                )}
              >
                <td className="px-3 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {l.asset.ticker}
                    {l.asset.shares === 0 && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">
                        zerado
                      </span>
                    )}
                  </p>
                  <TypeBadge asset={l.asset} />
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {formatNumber(l.asset.shares)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {formatBRL(l.asset.averagePrice)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {l.quote !== undefined ? formatBRL(l.quote) : "—"}
                </td>
                <td className="px-3 py-3 text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                  {formatBRL(l.invested)}
                </td>
                <td className="px-3 py-3 text-right">
                  <Result row={l} />
                </td>
                <td className="px-3 py-3">{actions(l.asset)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-zinc-200 dark:border-zinc-700">
              <td
                colSpan={4}
                className="px-3 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400"
              >
                Total investido
              </td>
              <td className="px-3 py-3 text-right text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatBRL(total)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
