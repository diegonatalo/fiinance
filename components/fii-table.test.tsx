import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Asset } from "@/types/fii";
import { FiiTable, type TypeFilter } from "./fii-table";

const fii = (id: string, ticker: string, type: Asset["type"], shares: number, averagePrice: number, rating: number): Asset => ({
  id,
  ticker,
  type,
  segment: type === "tijolo" ? "lajes corporativas" : null,
  risk: type === "papel" ? "High Grade" : null,
  shares,
  averagePrice,
  lastDividend: 0.5,
  rating,
});

// investido: KNRI 1000, MXRF 100, HGLG 500 (total 1600); notas 5, 3 e 2 (metas 50%, 30%, 20%)
const assets = [
  fii("k", "KNRI11", "tijolo", 10, 100, 5),
  fii("m", "MXRF11", "papel", 10, 10, 3),
  fii("h", "HGLG11", "tijolo", 5, 100, 2),
];

const setup = (filter: TypeFilter = "all") => {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn() };
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
  });

  it("ordenar por meta traz primeiro o que está mais abaixo dela", async () => {
    setup();
    await userEvent.click(header("Peso / meta"));
    // MXRF 6,25% de 30% (−23,75); KNRI 62,5% de 50% (+12,5); HGLG 31,25% de 20% (+11,25)
    expect(tickers()).toEqual(["MXRF11", "HGLG11", "KNRI11"]);
  });

  it("mostra o peso, a meta e os proventos esperados de cada fundo e o total", () => {
    setup();
    expect(row("KNRI11")).toHaveTextContent("62,5% / 50,0%");
    expect(row("KNRI11")).toHaveTextContent("+12,5 p.p.");
    expect(row("MXRF11")).toHaveTextContent("−23,8 p.p.");
    expect(row("KNRI11")).toHaveTextContent("Lajes corporativas · nota 5");
    expect(row("MXRF11")).toHaveTextContent("Papel · High Grade");
    expect(row("Total")).toHaveTextContent("R$ 1.600,00");
    // 25 cotas × R$ 0,50
    expect(row("Total")).toHaveTextContent("R$ 12,50");
  });

  it("mostra só o tipo filtrado", () => {
    setup("papel");
    expect(tickers()).toEqual(["MXRF11"]);
  });

  it("os botões de ação chamam o fundo da linha", async () => {
    const { onEdit, onDelete } = setup();
    await userEvent.click(within(table()).getByRole("button", { name: "Editar KNRI11" }));
    await userEvent.click(within(table()).getByRole("button", { name: "Excluir MXRF11" }));
    expect(onEdit).toHaveBeenCalledWith(assets[0]);
    expect(onDelete).toHaveBeenCalledWith(assets[1]);
  });

  it("no celular, tocar no fundo abre os detalhes e as ações", async () => {
    const { onEdit } = setup();
    await userEvent.click(screen.getByRole("button", { name: /^MXRF11/ }));
    const dialog = screen.getByRole("dialog", { name: "MXRF11" });
    expect(dialog).toHaveTextContent("R$ 100,00");
    expect(dialog).toHaveTextContent("3 · 30,0%");
    await userEvent.click(within(dialog).getByRole("button", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledWith(assets[1]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
