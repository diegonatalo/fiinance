import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "@/hooks/use-theme";
import { useToday } from "@/hooks/use-today";
import { THEME_KEY } from "@/lib/storage-keys";

const systemDark = (matches: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as MediaQueryList);

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});
afterEach(() => vi.restoreAllMocks());

describe("useTheme", () => {
  it("sem escolha salva, segue o sistema", () => {
    systemDark(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("a escolha salva vale mais que o sistema", () => {
    systemDark(true);
    localStorage.setItem(THEME_KEY, '"light"');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("ignora valor salvo inválido", () => {
    systemDark(false);
    localStorage.setItem(THEME_KEY, '"roxo"');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("alternar grava a escolha e aplica a classe", () => {
    systemDark(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe('"dark"');
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("useToday", () => {
  it("no navegador devolve a data local no formato yyyy-mm-dd", () => {
    vi.useFakeTimers({ now: new Date(2026, 0, 31, 23, 30) });
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("2026-01-31");
    vi.useRealTimers();
  });
});
