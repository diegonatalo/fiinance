import { useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { cn } from "../lib/format";
import { hoje, dataValida } from "../lib/data";
import { parseDecimal } from "../lib/numero";
import { TICKER_REGEX } from "../lib/dados";
import {
  SEGMENTOS_PAPEL,
  SEGMENTOS_TIJOLO,
  type Ativo,
  type Fii,
  type FiiTipo,
  type Segmento,
} from "../models/fii";
import { FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";

export interface FiiFormValues {
  ativo: Omit<Ativo, "id">;
  /** presente só ao cadastrar um ativo novo */
  compra?: { data: string; cotas: number; preco: number };
}

interface FiiFormProps {
  onSubmit: (values: FiiFormValues) => void;
  /** quando informado, o formulário edita o cadastro do ativo (sem cotas/preço) */
  initial?: Fii | null;
  onCancel?: () => void;
  /** devolve o ativo que já usa o ticker, se houver */
  tickerEmUso: (ticker: string, ignorarId?: string) => Ativo | undefined;
}

interface FormErrors {
  ticker?: string;
  data?: string;
  cotas?: string;
  precoMedio?: string;
}

export function FiiForm({
  onSubmit,
  initial,
  onCancel,
  tickerEmUso,
}: FiiFormProps) {
  const [ticker, setTicker] = useState(initial?.ticker ?? "");
  const [tipo, setTipo] = useState<FiiTipo>(initial?.tipo ?? "tijolo");
  const [segmento, setSegmento] = useState<Segmento>(
    initial?.segmento ?? "lajes",
  );
  const [data, setData] = useState(hoje);
  const [cotas, setCotas] = useState("");
  const [preco, setPreco] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const segmentos = tipo === "papel" ? SEGMENTOS_PAPEL : SEGMENTOS_TIJOLO;
  const tickerNormalizado = ticker.trim().toUpperCase();
  const duplicado = tickerNormalizado
    ? tickerEmUso(tickerNormalizado, initial?.id)
    : undefined;

  function handleTipo(novo: FiiTipo) {
    setTipo(novo);
    setSegmento(novo === "papel" ? "IPCA" : "lajes");
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!tickerNormalizado) e.ticker = "Informe o ticker";
    else if (!TICKER_REGEX.test(tickerNormalizado))
      e.ticker = "Formato inválido (ex.: HGLG11)";
    else if (initial && duplicado) e.ticker = "Ticker já cadastrado";

    if (!initial) {
      if (!dataValida(data)) e.data = "Data inválida";
      else if (data > hoje()) e.data = "Data no futuro";

      const qtd = parseDecimal(cotas);
      if (!cotas.trim()) e.cotas = "Informe a quantidade";
      else if (!Number.isInteger(qtd) || qtd <= 0)
        e.cotas = "Use um número inteiro maior que 0";

      const valor = parseDecimal(preco);
      if (!preco.trim()) e.precoMedio = "Informe o preço";
      else if (!Number.isFinite(valor) || valor <= 0)
        e.precoMedio = "Deve ser maior que 0";
    }
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit({
      ativo: { ticker: tickerNormalizado, tipo, segmento },
      compra: initial
        ? undefined
        : { data, cotas: parseDecimal(cotas), preco: parseDecimal(preco) },
    });

    if (!initial) {
      setTicker("");
      setCotas("");
      setPreco("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Ticker"
          error={errors.ticker}
          hint={
            !initial && duplicado
              ? "Já está na carteira: a compra será somada à posição."
              : undefined
          }
        >
          <Input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="HGLG11"
            maxLength={7}
            autoCapitalize="characters"
            error={!!errors.ticker}
          />
        </Field>

        <Field label="Tipo">
          <div className="grid grid-cols-2 gap-2">
            {(["tijolo", "papel"] as FiiTipo[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTipo(t)}
                aria-pressed={tipo === t}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                  tipo === t
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className={cn("grid gap-4", !initial && "sm:grid-cols-2")}>
        <Field label="Segmento">
          <Select
            value={segmento}
            onChange={(e) => setSegmento(e.target.value as Segmento)}
            className="capitalize"
          >
            {segmentos.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        {!initial && (
          <Field label="Data da compra" error={errors.data}>
            <Input
              type="date"
              value={data}
              max={hoje()}
              onChange={(e) => setData(e.target.value)}
              error={!!errors.data}
            />
          </Field>
        )}
      </div>

      {!initial && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Qtd. de cotas" error={errors.cotas}>
            <Input
              inputMode="numeric"
              value={cotas}
              onChange={(e) => setCotas(e.target.value)}
              placeholder="100"
              error={!!errors.cotas}
            />
          </Field>

          <Field label="Preço pago por cota (R$)" error={errors.precoMedio}>
            <Input
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="150,00"
              error={!!errors.precoMedio}
            />
          </Field>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {initial && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {initial ? (
            <>
              <FloppyDiskIcon size={16} /> Salvar alterações
            </>
          ) : (
            <>
              <PlusIcon size={16} /> Adicionar FII
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
