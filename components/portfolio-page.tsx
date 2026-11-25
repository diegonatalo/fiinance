"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { FiiForm, type FiiFormValues } from "@/components/fii-form";
import { FiiTable, type TypeFilter } from "@/components/fii-table";
import { HistoryCard } from "@/components/history-card";
import { OperationModal } from "@/components/operation-modal";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber } from "@/lib/format";
import type { Fii } from "@/types/fii";

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "papel", label: "Papel" },
  { value: "tijolo", label: "Tijolo" },
];

export const PortfolioPage = () => {
  const { assets, summary, tickerInUse, addAsset, updateAsset, removeAsset, restoreAsset } =
    usePortfolioContext();
  const notify = useToast();
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Fii | null>(null);
  const [operating, setOperating] = useState<Fii | null>(null);

  function handleAdd({ asset, buy }: FiiFormValues) {
    if (!buy) return;
    const { existing } = addAsset(asset, buy);
    notify(existing ? `Compra somada à posição de ${asset.ticker}` : `${asset.ticker} adicionado à carteira`);
    setAdding(false);
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
    notify(`${fii.ticker} removido`, { label: "Desfazer", onClick: () => restoreAsset(snapshot) });
  }

  // posição atualizada do ativo em operação (muda quando a compra/venda é salva)
  const currentOperating = assets.find((a) => a.id === operating?.id) ?? null;
  const count = (type: TypeFilter) => assets.filter((a) => type === "all" || a.type === type).length;
  const funds = `${formatNumber(assets.length)} ${assets.length === 1 ? "fundo" : "fundos"}`;

  return (
    <>
      <PageHeader
        title="Carteira"
        description={
          assets.length === 0 ? (
            "Cadastre seus fundos com a primeira compra."
          ) : (
            <>
              {funds} · {formatNumber(summary.totalShares)} cotas ·{" "}
              <span className="text-fg">{formatBRL(summary.totalInvested)}</span> investidos
            </>
          )
        }
        action={{ label: "Nova operação", onClick: () => setAdding(true) }}
      >
        {assets.length > 0 && (
          <div
            role="group"
            aria-label="Filtro por tipo"
            className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1 md:inline-grid"
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={cn(
                  "h-9 rounded-[9px] px-3.5 text-sm font-medium transition-colors",
                  filter === f.value ? "bg-line text-fg" : "text-muted hover:text-fg",
                )}
              >
                {f.label} {count(f.value)}
              </button>
            ))}
          </div>
        )}
      </PageHeader>

      {assets.length === 0 ? (
        <section className="flex flex-col items-center gap-4 rounded-[20px] border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-lg font-semibold">Carteira vazia</p>
          <p className="max-w-sm text-[15px] text-muted">
            Registre a primeira compra de um fundo. O preço médio e o peso de cada um aparecem aqui.
          </p>
          <Button onClick={() => setAdding(true)}>
            <PlusIcon size={16} weight="bold" aria-hidden="true" /> Nova operação
          </Button>
        </section>
      ) : (
        <FiiTable
          assets={assets}
          filter={filter}
          onEdit={setEditing}
          onDelete={handleDelete}
          onOperation={setOperating}
        />
      )}

      {assets.length > 0 && (
        <p className="text-[13px] text-muted">
          Compras e vendas recalculam o preço médio na hora.
        </p>
      )}

      <HistoryCard />

      <Modal open={adding} title="Nova operação" onClose={() => setAdding(false)}>
        <FiiForm onSubmit={handleAdd} tickerInUse={tickerInUse} onCancel={() => setAdding(false)} />
      </Modal>

      <Modal open={!!editing} title="Editar fundo" onClose={() => setEditing(null)}>
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
