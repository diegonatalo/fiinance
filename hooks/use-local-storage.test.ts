import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "@/hooks/use-local-storage";

const KEY = "my-app:test:v1";
const toNumber = (raw: unknown) => (typeof raw === "number" ? raw : 0);

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("useLocalStorage", () => {
  it("começa com o valor inicial e lê o que foi salvo", () => {
    expect(renderHook(() => useLocalStorage(KEY, 0)).result.current[0]).toBe(0);
    localStorage.setItem(KEY, "5");
    expect(renderHook(() => useLocalStorage(KEY, 0)).result.current[0]).toBe(5);
  });

  it("grava como JSON e aceita função de atualização", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 0));
    act(() => result.current[1](2));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(3);
    expect(localStorage.getItem(KEY)).toBe("3");
  });

  it("sincroniza componentes diferentes", () => {
    const a = renderHook(() => useLocalStorage(KEY, 0));
    const b = renderHook(() => useLocalStorage(KEY, 0));
    act(() => a.result.current[1](7));
    expect(b.result.current[0]).toBe(7);
  });

  it("valida o que foi lido com sanitize e volta ao inicial se o JSON estiver corrompido", () => {
    localStorage.setItem(KEY, '"texto"');
    expect(
      renderHook(() => useLocalStorage(KEY, 1, toNumber)).result.current[0],
    ).toBe(0);
    localStorage.setItem(KEY, "{quebrado");
    expect(renderHook(() => useLocalStorage(KEY, 1)).result.current[0]).toBe(1);
  });

  it("sem conseguir gravar, mantém o valor na memória", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("cheio", "QuotaExceededError");
    });
    const { result } = renderHook(() => useLocalStorage("my-app:full:v1", 0));
    act(() => result.current[1](4));
    expect(result.current[0]).toBe(4);
  });

  it("acompanha mudanças feitas em outra aba", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 0));
    localStorage.setItem(KEY, "9");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    });
    expect(result.current[0]).toBe(9);
  });
});
