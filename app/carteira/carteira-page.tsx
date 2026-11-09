"use client";

import { useState } from "react";
import { FiiForm, type FiiFormValues } from "@/components/fii-form";
import { FiiTable } from "@/components/fii-table";
import { OperacaoModal } from "@/components/operacao-modal";
import { CotacoesCard } from "@/components/cotacoes-card";
import { HistoricoCard } from "@/components/historico-card";
import { BackupCard } from "@/components/backup-card";
import { Card, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useCarteiraContext } from "@/lib/carteira-context";
import { useToast } from "@/lib/toast-context";
import type { Fii } from "@/types/fii";

export function CarteiraPage() {
  const {
    ativos,
    dados,
    resumo,
    tickerEmUso,
    adicionarAtivo,
    atualizarAtivo,
    removerAtivo,
    restaurarAtivo,
  } = useCarteiraContext();
  const notify = useToast();
  const [editing, setEditing] = useState<Fii | null>(null);
  const [operando, setOperando] = useState<Fii | null>(null);

  function handleAdd({ ativo, compra }: FiiFormValues) {
    if (!compra) return;
    const { existente } = adicionarAtivo(ativo, compra);
    notify(
      existente
        ? `Compra somada à posição de ${ativo.ticker}`
        : `${ativo.ticker} adicionado à carteira`,
    );
  }

  function handleUpdate({ ativo }: FiiFormValues) {
    if (!editing) return;
    atualizarAtivo(editing.id, ativo);
    notify(`${ativo.ticker} atualizado`);
    setEditing(null);
  }

  function handleDelete(fii: Fii) {
    const snapshot = removerAtivo(fii.id);
    if (!snapshot) return;
    notify(`${fii.ticker} removido`, {
      label: "Desfazer",
      onClick: () => restaurarAtivo(snapshot),
    });
  }

  // posição atualizada do ativo em operação (muda quando a compra/venda é salva)
  const operandoAtual = ativos.find((a) => a.id === operando?.id) ?? null;

  return (
    <>
      <Card>
        <CardTitle className="mb-4">Adicionar ativo</CardTitle>
        <FiiForm onSubmit={handleAdd} tickerEmUso={tickerEmUso} />
      </Card>

      <Card>
        <CardTitle className="mb-4">Meus ativos</CardTitle>
        <FiiTable
          ativos={ativos}
          cotacoes={dados.cotacoes}
          total={resumo.totalInvestido}
          onEdit={setEditing}
          onDelete={handleDelete}
          onOperacao={setOperando}
        />
      </Card>

      <CotacoesCard />
      <HistoricoCard />
      <BackupCard />

      <Modal
        open={!!editing}
        title="Editar ativo"
        onClose={() => setEditing(null)}
      >
        <FiiForm
          key={editing?.id}
          initial={editing}
          tickerEmUso={tickerEmUso}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <OperacaoModal ativo={operandoAtual} onClose={() => setOperando(null)} />
    </>
  );
}
