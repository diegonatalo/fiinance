import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDownload } from "@/hooks/use-download";

afterEach(() => vi.restoreAllMocks());

describe("useDownload", () => {
  it("cria um link temporário com o nome do arquivo, clica e libera a URL", () => {
    URL.createObjectURL = vi.fn(() => "blob:fiinance");
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("carteira.csv");
      expect(this.href).toBe("blob:fiinance");
    });
    const download = renderHook(() => useDownload()).result.current;
    download("carteira.csv", "a;b", "text/csv");
    expect(click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fiinance");
  });
});
