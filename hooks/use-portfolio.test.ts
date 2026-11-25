import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePortfolio } from "@/hooks/use-portfolio";
import { DATA_KEY } from "@/lib/storage-keys";

const mxrf = { ticker: "MXRF11", type: "papel" as const, segment: "CDI" as const };
const buy = (shares: number, price: number) => ({ date: "2026-01-10", shares, price });

const setup = () => renderHook(() => usePortfolio()).result;

beforeEach(() => localStorage.clear());

describe("usePortfolio", () => {
  it("cria o ativo com a primeira compra e calcula a posição", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf, buy(10, 10));
    });
    expect(p.current.data.assets).toHaveLength(1);
    expect(p.current.assets[0]).toMatchObject({ ticker: "MXRF11", shares: 10, averagePrice: 10 });
    expect(JSON.parse(localStorage.getItem(DATA_KEY)!).assets).toHaveLength(1);
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

  it("importar troca tudo por um backup válido e recusa conteúdo inválido", () => {
    const p = setup();
    let ok = true;
    act(() => {
      ok = p.current.importData("não é json");
    });
    expect(ok).toBe(false);
    act(() => {
      ok = p.current.importData(JSON.stringify({ versao: 99 }));
    });
    expect(ok).toBe(false);

    const backup = {
      version: 2,
      assets: [{ id: "a", ticker: "HGLG11", type: "tijolo", segment: "logística" }],
      transactions: [{ id: "t", assetId: "a", type: "compra", date: "2026-01-01", shares: 2, price: 160 }],
      payouts: [],
      paperTarget: null,
    };
    act(() => {
      ok = p.current.importData(JSON.stringify(backup));
    });
    expect(ok).toBe(true);
    expect(p.current.assets[0]).toMatchObject({ ticker: "HGLG11", shares: 2 });
  });
});
