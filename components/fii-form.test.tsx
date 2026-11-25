import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Asset, Fii } from "@/types/fii";
import { FiiForm } from "./fii-form";

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`));

const setup = (props: Partial<Parameters<typeof FiiForm>[0]> = {}) => {
  const onSubmit = vi.fn();
  const tickerInUse = vi.fn<(ticker: string, ignoreId?: string) => Asset | undefined>(() => undefined);
  render(<FiiForm onSubmit={onSubmit} tickerInUse={tickerInUse} {...props} />);
  return { onSubmit, tickerInUse };
};

const fill = async (ticker: string, shares: string, price: string) => {
  await userEvent.type(field("Ticker"), ticker);
  await userEvent.type(field("Qtd. de cotas"), shares);
  await userEvent.type(field("Preço pago"), price);
};

const submit = () => userEvent.click(screen.getByRole("button", { name: /Adicionar FII|Salvar alterações/ }));

describe("FiiForm (novo ativo)", () => {
  it("envia o ativo com a compra e limpa os campos", async () => {
    const { onSubmit } = setup();
    await fill("hglg11", "10", "150,50");
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({
      asset: { ticker: "HGLG11", type: "tijolo", segment: "lajes" },
      buy: { date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), shares: 10, price: 150.5 },
    });
    expect(field("Ticker")).toHaveValue("");
    expect(field("Qtd. de cotas")).toHaveValue("");
  });

  it("mostra os erros e não envia com campos vazios", async () => {
    const { onSubmit } = setup();
    await submit();
    expect(screen.getByText("Informe o ticker")).toBeInTheDocument();
    expect(screen.getByText("Informe a quantidade")).toBeInTheDocument();
    expect(screen.getByText("Informe o preço")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("valida o formato do ticker, cotas inteiras e preço positivo", async () => {
    const { onSubmit } = setup();
    await fill("ABC", "2,5", "0");
    await submit();
    expect(screen.getByText("Formato inválido (ex.: HGLG11)")).toBeInTheDocument();
    expect(screen.getByText("Use um número inteiro maior que 0")).toBeInTheDocument();
    expect(screen.getByText("Deve ser maior que 0")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("o preço tem no máximo 2 casas decimais (o banco guarda centavos)", async () => {
    const { onSubmit } = setup();
    await fill("HGLG11", "10", "150,505");
    await submit();
    expect(screen.getByText("Use no máximo 2 casas decimais")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("recusa data no futuro", async () => {
    const { onSubmit } = setup();
    await fill("HGLG11", "1", "10");
    fireEvent.change(field("Data da compra"), { target: { value: "2999-01-01" } });
    await submit();
    expect(screen.getByText("Data no futuro")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("o tipo é um grupo com os botões tijolo e papel, cada um com o próprio nome", () => {
    setup();
    const group = screen.getByRole("group", { name: "Tipo" });
    expect(within(group).getAllByRole("button").map((b) => b.getAttribute("aria-label") ?? b.textContent)).toEqual([
      "tijolo",
      "papel",
    ]);
    expect(screen.getByRole("button", { name: "tijolo" })).toHaveAttribute("aria-pressed", "true");
  });

  it("trocar para papel muda a lista de segmentos", async () => {
    const { onSubmit } = setup();
    await userEvent.click(screen.getByRole("button", { name: "papel" }));
    expect(screen.getByRole("button", { name: "papel" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("option", { name: "CDI" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "lajes" })).toBeNull();
    await fill("MXRF11", "1", "10");
    await submit();
    expect(onSubmit.mock.calls[0][0].asset).toEqual({ ticker: "MXRF11", type: "papel", segment: "IPCA" });
  });

  it("avisa quando o ticker já está na carteira, sem bloquear a compra", async () => {
    const { onSubmit } = setup({
      tickerInUse: () => ({ id: "a", ticker: "HGLG11", type: "tijolo", segment: "logística" }),
    });
    await fill("HGLG11", "1", "10");
    expect(screen.getByText("Já está na carteira: a compra será somada à posição.")).toBeInTheDocument();
    await submit();
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe("FiiForm (editando)", () => {
  const initial: Fii = { id: "a", ticker: "HGLG11", type: "tijolo", segment: "logística", shares: 10, averagePrice: 150 };

  it("não pede compra e envia só o cadastro", async () => {
    const { onSubmit } = setup({ initial });
    expect(screen.queryByLabelText(/^Qtd. de cotas/)).toBeNull();
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({
      asset: { ticker: "HGLG11", type: "tijolo", segment: "logística" },
      buy: undefined,
    });
  });

  it("bloqueia trocar para um ticker que outro ativo já usa", async () => {
    const { onSubmit } = setup({
      initial,
      tickerInUse: vi.fn((t: string) => (t === "XPML11" ? { id: "b", ticker: t, type: "tijolo" as const, segment: "shoppings" as const } : undefined)),
    });
    await userEvent.clear(field("Ticker"));
    await userEvent.type(field("Ticker"), "XPML11");
    await submit();
    expect(screen.getByText("Ticker já cadastrado")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancelar chama onCancel", async () => {
    const onCancel = vi.fn();
    setup({ initial, onCancel });
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
