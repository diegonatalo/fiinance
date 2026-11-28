import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Asset } from "@/types/fii";
import { FiiForm } from "./fii-form";

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`));

const setup = (props: Partial<Parameters<typeof FiiForm>[0]> = {}) => {
  const onSubmit = vi.fn();
  const tickerInUse = vi.fn<(ticker: string, ignoreId?: string) => Asset | undefined>(() => undefined);
  render(<FiiForm onSubmit={onSubmit} tickerInUse={tickerInUse} {...props} />);
  return { onSubmit, tickerInUse };
};

const fill = async (ticker: string, shares: string, price: string, dividend = "") => {
  await userEvent.type(field("Ticker"), ticker);
  await userEvent.type(field("Cotas"), shares);
  if (price) await userEvent.type(field("Preço médio"), price);
  if (dividend) await userEvent.type(field("Último rendimento"), dividend);
};

const submit = () => userEvent.click(screen.getByRole("button", { name: /Adicionar fundo|Salvar alterações/ }));

const hglg: Asset = {
  id: "a",
  ticker: "HGLG11",
  type: "tijolo",
  segment: "logístico",
  risk: null,
  shares: 10,
  averagePrice: 150.5,
  lastDividend: 1.1,
  rating: 8,
};

describe("FiiForm (novo fundo)", () => {
  it("envia o fundo de tijolo com segmento, nota e posição, e limpa os campos", async () => {
    const { onSubmit } = setup();
    await fill("hglg11", "10", "150,50", "1,10");
    await userEvent.selectOptions(field("Segmento"), "Renda urbana");
    await userEvent.selectOptions(field("Nota"), "8");
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({
      ticker: "HGLG11",
      type: "tijolo",
      segment: "renda urbana",
      risk: null,
      shares: 10,
      averagePrice: 150.5,
      lastDividend: 1.1,
      rating: 8,
    });
    expect(field("Ticker")).toHaveValue("");
    expect(field("Cotas")).toHaveValue("");
    expect(field("Nota")).toHaveValue("5");
  });

  it("papel tem perfil de risco no lugar do segmento", async () => {
    const { onSubmit } = setup();
    await userEvent.click(screen.getByRole("button", { name: "papel" }));
    expect(screen.queryByLabelText(/^Segmento/)).toBeNull();
    await userEvent.selectOptions(field("Perfil de risco"), "High Yield");
    await fill("MXRF11", "100", "9,87", "0,0825");
    await submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      type: "papel",
      segment: null,
      risk: "High Yield",
      lastDividend: 0.0825,
    });
  });

  it("o rendimento em branco vale zero e a nota padrão é 5", async () => {
    const { onSubmit } = setup();
    await fill("HGLG11", "1", "10");
    await submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ lastDividend: 0, rating: 5 });
  });

  it("mostra os erros e não envia com campos vazios", async () => {
    const { onSubmit } = setup();
    await submit();
    expect(screen.getByText("Informe o ticker")).toBeInTheDocument();
    expect(screen.getByText("Informe a quantidade")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("valida ticker, cotas inteiras, preço médio com cotas e as casas decimais", async () => {
    const { onSubmit } = setup();
    await fill("ABC", "2,5", "150,505", "0,08251");
    await submit();
    expect(screen.getByText("Formato inválido (ex.: HGLG11)")).toBeInTheDocument();
    expect(screen.getByText("Use um número inteiro")).toBeInTheDocument();
    expect(screen.getByText("Use no máximo 2 casas decimais")).toBeInTheDocument();
    expect(screen.getByText("Use no máximo 4 casas decimais")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("com cotas, o preço médio é obrigatório", async () => {
    const { onSubmit } = setup();
    await fill("HGLG11", "10", "");
    await submit();
    expect(screen.getByText("Informe o preço médio")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("recusa um ticker que já está na carteira", async () => {
    const { onSubmit } = setup({ tickerInUse: () => hglg });
    await fill("HGLG11", "1", "10");
    await submit();
    expect(screen.getByText("Ticker já cadastrado")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("o tipo é um grupo com os botões tijolo e papel", () => {
    setup();
    const group = screen.getByRole("group", { name: "Tipo" });
    expect(within(group).getAllByRole("button").map((b) => b.textContent)).toEqual(["tijolo", "papel"]);
    expect(screen.getByRole("button", { name: "tijolo" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("FiiForm (editando)", () => {
  it("começa com os valores do fundo e envia tudo de novo", async () => {
    const { onSubmit } = setup({ initial: hglg });
    expect(field("Cotas")).toHaveValue("10");
    expect(field("Preço médio")).toHaveValue("150,5");
    await userEvent.clear(field("Cotas"));
    await userEvent.type(field("Cotas"), "12");
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ ...hglg, id: undefined, shares: 12 });
  });

  it("fundo de papel sem perfil de risco pede para escolher", async () => {
    const old: Asset = { ...hglg, ticker: "MXRF11", type: "papel", segment: null, risk: null };
    const { onSubmit } = setup({ initial: old });
    await submit();
    expect(screen.getByText("Escolha o perfil de risco")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.selectOptions(field("Perfil de risco"), "High Grade");
    await submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ risk: "High Grade" });
  });

  it("o próprio ticker não conta como repetido", async () => {
    const tickerInUse = vi.fn(() => undefined);
    const { onSubmit } = setup({ initial: hglg, tickerInUse });
    await submit();
    expect(tickerInUse).toHaveBeenCalledWith("HGLG11", "a");
    expect(onSubmit).toHaveBeenCalled();
  });

  it("cancelar chama onCancel", async () => {
    const onCancel = vi.fn();
    setup({ initial: hglg, onCancel });
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
