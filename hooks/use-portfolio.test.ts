import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SAVE_ERROR, usePortfolio, type Persistence } from "@/hooks/use-portfolio";
import { EMPTY_DATA } from "@/lib/validation";

const mxrf = { ticker: "MXRF11", type: "papel" as const, segment: "CDI" as const };
const buy = (shares: number, price: number) => ({ date: "2026-01-10", shares, price });

/** Persistência falsa: grava cada chamada, na ordem. */
const fakePersistence = () => {
  const calls: [string, ...unknown[]][] = [];
  const record =
    (name: string) =>
    async (...args: unknown[]) => {
      calls.push([name, ...args]);
    };
  const persistence: Persistence = {
    addAsset: record("addAsset"),
    updateAsset: record("updateAsset"),
    removeAsset: record("removeAsset"),
    restoreAsset: record("restoreAsset"),
    recordOperation: record("recordOperation"),
    removeTransaction: record("removeTransaction"),
    addPayout: record("addPayout"),
    removePayout: record("removePayout"),
    setPaperTarget: record("setPaperTarget"),
  };
  return { calls, persistence };
};

const setup = (persistence = fakePersistence().persistence) =>
  renderHook(() => usePortfolio(EMPTY_DATA, persistence)).result;

describe("usePortfolio", () => {
  it("cria o ativo com a primeira compra e calcula a posição", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf, buy(10, 10));
    });
    expect(p.current.data.assets).toHaveLength(1);
    expect(p.current.assets[0]).toMatchObject({ ticker: "MXRF11", shares: 10, averagePrice: 10 });
  });

  it("comprar um ticker que já existe soma à posição, sem duplicar o ativo", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf, buy(10, 10));
    });
    let result = { existing: false };
    act(() => {
      result = p.current.addAsset({ ...mxrf, ticker: " mxrf11 " }, buy(10, 12));
    });
    expect(result.existing).toBe(true);
    expect(p.current.data.assets).toHaveLength(1);
    expect(p.current.assets[0]).toMatchObject({ shares: 20, averagePrice: 11 });
  });

  it("tickerInUse ignora espaços, caixa e o próprio ativo", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf, buy(1, 10));
    });
    const id = p.current.data.assets[0].id;
    expect(p.current.tickerInUse(" mxrf11")?.id).toBe(id);
    expect(p.current.tickerInUse("MXRF11", id)).toBeUndefined();
  });

  it("remover devolve tudo do ativo e restaurar traz de volta", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf, buy(10, 10));
    });
    const id = p.current.data.assets[0].id;
    act(() => {
      p.current.addPayout({ assetId: id, date: "2026-02-15", valuePerShare: 0.1, shares: 10 });
    });

    let snapshot: ReturnType<typeof p.current.removeAsset> = null;
    act(() => {
      snapshot = p.current.removeAsset(id);
    });
    expect(p.current.data).toMatchObject({ assets: [], transactions: [], payouts: [] });
    expect(snapshot).toMatchObject({ transactions: [expect.anything()], payouts: [expect.anything()] });

    act(() => p.current.restoreAsset(snapshot!));
    expect(p.current.data.assets).toHaveLength(1);
    expect(p.current.data.transactions).toHaveLength(1);
    expect(p.current.data.payouts).toHaveLength(1);
  });

  it("remover um ativo que não existe não faz nada", () => {
    const p = setup();
    let snapshot: ReturnType<typeof p.current.removeAsset> = null;
    act(() => {
      snapshot = p.current.removeAsset("x");
    });
    expect(snapshot).toBeNull();
  });

  it("registra e remove operações e proventos", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf, buy(10, 10));
    });
    const id = p.current.data.assets[0].id;
    act(() => p.current.recordOperation(id, { type: "venda", date: "2026-03-01", shares: 4, price: 11 }));
    expect(p.current.assets[0].shares).toBe(6);

    const sale = p.current.data.transactions.find((t) => t.type === "venda")!;
    act(() => p.current.removeTransaction(sale.id));
    expect(p.current.assets[0].shares).toBe(10);

    act(() => p.current.addPayout({ assetId: id, date: "2026-02-15", valuePerShare: 0.1, shares: 10 }));
    act(() => p.current.removePayout(p.current.data.payouts[0].id));
    expect(p.current.data.payouts).toEqual([]);
  });

  it("atualiza o ativo e a meta de papel", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf, buy(1, 10));
    });
    const id = p.current.data.assets[0].id;
    act(() => p.current.updateAsset(id, { ...mxrf, segment: "IPCA" }));
    expect(p.current.data.assets[0]).toEqual({ ...mxrf, segment: "IPCA", id });
    act(() => p.current.setPaperTarget(60));
    expect(p.current.data.paperTarget).toBe(60);
  });

  it("grava cada mudança no banco, na ordem em que aconteceu", async () => {
    const { calls, persistence } = fakePersistence();
    const p = setup(persistence);
    act(() => {
      p.current.addAsset(mxrf, buy(10, 10));
    });
    const id = p.current.data.assets[0].id;
    act(() => p.current.addPayout({ assetId: id, date: "2026-02-15", valuePerShare: 0.1, shares: 10 }));
    act(() => p.current.setPaperTarget(40));
    expect(p.current.saving).toBe(true);
    await waitFor(() => expect(p.current.saving).toBe(false));
    expect(calls.map(([name]) => name)).toEqual(["addAsset", "addPayout", "setPaperTarget"]);
    expect(calls[0][1]).toMatchObject({ id, ticker: "MXRF11" });
    expect(calls[0][2]).toMatchObject({ assetId: id, type: "compra", shares: 10, price: 10 });
    expect(calls[2][1]).toBe(40);
    expect(p.current.saveError).toBeNull();
  });

  it("mostra o erro quando o banco recusa e continua com as próximas mudanças", async () => {
    const { persistence } = fakePersistence();
    const updateAsset = vi.fn().mockRejectedValue(new Error("falhou"));
    const p = setup({ ...persistence, updateAsset });
    act(() => {
      p.current.addAsset(mxrf, buy(1, 10));
    });
    const id = p.current.data.assets[0].id;
    act(() => p.current.updateAsset(id, { ...mxrf, segment: "IPCA" }));
    await waitFor(() => expect(p.current.saveError).toBe(SAVE_ERROR));
    // a tela mantém o que a pessoa fez
    expect(p.current.data.assets[0].segment).toBe("IPCA");
    await waitFor(() => expect(p.current.saving).toBe(false));
  });

  it("começa com a carteira que veio do servidor", () => {
    const initial = {
      ...EMPTY_DATA,
      assets: [{ id: "a", ticker: "HGLG11", type: "tijolo" as const, segment: "logística" as const }],
      transactions: [{ id: "t", assetId: "a", type: "compra" as const, date: "2026-01-01", shares: 2, price: 160 }],
      paperTarget: 30,
    };
    const p = renderHook(() => usePortfolio(initial, fakePersistence().persistence)).result;
    expect(p.current.assets[0]).toMatchObject({ ticker: "HGLG11", shares: 2, averagePrice: 160 });
    expect(p.current.data.paperTarget).toBe(30);
  });
});
