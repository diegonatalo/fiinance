import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Fii, Quote } from "@/types/fii";
import { FiiTable } from "./fii-table";

const fii = (id: string, ticker: string, type: Fii["type"], shares: number, averagePrice: number): Fii => ({
  id,
  ticker,
  type,
  segment: type === "papel" ? "CDI" : "lajes",
  shares,
  averagePrice,
});

// investido: KNRI 1000, MXRF 100, HGLG 500
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

const setup = (list = assets) => {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onOperation: vi.fn() };
  render(<FiiTable assets={list} quotes={quotes} total={1600} {...handlers} />);
  return handlers;
};

const table = () => screen.getByRole("table");
const tickers = () =>
  within(table())
    .getAllByRole("row")
    .map((row) => row.textContent?.match(/[A-Z]{4}11/)?.[0])
    .filter(Boolean);
const header = (name: string) => within(table()).getByRole("button", { name });

describe("FiiTable", () => {
  it("carteira vazia mostra o aviso", () => {
    setup([]);
    expect(screen.getByText("Carteira vazia")).toBeInTheDocument();
  });

  it("começa ordenada por ticker em ordem alfabética", () => {
    setup();
    expect(tickers()).toEqual(["HGLG11", "KNRI11", "MXRF11"]);
    expect(header("Ativo").closest("th")).toHaveAttribute("aria-sort", "ascending");
  });

  it("clicar de novo inverte a ordem", async () => {
    setup();
    await userEvent.click(header("Ativo"));
    expect(tickers()).toEqual(["MXRF11", "KNRI11", "HGLG11"]);
    expect(header("Ativo").closest("th")).toHaveAttribute("aria-sort", "descending");
  });

  it("ordena por valor investido, do maior para o menor primeiro", async () => {
    setup();
    await userEvent.click(header("Investido"));
    expect(tickers()).toEqual(["KNRI11", "HGLG11", "MXRF11"]);
  });

  it("ordena por resultado e deixa quem não tem cotação no fim", async () => {
    setup();
    await userEvent.click(header("Resultado"));
    expect(tickers()).toEqual(["MXRF11", "KNRI11", "HGLG11"]);
    await userEvent.click(header("Resultado"));
    expect(tickers()).toEqual(["KNRI11", "MXRF11", "HGLG11"]);
  });

  it("filtra por tipo", async () => {
    setup();
    const filters = screen.getByRole("group", { name: "Filtrar por tipo" });
    await userEvent.click(within(filters).getByRole("button", { name: "papel" }));
    expect(tickers()).toEqual(["MXRF11"]);
    expect(within(filters).getByRole("button", { name: "papel" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(within(filters).getByRole("button", { name: "todos" }));
    expect(tickers()).toHaveLength(3);
  });

  it("os botões de ação chamam o ativo da linha", async () => {
    const { onEdit, onDelete, onOperation } = setup();
    await userEvent.click(within(table()).getByRole("button", { name: "Editar KNRI11" }));
    await userEvent.click(within(table()).getByRole("button", { name: "Excluir MXRF11" }));
    await userEvent.click(within(table()).getByRole("button", { name: "Registrar operação de HGLG11" }));
    expect(onEdit).toHaveBeenCalledWith(assets[0]);
    expect(onDelete).toHaveBeenCalledWith(assets[1]);
    expect(onOperation).toHaveBeenCalledWith(assets[2]);
  });
});
