import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { formatBRL } from "@/lib/format";
import type { Asset } from "@/types/fii";
import { AveragePriceCalc } from "./average-price-calculator";
import { MagicNumberCalc } from "./magic-number-calculator";

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`));

// O Testing Library troca o espaço não separável do texto da tela por espaço comum.
const brl = (n: number) => formatBRL(n).replace(/\s/g, " ");

const hglg: Asset = {
  id: "a",
  ticker: "HGLG11",
  type: "tijolo",
  segment: "logístico",
  risk: null,
  shares: 10,
  averagePrice: 10,
  lastDividend: 1,
  rating: 5,
};

describe("AveragePriceCalc", () => {
  it("sem carteira, pede a posição e mostra o novo preço médio caindo", async () => {
    render(<AveragePriceCalc assets={[]} onRecord={vi.fn()} />);
    expect(screen.getByText(/Preencha sua posição atual e a compra/)).toBeInTheDocument();
    await userEvent.type(field("Cotas atuais"), "10");
    await userEvent.type(field("Preço médio atual"), "10");
    await userEvent.type(field("Cotas compradas"), "10");
    await userEvent.type(field("Preço por cota"), "8");
    expect(screen.getByText(brl(9))).toBeInTheDocument();
    expect(screen.getByText(/▼ cai/)).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    // posição digitada não é um fundo da carteira: não dá para registrar
    expect(screen.queryByRole("button", { name: /Aplicar esta compra/ })).toBeNull();
  });

  it("começa pelo primeiro fundo da carteira e permite aplicar a compra", async () => {
    const onRecord = vi.fn();
    render(<AveragePriceCalc assets={[hglg]} onRecord={onRecord} />);
    expect(field("Fundo")).toHaveValue("a");
    expect(screen.queryByLabelText(/^Cotas atuais/)).toBeNull();
    expect(field("Preço por cota")).toHaveValue("");
    await userEvent.type(field("Cotas compradas"), "10");
    await userEvent.type(field("Preço por cota"), "12");
    expect(screen.getByText(/▲ sobe/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Aplicar esta compra/ }));
    expect(onRecord).toHaveBeenCalledWith(hglg, 10, 12);
  });

  it("cotas fracionadas não podem ser aplicadas", async () => {
    render(<AveragePriceCalc assets={[hglg]} onRecord={vi.fn()} />);
    await userEvent.type(field("Cotas compradas"), "1,5");
    await userEvent.type(field("Preço por cota"), "12");
    expect(screen.queryByRole("button", { name: /Aplicar esta compra/ })).toBeNull();
  });
});

describe("MagicNumberCalc", () => {
  it("sem carteira, calcula quantas cotas faltam e quanto custa", async () => {
    render(<MagicNumberCalc assets={[]} />);
    await userEvent.type(field("Provento por cota"), "1");
    await userEvent.type(field("Preço da cota"), "100");
    await userEvent.type(field("Cotas que você já possui"), "40");
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("60 cotas")).toBeInTheDocument();
    expect(screen.getByText(brl(6000))).toBeInTheDocument();
  });

  it("avisa quando a meta já foi atingida", async () => {
    render(<MagicNumberCalc assets={[]} />);
    await userEvent.type(field("Provento por cota"), "1");
    await userEvent.type(field("Preço da cota"), "10");
    await userEvent.type(field("Cotas que você já possui"), "15");
    expect(screen.getByText(/Meta atingida/)).toBeInTheDocument();
  });

  it("com um fundo, usa o último rendimento e as cotas da carteira", async () => {
    render(<MagicNumberCalc assets={[hglg]} />);
    expect(field("Provento por cota")).toHaveValue("1");
    expect(screen.getByText("último rendimento cadastrado")).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Cotas que você já possui/)).toBeNull();
    await userEvent.type(field("Preço da cota"), "160,50");
    // 160,50 ÷ 1 = 161 cotas; tem 10
    expect(screen.getByText("161")).toBeInTheDocument();
    expect(screen.getByText("151 cotas")).toBeInTheDocument();
  });
});
