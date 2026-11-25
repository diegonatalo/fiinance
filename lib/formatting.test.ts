import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate, formatDayMonth, formatMonth, formatMonthLong, isValidDate, monthName, monthOf, today } from "@/lib/date";
import { formatBRL, formatChange, formatDelta, formatDeltaBRL, formatKind, formatNumber, formatPct, formatSignedPct } from "@/lib/format";
import { uid } from "@/lib/id";
import { parseDecimal, parseDecimalOrZero } from "@/lib/numbers";

// Os espaços do toLocaleString são não separáveis (U+00A0); normaliza para comparar.
const plain = (text: string) => text.replace(/ /g, " ");

describe("datas", () => {
  afterEach(() => vi.useRealTimers());

  it("today devolve a data local no formato yyyy-mm-dd", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 5, 15, 0, 0));
    expect(today()).toBe("2026-03-05");
  });

  it("formatDate converte para dd/mm/aaaa", () => {
    expect(formatDate("2026-03-05")).toBe("05/03/2026");
  });

  it("monthOf corta o mês", () => {
    expect(monthOf("2026-03-05")).toBe("2026-03");
  });

  it("formatMonth devolve mês abreviado e ano com dois dígitos", () => {
    expect(formatMonth("2026-03")).toBe("mar/26");
    expect(formatMonth("2025-12")).toBe("dez/25");
  });

  it("isValidDate aceita datas reais e recusa as impossíveis", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
    expect(isValidDate("2024-02-29")).toBe(true);
    expect(isValidDate("2026-02-29")).toBe(false);
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("05/03/2026")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });
});

describe("formatação", () => {
  it("formatBRL usa o formato de moeda brasileiro", () => {
    expect(plain(formatBRL(1234.5))).toBe("R$ 1.234,50");
    expect(plain(formatBRL(0))).toBe("R$ 0,00");
  });

  it("formatNumber usa separador de milhar brasileiro", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
  });

  it("formatPct fixa as casas decimais", () => {
    expect(formatPct(12.345)).toBe("12,3%");
    expect(formatPct(5, 2)).toBe("5,00%");
  });

  it("formatSignedPct mostra o sinal de positivo", () => {
    expect(formatSignedPct(1.5)).toBe("+1,50%");
    expect(formatSignedPct(-1.5)).toBe("-1,50%");
    expect(formatSignedPct(0)).toBe("+0,00%");
  });
});

describe("parseDecimal", () => {
  it.each([
    ["1.234,56", 1234.56],
    ["12,5", 12.5],
    ["12.5", 12.5],
    ["  42  ", 42],
    ["-3,2", -3.2],
    ["1 000,5", 1000.5],
  ])("lê %j como %s", (text, expected) => {
    expect(parseDecimal(text)).toBe(expected);
  });

  it.each(["", "   ", "abc", "1,2,3", "12a", "--1"])("devolve NaN para %j", (text) => {
    expect(parseDecimal(text)).toBeNaN();
  });

  it("parseDecimalOrZero troca o inválido por zero", () => {
    expect(parseDecimalOrZero("2,5")).toBe(2.5);
    expect(parseDecimalOrZero("abc")).toBe(0);
    expect(parseDecimalOrZero("")).toBe(0);
  });
});

describe("uid", () => {
  it("gera ids diferentes", () => {
    expect(uid()).not.toBe(uid());
  });

  it("funciona sem crypto.randomUUID", () => {
    vi.stubGlobal("crypto", {});
    const id = uid();
    vi.unstubAllGlobals();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

describe("formatos da identidade", () => {

  it("variação com sinal tipográfico e seta", () => {
    expect(formatChange(1.8)).toBe("+1,80%");
    expect(formatChange(-3.14)).toBe("−3,14%");
    expect(formatDelta(3.09)).toBe("▲ +3,09%");
    expect(formatDelta(-1.66, 1)).toBe("▼ −1,7%");
    expect(plain(formatDeltaBRL(-120.31))).toBe("▼ R$ 120,31");
    expect(plain(formatDeltaBRL(0))).toBe("▲ R$ 0,00");
  });

  it("tipo e segmento com inicial maiúscula", () => {
    expect(formatKind("tijolo", "logística")).toBe("Tijolo · Logística");
    expect(formatKind("papel", "IPCA")).toBe("Papel · IPCA");
  });

  it("meses e datas curtas", () => {
    expect(formatMonthLong("2026-10")).toBe("outubro de 2026");
    expect(monthName("2026-03")).toBe("março");
    expect(formatDayMonth("2026-10-14")).toBe("14/10");
  });
});
