import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Fii } from "@/types/fii";
import { FiiTable, type TypeFilter } from "./fii-table";

const fii = (id: string, ticker: string, type: Fii["type"], shares: number, averagePrice: number): Fii => ({
  id,
  ticker,
  type,
  segment: type === "papel" ? "CDI" : "lajes",
  shares,
  averagePrice,
});

// investido: KNRI 1000, MXRF 100, HGLG 500 (total 1600)
const assets = [
  fii("k", "KNRI11", "tijolo", 10, 100),
  fii("m", "MXRF11", "papel", 10, 10),
  fii("h", "HGLG11", "tijolo", 5, 100),
];

const setup = (filter: TypeFilter = "all") => {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onOperation: vi.fn() };
  render(<FiiTable assets={assets} filter={filter} {...handlers} />);
  return handlers;
};

const table = () => screen.getByRole("table");
const tickers = () =>
  within(table())
    .getAllByRole("row")
    .map((row) => row.textContent?.match(/[A-Z]{4}11/)?.[0])
    .filter(Boolean);
const header = (name: string) => within(table()).getByRole("button", { name });
const row = (name: string) => within(table()).getByRole("row", { name: new RegExp(name) });

describe("FiiTable", () => {
  it("começa pelo maior valor investido", () => {
    setup();
    expect(tickers()).toEqual(["KNRI11", "HGLG11", "MXRF11"]);
    expect(header("Investido").closest("th")).toHaveAttribute("aria-sort", "descending");
  });

  it("ordena por fundo e inverte ao clicar de novo", async () => {
    setup();
    await userEvent.click(header("Fundo"));
    expect(tickers()).toEqual(["HGLG11", "KNRI11", "MXRF11"]);
    await userEvent.click(header("Fundo"));
    expect(tickers()).toEqual(["MXRF11", "KNRI11", "HGLG11"]);
    expect(header("Fundo").closest("th")).toHaveAttribute("aria-sort", "descending");
  });

  it("mostra o peso de cada fundo e o total", () => {
    setup();
    expect(row("KNRI11")).toHaveTextContent("62,5%");
    expect(row("MXRF11")).toHaveTextContent("6,3%");
    expect(row("Total")).toHaveTextContent("R$ 1.600,00");
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
    expect(dialog).toHaveTextContent("R$ 100,00");
    await userEvent.click(within(dialog).getByRole("button", { name: "Operar" }));
    expect(onOperation).toHaveBeenCalledWith(assets[1]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
