import { describe, expect, it, vi } from "vitest";
import { formatBRL, formatChange, formatDelta, formatDividend, formatKind, formatNumber, formatPct, formatSignedPct } from "@/lib/format";
import { uid } from "@/lib/id";
import { parseDecimal, parseDecimalOrZero } from "@/lib/numbers";

// Os espaços do toLocaleString são não separáveis (U+00A0); normaliza para comparar.
const plain = (text: string) => text.replace(/ /g, " ");

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
  });

  it("tipo e segmento com inicial maiúscula", () => {
    expect(formatKind({ type: "tijolo", segment: "lajes corporativas", risk: null })).toBe("Tijolo · Lajes corporativas");
    expect(formatKind({ type: "tijolo", segment: null, risk: null })).toBe("Tijolo · sem segmento");
    expect(formatKind({ type: "papel", segment: null, risk: "High Grade" })).toBe("Papel · High Grade");
    expect(formatKind({ type: "papel", segment: null, risk: null })).toBe("Papel · sem perfil de risco");
  });

  it("formatDividend mostra até 4 casas, só quando precisa", () => {
    expect(plain(formatDividend(0.85))).toBe("R$ 0,85");
    expect(plain(formatDividend(0.0825))).toBe("R$ 0,0825");
    expect(plain(formatDividend(1))).toBe("R$ 1,00");
  });
});
