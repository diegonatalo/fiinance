import { useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { useCarteiraContext } from "../contexts/carteira-context";
import { useToast } from "../contexts/toast-context";
import { dataValida, hoje } from "../lib/data";
import { formatBRL, formatNumber } from "../lib/format";
import { parseDecimal } from "../lib/numero";
import { cotasEm } from "../lib/posicao";
import { PlusIcon } from "@phosphor-icons/react";

export function ProventoForm() {
  const { ativos, dados, adicionarProvento } = useCarteiraContext();
  const notify = useToast();
  const [ativoId, setAtivoId] = useState("");
  const [data, setData] = useState(hoje);
  const [valor, setValor] = useState("");
  const [erros, setErros] = useState<{
    ativo?: string;
    data?: string;
    valor?: string;
  }>({});

  const ativo = ativos.find((a) => a.id === ativoId);
  const cotas = ativo && dataValida(data) ? cotasEm(ativo.id, data, dados.transacoes) : 0;
  const valorNum = parseDecimal(valor);

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof erros = {};
    if (!ativo) e.ativo = "Escolha o ativo";
    if (!dataValida(data)) e.data = "Data inválida";
    else if (data > hoje()) e.data = "Data no futuro";
    else if (ativo && cotas <= 0) e.data = "Você não tinha cotas nessa data";
    if (!Number.isFinite(valorNum) || valorNum <= 0)
      e.valor = "Deve ser maior que 0";
    setErros(e);
    if (Object.keys(e).length > 0 || !ativo) return;

    adicionarProvento({ ativoId: ativo.id, data, valorPorCota: valorNum, cotas });
    notify(`Provento de ${ativo.ticker} registrado`);
    setValor("");
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Ativo" error={erros.ativo}>
          <Select
            value={ativoId}
            onChange={(e) => setAtivoId(e.target.value)}
            error={!!erros.ativo}
          >
            <option value="">Selecione…</option>
            {ativos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.ticker}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data de pagamento" error={erros.data}>
          <Input
            type="date"
            value={data}
            max={hoje()}
            onChange={(e) => setData(e.target.value)}
            error={!!erros.data}
          />
        </Field>
        <Field
          label="Valor por cota (R$)"
          error={erros.valor}
          hint={
            ativo && cotas > 0 && Number.isFinite(valorNum) && valorNum > 0
              ? `${formatNumber(cotas)} cotas → ${formatBRL(cotas * valorNum)}`
              : undefined
          }
        >
          <Input
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,90"
            error={!!erros.valor}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit">
          <PlusIcon size={16} /> Registrar provento
        </Button>
      </div>
    </form>
  );
}
