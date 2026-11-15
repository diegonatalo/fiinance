import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { formatBRL } from "@/lib/format";
import type { Fii, Payout } from "@/types/fii";
import { AveragePriceCalc } from "./average-price-calculator";
import { MagicNumberCalc } from "./magic-number-calculator";

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label.replace(/[()$.]/g, "\\$&")}`));

// O Testing Library troca o espaço não separável do texto da tela por espaço comum.
const brl = (n: number) => formatBRL(n).replace(/\s/g, " ");

const hglg: Fii = { id: "a", ticker: "HGLG11", type: "tijolo", segment: "logística", shares: 10, averagePrice: 10 };

describe("AveragePriceCalc", () => {
  it("sem dados, pede para preencher", () => {
    render(<AveragePriceCalc assets={[]} onRecord={vi.fn()} />);
    expect(screen.getByText(/Preencha sua posição atual e o novo aporte/)).toBeInTheDocument();
  });

  it("com posição manual, mostra o novo preço médio e que ele cai", async () => {
    render(<AveragePriceCalc assets={[]} onRecord={vi.fn()} />);
    await userEvent.type(field("Cotas atuais"), "10");
    await userEvent.type(field("Preço médio atual (R$)"), "10");
    await userEvent.type(field("Novas cotas compradas"), "10");
    await userEvent.type(field("Preço pago por cota (R$)"), "8");
    expect(screen.getByText(brl(9))).toBeInTheDocument();
    expect(screen.getByText(/Preço médio cai/)).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    // posição manual não é um ativo da carteira: não dá para registrar
    expect(screen.queryByRole("button", { name: /Registrar esta compra/ })).toBeNull();
  });

  it("com ativo da carteira, usa a posição dele e permite registrar a compra", async () => {
    const onRecord = vi.fn();
    render(<AveragePriceCalc assets={[hglg]} onRecord={onRecord} />);
    await userEvent.selectOptions(field("Usar ativo da carteira"), "a");
    expect(field("Cotas atuais")).toBeDisabled();
    expect(field("Cotas atuais")).toHaveValue("10");
    await userEvent.type(field("Novas cotas compradas"), "10");
    await userEvent.type(field("Preço pago por cota (R$)"), "12");
    expect(screen.getByText(/Preço médio sobe/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Registrar esta compra/ }));
    expect(onRecord).toHaveBeenCalledWith(hglg, 10, 12);
  });

  it("cotas fracionadas não podem ser registradas", async () => {
    render(<AveragePriceCalc assets={[hglg]} onRecord={vi.fn()} />);
    await userEvent.selectOptions(field("Usar ativo da carteira"), "a");
    await userEvent.type(field("Novas cotas compradas"), "1,5");
    await userEvent.type(field("Preço pago por cota (R$)"), "12");
    expect(screen.queryByRole("button", { name: /Registrar esta compra/ })).toBeNull();
  });
});

describe("MagicNumberCalc", () => {
  const payouts: Payout[] = [
    { id: "p1", assetId: "a", date: "2026-01-15", valuePerShare: 0.8, shares: 10 },
    { id: "p2", assetId: "a", date: "2026-02-15", valuePerShare: 1, shares: 10 },
  ];

  it("calcula quantas cotas faltam e quanto custa", async () => {
    render(<MagicNumberCalc assets={[]} payouts={[]} quotes={{}} />);
    await userEvent.type(field("Dividendo por cota (R$)"), "1");
    await userEvent.type(field("Cotação atual (R$)"), "100");
    await userEvent.type(field("Cotas que você já possui"), "40");
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText(brl(6000))).toBeInTheDocument();
  });

  it("avisa quando a meta já foi atingida", async () => {
    render(<MagicNumberCalc assets={[]} payouts={[]} quotes={{}} />);
    await userEvent.type(field("Dividendo por cota (R$)"), "1");
    await userEvent.type(field("Cotação atual (R$)"), "10");
    await userEvent.type(field("Cotas que você já possui"), "15");
    expect(screen.getByText(/Meta atingida!/)).toBeInTheDocument();
  });

  it("ao escolher um ativo, preenche o último provento e a cotação registrada", async () => {
    render(
      <MagicNumberCalc
        assets={[hglg]}
        payouts={payouts}
        quotes={{ a: { price: 160.5, updatedAt: "2026-02-20T00:00:00Z" } }}
      />,
    );
    await userEvent.selectOptions(field("Usar ativo da carteira"), "a");
    expect(field("Dividendo por cota (R$)")).toHaveValue("1");
    expect(field("Cotação atual (R$)")).toHaveValue("160,5");
    expect(field("Cotas que você já possui")).toHaveValue("10");
  });
});
