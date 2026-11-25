import { describe, expect, it } from "vitest";
import { quoteStatus } from "@/lib/quote-status";

// horários locais, para o "hoje" não depender do fuso de quem roda o teste
const at = (time: string) => new Date(`2026-11-24T${time}`).getTime();
const iso = (time: string) => new Date(at(time)).toISOString();

describe("quoteStatus", () => {
  it("sem fundos, não mostra nada", () => {
    expect(quoteStatus({ held: 0, updatedAt: [], state: "idle", now: at("12:00:00") })).toBeNull();
  });

  it("sem nenhuma cotação, diz que está buscando ou que falhou", () => {
    expect(quoteStatus({ held: 1, updatedAt: [undefined], state: "loading", now: null })).toEqual({
      label: "Buscando cotações…",
      tone: "loading",
    });
    expect(quoteStatus({ held: 1, updatedAt: [undefined], state: "error", now: null })).toEqual({
      label: "Cotações indisponíveis",
      tone: "error",
    });
  });

  it("cotações de hoje mostram há quanto tempo, pela mais antiga", () => {
    const now = at("12:00:00");
    expect(quoteStatus({ held: 2, updatedAt: [iso("11:57:00"), iso("11:59:30")], state: "idle", now })).toEqual({
      label: "Cotações de hoje · há 3 min",
      tone: "fresh",
    });
    expect(quoteStatus({ held: 1, updatedAt: [iso("11:59:40")], state: "idle", now })?.label).toBe(
      "Cotações de hoje · agora",
    );
    expect(quoteStatus({ held: 1, updatedAt: [iso("09:10:00")], state: "idle", now })?.label).toBe(
      "Cotações de hoje · há 2 h",
    );
  });

  it("cotações de outro dia mostram a data", () => {
    const status = quoteStatus({
      held: 1,
      updatedAt: [new Date("2026-11-20T15:00:00").toISOString()],
      state: "idle",
      now: at("12:00:00"),
    });
    expect(status).toEqual({ label: "Cotações de 20/11", tone: "old" });
  });

  it("enquanto atualiza ou antes de saber a hora, não promete nada", () => {
    expect(quoteStatus({ held: 1, updatedAt: [iso("11:00:00")], state: "loading", now: at("12:00:00") })?.label).toBe(
      "Atualizando cotações…",
    );
    expect(quoteStatus({ held: 1, updatedAt: [iso("11:00:00")], state: "idle", now: null })?.label).toBe("Cotações");
  });

  it("marca o erro mesmo quando há cotações antigas", () => {
    expect(quoteStatus({ held: 1, updatedAt: [iso("11:00:00")], state: "error", now: at("12:00:00") })?.tone).toBe(
      "error",
    );
  });
});
