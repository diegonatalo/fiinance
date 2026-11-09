import { useState } from "react";
import { Button } from "./ui/button";
import { cn, formatBRL, formatNumber, formatPctSinal } from "../lib/format";
import { valorPosicao } from "../lib/resumo";
import type { Cotacao, Fii, FiiTipo } from "../models/fii";
import {
  ArrowsDownUpIcon,
  PencilSimpleIcon,
  PlusMinusIcon,
  TrashSimpleIcon,
  WalletIcon,
} from "@phosphor-icons/react";

interface FiiTableProps {
  ativos: Fii[];
  cotacoes: Record<string, Cotacao>;
  total: number;
  onEdit: (fii: Fii) => void;
  onDelete: (fii: Fii) => void;
  onOperacao: (fii: Fii) => void;
}

type Campo = "ticker" | "investido" | "resultado";
type Filtro = "todos" | FiiTipo;

interface Linha {
  ativo: Fii;
  investido: number;
  cotacao?: number;
  /** variação da cotação sobre o preço médio, em % */
  resultadoPct?: number;
  resultado?: number;
}

function montarLinha(ativo: Fii, cotacoes: Record<string, Cotacao>): Linha {
  const investido = valorPosicao(ativo);
  const cotacao = cotacoes[ativo.id]?.preco;
  if (cotacao === undefined || ativo.cotas === 0) {
    return { ativo, investido, cotacao };
  }
  const resultado = ativo.cotas * cotacao - investido;
  return {
    ativo,
    investido,
    cotacao,
    resultado,
    resultadoPct: investido > 0 ? (resultado / investido) * 100 : 0,
  };
}

function Resultado({ linha }: { linha: Linha }) {
  if (linha.resultado === undefined || linha.resultadoPct === undefined) {
    return <span className="text-zinc-400 dark:text-zinc-600">—</span>;
  }
  const positivo = linha.resultado >= 0;
  return (
    <span
      className={cn(
        "tabular-nums",
        positivo
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      )}
    >
      {formatBRL(linha.resultado)}{" "}
      <span className="text-xs">({formatPctSinal(linha.resultadoPct)})</span>
    </span>
  );
}

function TipoBadge({ ativo }: { ativo: Fii }) {
  return (
    <span
      className={
        ativo.tipo === "papel"
          ? "rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium capitalize text-emerald-600 dark:text-emerald-400"
          : "rounded-md bg-zinc-200/70 px-2 py-0.5 text-xs font-medium capitalize text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-300"
      }
    >
      {ativo.tipo} · {ativo.segmento}
    </span>
  );
}

interface ThProps {
  c: Campo;
  ativo: Campo;
  asc: boolean;
  onSort: (c: Campo) => void;
  children: string;
  right?: boolean;
}

function Th({ c, ativo, asc, onSort, children, right }: ThProps) {
  return (
    <th
      className={cn("px-3 py-3 font-medium", right && "text-right")}
      aria-sort={ativo === c ? (asc ? "ascending" : "descending") : "none"}
    >
      <button
        onClick={() => onSort(c)}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-wide outline-none hover:text-zinc-900 focus-visible:text-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:text-zinc-100",
          ativo === c && "text-zinc-900 dark:text-zinc-100",
        )}
      >
        {children}
        <ArrowsDownUpIcon size={12} />
      </button>
    </th>
  );
}

export function FiiTable({
  ativos,
  cotacoes,
  total,
  onEdit,
  onDelete,
  onOperacao,
}: FiiTableProps) {
  const [campo, setCampo] = useState<Campo>("ticker");
  const [asc, setAsc] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  if (ativos.length === 0) {
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

  const linhas = ativos
    .filter((a) => filtro === "todos" || a.tipo === filtro)
    .map((a) => montarLinha(a, cotacoes))
    .toSorted((x, y) => {
      const dir = asc ? 1 : -1;
      if (campo === "ticker") return x.ativo.ticker.localeCompare(y.ativo.ticker) * dir;
      if (campo === "investido") return (x.investido - y.investido) * dir;
      // sem cotação vai sempre para o fim
      if (x.resultadoPct === undefined) return 1;
      if (y.resultadoPct === undefined) return -1;
      return (x.resultadoPct - y.resultadoPct) * dir;
    });

  function ordenar(novo: Campo) {
    if (novo === campo) setAsc(!asc);
    else {
      setCampo(novo);
      setAsc(novo === "ticker");
    }
  }

  const acoes = (a: Fii) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        onClick={() => onOperacao(a)}
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
        {(["todos", "tijolo", "papel"] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-colors",
              filtro === f
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
        {linhas.map((l) => (
          <li
            key={l.ativo.id}
            className={cn(
              "rounded-lg border border-zinc-200 p-3 dark:border-zinc-800",
              l.ativo.cotas === 0 && "opacity-60",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{l.ativo.ticker}</p>
                <TipoBadge ativo={l.ativo} />
              </div>
              {acoes(l.ativo)}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <dt className="text-zinc-500 dark:text-zinc-400">Cotas</dt>
              <dd className="text-right tabular-nums">
                {formatNumber(l.ativo.cotas)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Preço médio</dt>
              <dd className="text-right tabular-nums">
                {formatBRL(l.ativo.precoMedio)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Cotação</dt>
              <dd className="text-right tabular-nums">
                {l.cotacao !== undefined ? formatBRL(l.cotacao) : "—"}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Investido</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatBRL(l.investido)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Resultado</dt>
              <dd className="text-right">
                <Resultado linha={l} />
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
              <Th c="ticker" ativo={campo} asc={asc} onSort={ordenar}>Ativo</Th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Cotas
              </th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Preço médio
              </th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Cotação
              </th>
              <Th c="investido" ativo={campo} asc={asc} onSort={ordenar} right>
                Investido
              </Th>
              <Th c="resultado" ativo={campo} asc={asc} onSort={ordenar} right>
                Resultado
              </Th>
              <th className="px-3 py-3 text-right font-medium uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr
                key={l.ativo.id}
                className={cn(
                  "border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40",
                  l.ativo.cotas === 0 && "opacity-60",
                )}
              >
                <td className="px-3 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {l.ativo.ticker}
                    {l.ativo.cotas === 0 && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">
                        zerado
                      </span>
                    )}
                  </p>
                  <TipoBadge ativo={l.ativo} />
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {formatNumber(l.ativo.cotas)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {formatBRL(l.ativo.precoMedio)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {l.cotacao !== undefined ? formatBRL(l.cotacao) : "—"}
                </td>
                <td className="px-3 py-3 text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                  {formatBRL(l.investido)}
                </td>
                <td className="px-3 py-3 text-right">
                  <Resultado linha={l} />
                </td>
                <td className="px-3 py-3">{acoes(l.ativo)}</td>
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
}
