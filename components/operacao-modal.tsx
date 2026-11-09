import { useState } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { useCarteiraContext } from "../contexts/carteira-context";
import { useToast } from "../contexts/toast-context";
import { cn, formatBRL, formatNumber } from "../lib/format";
import { dataValida, hoje } from "../lib/data";
import { parseDecimal } from "../lib/numero";
import { cotasEm } from "../lib/posicao";
import type { Fii, TipoOperacao } from "../models/fii";

export interface OperacaoInicial {
  tipo?: TipoOperacao;
  cotas?: number;
  preco?: number;
}

interface OperacaoModalProps {
  ativo: Fii | null;
  inicial?: OperacaoInicial;
  onClose: () => void;
}

export function OperacaoModal({ ativo, inicial, onClose }: OperacaoModalProps) {
  return (
    <Modal
      open={!!ativo}
      title={ativo ? `Registrar operação — ${ativo.ticker}` : "Registrar operação"}
      onClose={onClose}
    >
      {ativo && (
        <OperacaoForm
          key={ativo.id}
          ativo={ativo}
          inicial={inicial}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

interface OperacaoFormProps {
  ativo: Fii;
  inicial?: OperacaoInicial;
  onClose: () => void;
}

function OperacaoForm({ ativo, inicial, onClose }: OperacaoFormProps) {
  const { dados, registrarOperacao } = useCarteiraContext();
  const notify = useToast();
  const [tipo, setTipo] = useState<TipoOperacao>(inicial?.tipo ?? "compra");
  const [data, setData] = useState(hoje);
  const [cotas, setCotas] = useState(
    inicial?.cotas ? String(inicial.cotas) : "",
  );
  const [preco, setPreco] = useState(
    inicial?.preco ? String(inicial.preco).replace(".", ",") : "",
  );
  const [erros, setErros] = useState<{
    data?: string;
    cotas?: string;
    preco?: string;
  }>({});

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof erros = {};
    const qtd = parseDecimal(cotas);
    const valor = parseDecimal(preco);

    if (!dataValida(data)) e.data = "Data inválida";
    else if (data > hoje()) e.data = "Data no futuro";
    if (!Number.isInteger(qtd) || qtd <= 0)
      e.cotas = "Use um número inteiro maior que 0";
    else if (
      tipo === "venda" &&
      dataValida(data) &&
      qtd > cotasEm(ativo.id, data, dados.transacoes)
    ) {
      e.cotas = "Mais cotas do que você tinha nessa data";
    }
    if (!Number.isFinite(valor) || valor <= 0) e.preco = "Deve ser maior que 0";

    setErros(e);
    if (Object.keys(e).length > 0) return;

    registrarOperacao(ativo.id, { tipo, data, cotas: qtd, preco: valor });
    notify(
      `${tipo === "compra" ? "Compra" : "Venda"} de ${formatNumber(qtd)} cotas de ${ativo.ticker} registrada`,
    );
    onClose();
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Posição atual: {formatNumber(ativo.cotas)} cotas
        {ativo.cotas > 0 && <> a {formatBRL(ativo.precoMedio)} (preço médio)</>}.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(["compra", "venda"] as TipoOperacao[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
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

      <Field label="Data" error={erros.data}>
        <Input
          type="date"
          value={data}
          max={hoje()}
          onChange={(e) => setData(e.target.value)}
          error={!!erros.data}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Qtd. de cotas" error={erros.cotas}>
          <Input
            inputMode="numeric"
            value={cotas}
            onChange={(e) => setCotas(e.target.value)}
            placeholder="10"
            error={!!erros.cotas}
          />
        </Field>
        <Field label="Preço por cota (R$)" error={erros.preco}>
          <Input
            inputMode="decimal"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="150,00"
            error={!!erros.preco}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Registrar</Button>
      </div>
    </form>
  );
}
