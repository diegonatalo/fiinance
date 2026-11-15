import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "@/hooks/use-local-storage";

const KEY = "fiinance:test:v1";
const onlyNumbers = (raw: unknown) => (typeof raw === "number" ? raw : 0);

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("useLocalStorage", () => {
  it("sem nada salvo, usa o valor inicial", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 5));
    expect(result.current[0]).toBe(5);
  });

  it("lê o valor salvo e grava o novo como JSON", () => {
    localStorage.setItem(KEY, "7");
    const { result } = renderHook(() => useLocalStorage(KEY, 0));
    expect(result.current[0]).toBe(7);
    act(() => result.current[1](8));
    expect(result.current[0]).toBe(8);
    expect(localStorage.getItem(KEY)).toBe("8");
  });

  it("aceita função que recebe o valor anterior", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 1));
    act(() => result.current[1]((n) => n + 1));
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(3);
  });

  it("valida o que foi lido com sanitize e ignora JSON corrompido", () => {
    localStorage.setItem(KEY, '"texto"');
    const { result } = renderHook(() => useLocalStorage(KEY, 9, onlyNumbers));
    expect(result.current[0]).toBe(0);
    localStorage.setItem(KEY, "{quebrado");
    const { result: broken } = renderHook(() => useLocalStorage("fiinance:outro:v1", 9));
    expect(broken.current[0]).toBe(9);
  });

  it("componentes com a mesma chave ficam sincronizados", () => {
    const a = renderHook(() => useLocalStorage(KEY, 0));
    const b = renderHook(() => useLocalStorage(KEY, 0));
    act(() => a.result.current[1](42));
    expect(b.result.current[0]).toBe(42);
  });

  it("com o armazenamento cheio, mostra o valor novo e não o antigo salvo", () => {
    localStorage.setItem("fiinance:cheio:v1", "1");
    const { result } = renderHook(() => useLocalStorage("fiinance:cheio:v1", 0));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("cheio");
    });
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
  });

  it("se o valor salvo for apagado por fora, volta ao inicial", () => {
    const { result } = renderHook(() => useLocalStorage("fiinance:apagado:v1", 0));
    act(() => result.current[1](5));
    act(() => {
      localStorage.removeItem("fiinance:apagado:v1");
      window.dispatchEvent(new Event("storage"));
    });
    expect(result.current[0]).toBe(0);
  });

  it("com o armazenamento bloqueado, o valor vale na sessão", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("cheio");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    const { result } = renderHook(() => useLocalStorage("fiinance:bloqueado:v1", 0));
    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);
  });
});
