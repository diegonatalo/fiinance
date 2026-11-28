import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SAVE_ERROR, usePortfolio, type NewAsset, type Persistence } from "@/hooks/use-portfolio";
import { EMPTY_DATA } from "@/lib/validation";

const mxrf: NewAsset = {
  ticker: "MXRF11",
  type: "papel",
  segment: null,
  risk: "High Yield",
  shares: 100,
  averagePrice: 10,
  lastDividend: 0.1,
  rating: 6,
};

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
  };
  return { calls, persistence };
};

const setup = (persistence = fakePersistence().persistence) =>
  renderHook(() => usePortfolio(EMPTY_DATA, persistence)).result;

describe("usePortfolio", () => {
  it("cadastra o fundo e recalcula o resumo", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf);
    });
    expect(p.current.assets).toHaveLength(1);
    expect(p.current.assets[0]).toMatchObject({ ticker: "MXRF11", id: expect.any(String) });
    expect(p.current.summary).toMatchObject({ totalInvested: 1000, expectedIncome: 10, activeAssets: 1 });
  });

  it("tickerInUse ignora espaços, caixa e o próprio fundo", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf);
    });
    const id = p.current.assets[0].id;
    expect(p.current.tickerInUse(" mxrf11")?.id).toBe(id);
    expect(p.current.tickerInUse("MXRF11", id)).toBeUndefined();
  });

  it("atualiza o fundo inteiro, inclusive cotas e preço médio", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf);
    });
    const id = p.current.assets[0].id;
    act(() => p.current.updateAsset(id, { ...mxrf, shares: 150, averagePrice: 9.8 }));
    expect(p.current.assets[0]).toEqual({ ...mxrf, shares: 150, averagePrice: 9.8, id });
    expect(p.current.summary.totalInvested).toBeCloseTo(1470);
  });

  it("remover devolve o fundo e restaurar traz de volta", () => {
    const p = setup();
    act(() => {
      p.current.addAsset(mxrf);
    });
    const id = p.current.assets[0].id;
    let removed: ReturnType<typeof p.current.removeAsset> = null;
    act(() => {
      removed = p.current.removeAsset(id);
    });
    expect(p.current.assets).toEqual([]);
    expect(removed).toMatchObject({ id, ticker: "MXRF11" });

    act(() => p.current.restoreAsset(removed!));
    expect(p.current.assets).toHaveLength(1);
  });

  it("remover um fundo que não existe não faz nada", () => {
    const p = setup();
    let removed: ReturnType<typeof p.current.removeAsset> = null;
    act(() => {
      removed = p.current.removeAsset("x");
    });
    expect(removed).toBeNull();
  });

  it("grava cada mudança no banco, na ordem em que aconteceu", async () => {
    const { calls, persistence } = fakePersistence();
    const p = setup(persistence);
    act(() => {
      p.current.addAsset(mxrf);
    });
    const id = p.current.assets[0].id;
    act(() => p.current.updateAsset(id, { ...mxrf, rating: 9 }));
    act(() => {
      p.current.removeAsset(id);
    });
    expect(p.current.saving).toBe(true);
    await waitFor(() => expect(p.current.saving).toBe(false));
    expect(calls.map(([name]) => name)).toEqual(["addAsset", "updateAsset", "removeAsset"]);
    expect(calls[0][1]).toMatchObject({ id, ticker: "MXRF11" });
    expect(calls[1][1]).toMatchObject({ id, rating: 9 });
    expect(calls[2][1]).toBe(id);
    expect(p.current.saveError).toBeNull();
  });

  it("mostra o erro quando o banco recusa e continua com as próximas mudanças", async () => {
    const { persistence } = fakePersistence();
    const updateAsset = vi.fn().mockRejectedValue(new Error("falhou"));
    const p = setup({ ...persistence, updateAsset });
    act(() => {
      p.current.addAsset(mxrf);
    });
    const id = p.current.assets[0].id;
    act(() => p.current.updateAsset(id, { ...mxrf, risk: "High Grade" }));
    await waitFor(() => expect(p.current.saveError).toBe(SAVE_ERROR));
    // a tela mantém o que a pessoa fez
    expect(p.current.assets[0].risk).toBe("High Grade");
    await waitFor(() => expect(p.current.saving).toBe(false));
  });

  it("começa com a carteira que veio do servidor", () => {
    const initial = { assets: [{ ...mxrf, id: "a" }] };
    const p = renderHook(() => usePortfolio(initial, fakePersistence().persistence)).result;
    expect(p.current.assets[0]).toMatchObject({ id: "a", ticker: "MXRF11" });
    expect(p.current.summary.totalInvested).toBe(1000);
  });
});
