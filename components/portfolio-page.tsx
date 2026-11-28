"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { FiiForm } from "@/components/fii-form";
import { FiiTable, type TypeFilter } from "@/components/fii-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { NewAsset } from "@/hooks/use-portfolio";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber } from "@/lib/format";
import type { Asset } from "@/types/fii";

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
  const [editing, setEditing] = useState<Asset | null>(null);

  function handleAdd(asset: NewAsset) {
    addAsset(asset);
    notify(`${asset.ticker} adicionado à carteira`);
    setAdding(false);
  }

  function handleUpdate(asset: NewAsset) {
    if (!editing) return;
    updateAsset(editing.id, asset);
    notify(`${asset.ticker} atualizado`);
    setEditing(null);
  }

  function handleDelete(asset: Asset) {
    const removed = removeAsset(asset.id);
    if (!removed) return;
    notify(`${asset.ticker} removido`, { label: "Desfazer", onClick: () => restoreAsset(removed) });
  }

  const count = (type: TypeFilter) => assets.filter((a) => type === "all" || a.type === type).length;
  const funds = `${formatNumber(assets.length)} ${assets.length === 1 ? "fundo" : "fundos"}`;

  return (
    <>
      <PageHeader
        title="Carteira"
        description={
          assets.length === 0 ? (
            "Cadastre seus fundos com as cotas, o preço médio e o último rendimento."
          ) : (
            <>
              {funds} · {formatNumber(summary.totalShares)} cotas ·{" "}
              <span className="text-fg">{formatBRL(summary.totalInvested)}</span> investidos ·{" "}
              <span className="text-fg">{formatBRL(summary.expectedIncome)}</span> por mês
            </>
          )
        }
        action={{ label: "Novo fundo", onClick: () => setAdding(true) }}
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
            Cadastre o primeiro fundo. O peso, a meta e os proventos esperados de cada um aparecem aqui.
          </p>
          <Button onClick={() => setAdding(true)}>
            <PlusIcon size={16} weight="bold" aria-hidden="true" /> Novo fundo
          </Button>
        </section>
      ) : (
        <FiiTable
          assets={assets}
          filter={filter}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      )}

      {assets.length > 0 && (
        <p className="text-[13px] text-muted">
          A meta de cada fundo é a nota dele dividida pela soma das notas.
        </p>
      )}

      <Modal open={adding} title="Novo fundo" onClose={() => setAdding(false)}>
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
    </>
  );
};
