import { useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { cn } from "@/lib/format";
import { today, isValidDate } from "@/lib/date";
import { parseDecimal } from "@/lib/numbers";
import { TICKER_REGEX } from "@/lib/data";
import {
  PAPER_SEGMENTS,
  BRICK_SEGMENTS,
  type Asset,
  type Fii,
  type FiiType,
  type Segment,
} from "@/types/fii";
import { FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";

export interface FiiFormValues {
  asset: Omit<Asset, "id">;
  /** presente só ao cadastrar um ativo novo */
  buy?: { date: string; shares: number; price: number };
}

interface FiiFormProps {
  onSubmit: (values: FiiFormValues) => void;
  /** quando informado, o formulário edita o cadastro do ativo (sem cotas/preço) */
  initial?: Fii | null;
  onCancel?: () => void;
  /** devolve o ativo que já usa o ticker, se houver */
  tickerInUse: (ticker: string, ignoreId?: string) => Asset | undefined;
}

interface FormErrors {
  ticker?: string;
  date?: string;
  shares?: string;
  averagePrice?: string;
}

export function FiiForm({
  onSubmit,
  initial,
  onCancel,
  tickerInUse,
}: FiiFormProps) {
  const [ticker, setTicker] = useState(initial?.ticker ?? "");
  const [type, setType] = useState<FiiType>(initial?.type ?? "tijolo");
  const [segment, setSegment] = useState<Segment>(
    initial?.segment ?? "lajes",
  );
  const [date, setDate] = useState(today);
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const segments = type === "papel" ? PAPER_SEGMENTS : BRICK_SEGMENTS;
  const tickerNormalizado = ticker.trim().toUpperCase();
  const duplicate = tickerNormalizado
    ? tickerInUse(tickerNormalizado, initial?.id)
    : undefined;

  function handleType(fresh: FiiType) {
    setType(fresh);
    setSegment(fresh === "papel" ? "IPCA" : "lajes");
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!tickerNormalizado) e.ticker = "Informe o ticker";
    else if (!TICKER_REGEX.test(tickerNormalizado))
      e.ticker = "Formato inválido (ex.: HGLG11)";
    else if (initial && duplicate) e.ticker = "Ticker já cadastrado";

    if (!initial) {
      if (!isValidDate(date)) e.date = "Data inválida";
      else if (date > today()) e.date = "Data no futuro";

      const qty = parseDecimal(shares);
      if (!shares.trim()) e.shares = "Informe a quantidade";
      else if (!Number.isInteger(qty) || qty <= 0)
        e.shares = "Use um número inteiro maior que 0";

      const amount = parseDecimal(price);
      if (!price.trim()) e.averagePrice = "Informe o preço";
      else if (!Number.isFinite(amount) || amount <= 0)
        e.averagePrice = "Deve ser maior que 0";
    }
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit({
      asset: { ticker: tickerNormalizado, type, segment },
      buy: initial
        ? undefined
        : { date, shares: parseDecimal(shares), price: parseDecimal(price) },
    });

    if (!initial) {
      setTicker("");
      setShares("");
      setPrice("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Ticker"
          error={errors.ticker}
          hint={
            !initial && duplicate
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
            {(["tijolo", "papel"] as FiiType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleType(t)}
                aria-pressed={type === t}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                  type === t
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
            value={segment}
            onChange={(e) => setSegment(e.target.value as Segment)}
            className="capitalize"
          >
            {segments.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        {!initial && (
          <Field label="Data da compra" error={errors.date}>
            <Input
              type="date"
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value)}
              error={!!errors.date}
            />
          </Field>
        )}
      </div>

      {!initial && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Qtd. de cotas" error={errors.shares}>
            <Input
              inputMode="numeric"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="100"
              error={!!errors.shares}
            />
          </Field>

          <Field label="Preço pago por cota (R$)" error={errors.averagePrice}>
            <Input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150,00"
              error={!!errors.averagePrice}
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
