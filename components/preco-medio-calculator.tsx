import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { cn, formatBRL, formatNumber, formatPctSinal } from "../lib/format";
import { simularPrecoMedio } from "../lib/preco-medio";
import { parseDecimal, parseDecimalOuZero } from "../lib/numero";
import type { Fii } from "../models/fii";
import {
  ArrowRightIcon,
  CalculatorIcon,
  PlusMinusIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

interface PrecoMedioCalcProps {
  ativos: Fii[];
  /** abre o registro de compra com os valores da simulação */
  onRegistrar: (ativo: Fii, cotas: number, preco: number) => void;
}

export function PrecoMedioCalc({ ativos, onRegistrar }: PrecoMedioCalcProps) {
  const [ativoId, setAtivoId] = useState<string>("");
  const [cotasAtuaisManuais, setCotasAtuaisManuais] = useState("");
  const [precoAtualManual, setPrecoAtualManual] = useState("");
  const [novasCotas, setNovasCotas] = useState("");
  const [precoNovo, setPrecoNovo] = useState("");

  const ativoSelecionado = ativos.find((a) => a.id === ativoId) ?? null;

  const cotasAtuais = ativoSelecionado
    ? ativoSelecionado.cotas
    : parseDecimalOuZero(cotasAtuaisManuais);
  const precoAtual = ativoSelecionado
    ? ativoSelecionado.precoMedio
    : parseDecimalOuZero(precoAtualManual);

  const qtdNova = parseDecimal(novasCotas);
  const pNovo = parseDecimal(precoNovo);
  const resultado = simularPrecoMedio(cotasAtuais, precoAtual, qtdNova, pNovo);

  function handleAtivo(id: string) {
    setAtivoId(id);
    if (id) {
      setCotasAtuaisManuais("");
      setPrecoAtualManual("");
    }
  }

  // baixou o preço médio = bom (verde), subiu = laranja
  const baixou = resultado ? resultado.variacao <= 0 : false;
  const podeRegistrar =
    !!ativoSelecionado && !!resultado && Number.isInteger(qtdNova);

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <CalculatorIcon size={16} className="text-emerald-500" />
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Calculadora de Preço Médio
        </CardTitle>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Simule um novo aporte e veja qual seria o seu novo preço médio. Nada é
        salvo até você registrar a compra.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-4">
          <Field label="Usar ativo da carteira (opcional)">
            <Select
              value={ativoId}
              onChange={(e) => handleAtivo(e.target.value)}
            >
              <option value="">Informar posição manualmente</option>
              {ativos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.ticker} — {formatNumber(a.cotas)} cotas a{" "}
                  {formatBRL(a.precoMedio)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cotas atuais">
              <Input
                inputMode="numeric"
                disabled={!!ativoSelecionado}
                value={
                  ativoSelecionado ? ativoSelecionado.cotas : cotasAtuaisManuais
                }
                onChange={(e) => setCotasAtuaisManuais(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Preço médio atual (R$)">
              <Input
                inputMode="decimal"
                disabled={!!ativoSelecionado}
                value={
                  ativoSelecionado
                    ? String(ativoSelecionado.precoMedio.toFixed(2)).replace(".", ",")
                    : precoAtualManual
                }
                onChange={(e) => setPrecoAtualManual(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Novas cotas compradas">
              <Input
                inputMode="numeric"
                value={novasCotas}
                onChange={(e) => setNovasCotas(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Preço pago por cota (R$)">
              <Input
                inputMode="decimal"
                value={precoNovo}
                onChange={(e) => setPrecoNovo(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>
        </div>

        {/* Resultado */}
        <div className="flex min-h-40 flex-col justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
          {!resultado ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <CalculatorIcon
                size={22}
                className="text-zinc-300 dark:text-zinc-600"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Preencha sua posição atual e o novo aporte para ver o novo preço
                médio.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Preço médio atual
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatBRL(precoAtual)}
                  </p>
                </div>
                <ArrowRightIcon
                  size={18}
                  className="shrink-0 text-zinc-400 dark:text-zinc-600"
                />
                <div className="text-right">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Novo preço médio
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatBRL(resultado.novoPrecoMedio)}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  baixou
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                )}
              >
                {baixou ? (
                  <TrendDownIcon size={16} />
                ) : (
                  <TrendUpIcon size={16} />
                )}
                Preço médio {baixou ? "cai" : "sobe"}{" "}
                {formatBRL(Math.abs(resultado.variacao))} (
                {formatPctSinal(resultado.variacaoPct)})
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Total de cotas
                  </p>
                  <p className="font-semibold tabular-nums">
                    {formatNumber(resultado.totalCotas)}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Aporte
                  </p>
                  <p className="font-semibold tabular-nums">
                    {formatBRL(resultado.aporte)}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Novo total investido
                  </p>
                  <p className="font-semibold tabular-nums">
                    {formatBRL(resultado.novoTotalInvestido)}
                  </p>
                </div>
              </div>

              {podeRegistrar && (
                <Button
                  variant="outline"
                  onClick={() => onRegistrar(ativoSelecionado, qtdNova, pNovo)}
                >
                  <PlusMinusIcon size={16} /> Registrar esta compra
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
