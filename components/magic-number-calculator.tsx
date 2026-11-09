import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { cn, formatBRL, formatNumber } from "../lib/format";
import { calcularMagicNumber } from "../lib/magic-number";
import { parseDecimal, parseDecimalOuZero } from "../lib/numero";
import type { Cotacao, Fii, Provento } from "../models/fii";
import { SparkleIcon, TargetIcon, TrendUpIcon } from "@phosphor-icons/react";

interface MagicNumberCalcProps {
  ativos: Fii[];
  proventos: Provento[];
  cotacoes: Record<string, Cotacao>;
}

function ultimoProvento(proventos: Provento[], ativoId: string) {
  return proventos
    .filter((p) => p.ativoId === ativoId)
    .toSorted((a, b) => b.data.localeCompare(a.data))[0];
}

function paraCampo(n: number) {
  return String(n).replace(".", ",");
}

export function MagicNumberCalc({
  ativos,
  proventos,
  cotacoes,
}: MagicNumberCalcProps) {
  const [ativoId, setAtivoId] = useState<string>("");
  const [dividendo, setDividendo] = useState("");
  const [cotacao, setCotacao] = useState("");
  const [cotasManuais, setCotasManuais] = useState("");

  const ativoSelecionado = ativos.find((a) => a.id === ativoId) ?? null;
  const cotasAtuais = ativoSelecionado
    ? ativoSelecionado.cotas
    : parseDecimalOuZero(cotasManuais);

  const resultado = calcularMagicNumber(
    parseDecimal(dividendo),
    parseDecimal(cotacao),
    cotasAtuais,
  );

  // Ao escolher um ativo, preenche dividendo (último provento) e cotação (se houver).
  function handleAtivo(id: string) {
    setAtivoId(id);
    if (!id) return;
    setCotasManuais("");
    const ult = ultimoProvento(proventos, id);
    if (ult) setDividendo(paraCampo(ult.valorPorCota));
    const cot = cotacoes[id];
    if (cot) setCotacao(paraCampo(cot.preco));
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <SparkleIcon size={16} className="text-emerald-500" />
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Calculadora de Magic Number
        </CardTitle>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Descubra quantas cotas você precisa para que os dividendos comprem uma
        nova cota todo mês. Ao escolher um ativo, usamos o último provento e a
        cotação registrados.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-4">
          <Field label="Usar ativo da carteira (opcional)">
            <Select
              value={ativoId}
              onChange={(e) => handleAtivo(e.target.value)}
            >
              <option value="">Informar cotas manualmente</option>
              {ativos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.ticker} — {formatNumber(a.cotas)} cotas
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dividendo por cota (R$)">
              <Input
                inputMode="decimal"
                value={dividendo}
                onChange={(e) => setDividendo(e.target.value)}
                placeholder="0,90"
              />
            </Field>
            <Field label="Cotação atual (R$)">
              <Input
                inputMode="decimal"
                value={cotacao}
                onChange={(e) => setCotacao(e.target.value)}
                placeholder="10,30"
              />
            </Field>
          </div>

          <Field label="Cotas que você já possui">
            <Input
              inputMode="numeric"
              disabled={!!ativoSelecionado}
              value={ativoSelecionado ? ativoSelecionado.cotas : cotasManuais}
              onChange={(e) => setCotasManuais(e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>

        {/* Resultado */}
        <div className="flex min-h-40 flex-col justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
          {!resultado ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <TargetIcon
                size={22}
                className="text-zinc-300 dark:text-zinc-600"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Preencha o dividendo e a cotação para ver o resultado.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Magic Number
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatNumber(resultado.magicNumber)}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    cotas necessárias
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Você tem
                  </p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatNumber(cotasAtuais)}
                  </p>
                </div>
              </div>

              <div className="grid gap-1.5">
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(resultado.progresso)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      resultado.atingiu ? "bg-emerald-500" : "bg-emerald-400",
                    )}
                    style={{ width: `${resultado.progresso}%` }}
                  />
                </div>
                <p className="text-right text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                  {resultado.progresso.toFixed(1)}%
                </p>
              </div>

              {resultado.atingiu ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendUpIcon size={16} />
                  Meta atingida! Os dividendos já compram uma nova cota.
                </div>
              ) : (
                <div className="rounded-lg bg-zinc-100 px-3 py-2.5 dark:bg-zinc-800/60">
                  <p className="text-sm text-zinc-700 dark:text-zinc-200">
                    Faltam{" "}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(resultado.faltam)}
                    </span>{" "}
                    cotas — cerca de{" "}
                    <span className="font-semibold">
                      {formatBRL(resultado.aporteFaltante)}
                    </span>{" "}
                    em aportes.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
