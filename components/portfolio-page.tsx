"use client";

import { useState } from "react";
import { FiiForm, type FiiFormValues } from "@/components/fii-form";
import { FiiTable } from "@/components/fii-table";
import { OperationModal } from "@/components/operation-modal";
import { QuotesCard } from "@/components/quotes-card";
import { HistoryCard } from "@/components/history-card";
import { BackupCard } from "@/components/backup-card";
import { Card, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { useToast } from "@/lib/toast-context";
import type { Fii } from "@/types/fii";

export const PortfolioPage = () => {
  const {
    assets,
    data,
    summary,
    tickerInUse,
    addAsset,
    updateAsset,
    removeAsset,
    restoreAsset,
  } = usePortfolioContext();
  const notify = useToast();
  const [editing, setEditing] = useState<Fii | null>(null);
  const [operating, setOperating] = useState<Fii | null>(null);

  function handleAdd({ asset, buy }: FiiFormValues) {
    if (!buy) return;
    const { existing } = addAsset(asset, buy);
    notify(
      existing
        ? `Compra somada à posição de ${asset.ticker}`
        : `${asset.ticker} adicionado à carteira`,
    );
  }

  function handleUpdate({ asset }: FiiFormValues) {
    if (!editing) return;
    updateAsset(editing.id, asset);
    notify(`${asset.ticker} atualizado`);
    setEditing(null);
  }

  function handleDelete(fii: Fii) {
    const snapshot = removeAsset(fii.id);
    if (!snapshot) return;
    notify(`${fii.ticker} removido`, {
      label: "Desfazer",
      onClick: () => restoreAsset(snapshot),
    });
  }

  // posição atualizada do ativo em operação (muda quando a compra/venda é salva)
  const currentOperating = assets.find((a) => a.id === operating?.id) ?? null;

  return (
    <>
      <Card>
        <CardTitle className="mb-4">Adicionar ativo</CardTitle>
        <FiiForm onSubmit={handleAdd} tickerInUse={tickerInUse} />
      </Card>

      <Card>
        <CardTitle className="mb-4">Meus ativos</CardTitle>
        <FiiTable
          assets={assets}
          quotes={data.quotes}
          total={summary.totalInvested}
          onEdit={setEditing}
          onDelete={handleDelete}
          onOperation={setOperating}
        />
      </Card>

      <QuotesCard />
      <HistoryCard />
      <BackupCard />

      <Modal
        open={!!editing}
        title="Editar ativo"
        onClose={() => setEditing(null)}
      >
        <FiiForm
          key={editing?.id}
          initial={editing}
          tickerInUse={tickerInUse}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <OperationModal asset={currentOperating} onClose={() => setOperating(null)} />
    </>
  );
};
