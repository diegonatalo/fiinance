import { useId, useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { cn } from "@/lib/cn";
import { today, isValidDate } from "@/lib/date";
import { useToday } from "@/hooks/use-today";
import { parseDecimal } from "@/lib/numbers";
import { LIMITS, TICKER_REGEX, toCents } from "@/lib/validation";
import {
  PAPER_SEGMENTS,
  BRICK_SEGMENTS,
  type Asset,
  type Fii,
  type FiiType,
  type Segment,
} from "@/types/fii";
import { FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";

export type FiiFormValues = {
  asset: Omit<Asset, "id">;
  /** presente só ao cadastrar um ativo novo */
  buy?: { date: string; shares: number; price: number };
};

type FiiFormProps = {
  onSubmit: (values: FiiFormValues) => void;
  /** quando informado, o formulário edita o cadastro do ativo (sem cotas/preço) */
  initial?: Fii | null;
  onCancel?: () => void;
  /** devolve o ativo que já usa o ticker, se houver */
  tickerInUse: (ticker: string, ignoreId?: string) => Asset | undefined;
};

type FormErrors = {
  ticker?: string;
  date?: string;
  shares?: string;
  averagePrice?: string;
};

export const FiiForm = ({
  onSubmit,
  initial,
  onCancel,
  tickerInUse,
}: FiiFormProps) => {
  const [ticker, setTicker] = useState(initial?.ticker ?? "");
  const [type, setType] = useState<FiiType>(initial?.type ?? "tijolo");
  const [segment, setSegment] = useState<Segment>(
    initial?.segment ?? "lajes",
  );
  const todayValue = useToday();
  const [typedDate, setDate] = useState<string | null>(null);
  const date = typedDate ?? todayValue;
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const typeLabel = useId();

  const segments = type === "papel" ? PAPER_SEGMENTS : BRICK_SEGMENTS;
  const normalizedTicker = ticker.trim().toUpperCase();
  const duplicate = normalizedTicker
    ? tickerInUse(normalizedTicker, initial?.id)
    : undefined;

  function handleType(fresh: FiiType) {
    setType(fresh);
    setSegment(fresh === "papel" ? "IPCA" : "lajes");
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!normalizedTicker) e.ticker = "Informe o ticker";
    else if (!TICKER_REGEX.test(normalizedTicker))
      e.ticker = "Formato inválido (ex.: HGLG11)";
    else if (initial && duplicate) e.ticker = "Ticker já cadastrado";

    if (!initial) {
      if (!isValidDate(date)) e.date = "Data inválida";
      else if (date > today()) e.date = "Data no futuro";

      const qty = parseDecimal(shares);
      if (!shares.trim()) e.shares = "Informe a quantidade";
      else if (!Number.isInteger(qty) || qty <= 0)
        e.shares = "Use um número inteiro maior que 0";
      else if (qty > LIMITS.shares) e.shares = "Quantidade grande demais";

      const amount = parseDecimal(price);
      if (!price.trim()) e.averagePrice = "Informe o preço";
      else if (!Number.isFinite(amount) || amount <= 0)
        e.averagePrice = "Deve ser maior que 0";
      else if (toCents(amount, LIMITS.priceCents) === null)
        e.averagePrice = "Use no máximo 2 casas decimais";
    }
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit({
      asset: { ticker: normalizedTicker, type, segment },
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

        <div role="group" aria-labelledby={typeLabel} className="grid gap-2">
          <span id={typeLabel} className="text-[13px] text-muted">
            Tipo
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["tijolo", "papel"] as FiiType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleType(t)}
                aria-pressed={type === t}
                className={cn(
                  "h-12 rounded-xl border text-[15px] font-medium capitalize transition-colors",
                  type === t
                    ? t === "papel"
                      ? "border-paper bg-paper/10 text-paper-strong"
                      : "border-brick bg-brick/10 text-brick-strong"
                    : "border-line text-muted hover:bg-raised hover:text-fg",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
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
              max={todayValue}
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

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {initial ? (
            <>
              <FloppyDiskIcon size={16} aria-hidden="true" /> Salvar alterações
            </>
          ) : (
            <>
              <PlusIcon size={16} weight="bold" aria-hidden="true" /> Adicionar FII
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
