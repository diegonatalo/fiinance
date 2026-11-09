import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useCarteiraContext } from "../contexts/carteira-context";
import { formatBRL, formatPct } from "../lib/format";
import { alocacaoAtual, sugerirAporte } from "../lib/metas";
import { parseDecimal } from "../lib/numero";
import { valorPosicao } from "../lib/resumo";
import { TargetIcon } from "@phosphor-icons/react";

function Barra({
  nome,
  atual,
  meta,
}: {
  nome: string;
  atual: number;
  meta: number | null;
}) {
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-zinc-700 dark:text-zinc-200">
          {nome}
        </span>
        <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
          {formatPct(atual)}
          {meta !== null && ` / meta ${formatPct(meta, 0)}`}
        </span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.min(100, atual)}%` }}
        />
        {meta !== null && (
          <div
            className="absolute -top-0.5 h-3.5 w-0.5 bg-zinc-900 dark:bg-zinc-100"
            style={{ left: `${meta}%` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

export function MetasCard() {
  const { ativos, dados, definirMetaPapel } = useCarteiraContext();
  const [rascunho, setRascunho] = useState<string | null>(null);

  const papel = ativos
    .filter((a) => a.tipo === "papel")
    .reduce((acc, a) => acc + valorPosicao(a), 0);
  const tijolo = ativos
    .filter((a) => a.tipo === "tijolo")
    .reduce((acc, a) => acc + valorPosicao(a), 0);
  const { papelPct, tijoloPct } = alocacaoAtual(papel, tijolo);
  const meta = dados.metaPapel;
  const sugestao = meta !== null ? sugerirAporte(papel, tijolo, meta) : null;

  function salvar() {
    if (rascunho === null) return;
    const n = parseDecimal(rascunho);
    if (rascunho.trim() === "") definirMetaPapel(null);
    else if (Number.isFinite(n) && n >= 0 && n <= 100) definirMetaPapel(n);
    setRascunho(null);
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <TargetIcon size={16} className="text-emerald-500" />
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Meta de alocação
        </CardTitle>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Defina quanto da carteira quer em papel; o restante fica em tijolo.
        Comparação feita pelo valor investido.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <label className="grid max-w-48 gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Meta em papel (%)
            </span>
            <Input
              inputMode="decimal"
              placeholder="ex.: 40"
              value={rascunho ?? (meta === null ? "" : String(meta).replace(".", ","))}
              onChange={(e) => setRascunho(e.target.value)}
              onBlur={salvar}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </label>
          {sugestao && (
            <p className="rounded-lg bg-zinc-100 px-3 py-2.5 text-sm text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
              Para chegar na meta só com compras, aporte cerca de{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(sugestao.aporte)}
              </span>{" "}
              em <span className="font-semibold">{sugestao.classe}</span>.
            </p>
          )}
          {meta !== null && !sugestao && papel + tijolo > 0 && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Carteira alinhada com a meta.
            </p>
          )}
        </div>

        <div className="grid content-start gap-3">
          <Barra nome="Papel" atual={papelPct} meta={meta} />
          <Barra
            nome="Tijolo"
            atual={tijoloPct}
            meta={meta === null ? null : 100 - meta}
          />
        </div>
      </div>
    </Card>
  );
}
