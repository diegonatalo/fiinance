import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Fii, Quote } from "@/types/fii";
import { FiiTable, type TypeFilter } from "./fii-table";

const fii = (id: string, ticker: string, type: Fii["type"], shares: number, averagePrice: number): Fii => ({
  id,
  ticker,
  type,
  segment: type === "papel" ? "CDI" : "lajes",
  shares,
  averagePrice,
});

// valor hoje: KNRI 900, MXRF 120, HGLG 500 (sem cotação, vale o custo)
const assets = [
  fii("k", "KNRI11", "tijolo", 10, 100),
  fii("m", "MXRF11", "papel", 10, 10),
  fii("h", "HGLG11", "tijolo", 5, 100),
];
// resultado: KNRI -10%, MXRF +20%, HGLG sem cotação
const quotes: Record<string, Quote> = {
  k: { price: 90, updatedAt: "" },
  m: { price: 12, updatedAt: "" },
};

const setup = (filter: TypeFilter = "all") => {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onOperation: vi.fn() };
  render(<FiiTable assets={assets} quotes={quotes} filter={filter} {...handlers} />);
  return handlers;
};

const table = () => screen.getByRole("table");
const tickers = () =>
  within(table())
    .getAllByRole("row")
    .map((row) => row.textContent?.match(/[A-Z]{4}11/)?.[0])
    .filter(Boolean);
const header = (name: string) => within(table()).getByRole("button", { name });
const row = (ticker: string) => within(table()).getByRole("row", { name: new RegExp(ticker) });

describe("FiiTable", () => {
  it("começa pelo maior valor de hoje", () => {
    setup();
    expect(tickers()).toEqual(["KNRI11", "HGLG11", "MXRF11"]);
    expect(header("Valor hoje").closest("th")).toHaveAttribute("aria-sort", "descending");
  });

  it("ordena por fundo e inverte ao clicar de novo", async () => {
    setup();
    await userEvent.click(header("Fundo"));
    expect(tickers()).toEqual(["HGLG11", "KNRI11", "MXRF11"]);
    await userEvent.click(header("Fundo"));
    expect(tickers()).toEqual(["MXRF11", "KNRI11", "HGLG11"]);
    expect(header("Fundo").closest("th")).toHaveAttribute("aria-sort", "descending");
  });

  it("ordena por resultado e deixa quem não tem cotação no fim", async () => {
    setup();
    await userEvent.click(header("Resultado"));
    expect(tickers()).toEqual(["MXRF11", "KNRI11", "HGLG11"]);
    await userEvent.click(header("Resultado"));
    expect(tickers()).toEqual(["KNRI11", "MXRF11", "HGLG11"]);
  });

  it("mostra o resultado, o peso e o total", () => {
    setup();
    expect(row("MXRF11")).toHaveTextContent("+20,00%");
    expect(row("KNRI11")).toHaveTextContent("−10,00%");
    expect(row("KNRI11")).toHaveTextContent("59,2%");
    expect(row("HGLG11")).toHaveTextContent("—");
    // HGLG sem cotação: o total não tem resultado
    expect(row("Total")).toHaveTextContent("R$ 1.600,00 investido");
  });

  it("mostra só o tipo filtrado", () => {
    setup("papel");
    expect(tickers()).toEqual(["MXRF11"]);
  });

  it("os botões de ação chamam o fundo da linha", async () => {
    const { onEdit, onDelete, onOperation } = setup();
    await userEvent.click(within(table()).getByRole("button", { name: "Editar KNRI11" }));
    await userEvent.click(within(table()).getByRole("button", { name: "Excluir MXRF11" }));
    await userEvent.click(within(table()).getByRole("button", { name: "Comprar ou vender HGLG11" }));
    expect(onEdit).toHaveBeenCalledWith(assets[0]);
    expect(onDelete).toHaveBeenCalledWith(assets[1]);
    expect(onOperation).toHaveBeenCalledWith(assets[2]);
  });

  it("no celular, tocar no fundo abre os detalhes e as ações", async () => {
    const { onOperation } = setup();
    await userEvent.click(screen.getByRole("button", { name: /^MXRF11/ }));
    const dialog = screen.getByRole("dialog", { name: "MXRF11" });
    expect(dialog).toHaveTextContent("R$ 120,00");
    await userEvent.click(within(dialog).getByRole("button", { name: "Operar" }));
    expect(onOperation).toHaveBeenCalledWith(assets[1]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
