import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useToday } from "@/hooks/use-today";

afterEach(() => vi.useRealTimers());

describe("useToday", () => {
  it("devolve a data local e vira o dia com o app aberto", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 1, 23, 59, 30) });
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("2026-03-01");
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current).toBe("2026-03-02");
  });
});
