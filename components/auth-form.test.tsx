import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth-form";

describe("AuthForm: entrar", () => {
  it("não envia com campos vazios, mostra os erros e foca o primeiro", async () => {
    const onSubmit = vi.fn(async () => null);
    render(<AuthForm mode="sign-in" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(onSubmit).not.toHaveBeenCalled();
    const email = screen.getByLabelText("E-mail");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Informe seu e-mail.");
    expect(email).toHaveFocus();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Nome")).toBeNull();
  });

  it("envia e-mail sem espaços e a senha como foi digitada", async () => {
    const onSubmit = vi.fn(async () => null);
    render(<AuthForm mode="sign-in" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("E-mail"), " ana@exemplo.com ");
    await userEvent.type(screen.getByLabelText("Senha"), " segredo ");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(onSubmit).toHaveBeenCalledWith({ name: "", email: "ana@exemplo.com", password: " segredo " });
    // fica esperando a navegação
    expect(screen.getByRole("button", { name: "Entrando…" })).toBeDisabled();
  });

  it("mostra o erro do servidor e libera o botão", async () => {
    render(<AuthForm mode="sign-in" onSubmit={async () => "E-mail ou senha incorretos."} />);
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });

  it("o botão do olho mostra e esconde a senha", async () => {
    render(<AuthForm mode="sign-in" onSubmit={async () => null} />);
    const password = screen.getByLabelText("Senha");
    expect(password).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(password).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: "Esconder senha" }));
    expect(password).toHaveAttribute("type", "password");
  });
});

describe("AuthForm: criar conta", () => {
  it("pede nome e senha longa, e o erro some ao corrigir", async () => {
    const onSubmit = vi.fn(async () => null);
    render(<AuthForm mode="sign-up" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "curta");
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome")).toHaveFocus();
    expect(screen.getByText(/pelo menos 8 caracteres\.$/, { selector: "[id$='-error']" })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Nome"), "Ana");
    expect(screen.queryByText("Informe seu nome.")).toBeNull();
    await userEvent.type(screen.getByLabelText("Senha"), "-mais-longa");
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Ana", email: "ana@exemplo.com", password: "curta-mais-longa" });
  });

  it("usa os autocompletes certos para o gerenciador de senhas", () => {
    render(<AuthForm mode="sign-up" onSubmit={async () => null} />);
    expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "email");
  });
});

describe("AuthForm: antes de o JavaScript carregar", () => {
  it.each(["sign-in", "sign-up"] as const)("%s não consegue mandar a senha na URL", (mode) => {
    const html = document.createElement("div");
    html.innerHTML = renderToString(<AuthForm mode={mode} onSubmit={async () => null} />);
    expect(html.querySelector("form")).toHaveAttribute("method", "post");
    expect(html.querySelector('button[type="submit"]')).toBeDisabled();
  });

  it("depois de carregar, o botão liga", () => {
    render(<AuthForm mode="sign-in" onSubmit={async () => null} />);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
