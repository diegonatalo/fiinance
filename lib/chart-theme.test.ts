import { describe, expect, it } from "vitest";
import { chartTheme } from "@/lib/chart-theme";

describe("chartTheme", () => {
  it("usa fundo claro e texto escuro no tema claro", () => {
    const { tooltip } = chartTheme("light");
    expect(tooltip.contentStyle.background).toBe("#ffffff");
    expect(tooltip.contentStyle.color).toBe("#18181b");
  });

  it("usa fundo escuro e texto claro no tema escuro", () => {
    const { tooltip } = chartTheme("dark");
    expect(tooltip.contentStyle.background).toBe("#18181b");
    expect(tooltip.contentStyle.color).toBe("#fafafa");
  });

  it("rótulo e itens do tooltip seguem a cor do texto", () => {
    for (const theme of ["light", "dark"] as const) {
      const { tooltip } = chartTheme(theme);
      expect(tooltip.labelStyle.color).toBe(tooltip.contentStyle.color);
      expect(tooltip.itemStyle.color).toBe(tooltip.contentStyle.color);
    }
  });

  it("eixos e grade mudam com o tema", () => {
    expect(chartTheme("light").axis).not.toBe(chartTheme("dark").axis);
    expect(chartTheme("light").grid).not.toBe(chartTheme("dark").grid);
  });
});
