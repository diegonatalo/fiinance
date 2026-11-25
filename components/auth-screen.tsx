"use client";

import Link from "next/link";
import { AuthForm, type AuthMode } from "@/components/auth-form";
import { BrandLink } from "@/components/brand";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, safeRedirect, type SignUpInput } from "@/lib/auth-form";
import { RETURN_PARAM, paths } from "@/lib/paths";
import { SOURCE_URL } from "@/lib/site";

const COPY = {
  "sign-in": {
    title: "Entrar",
    lead: "Sua carteira de FIIs, em qualquer aparelho.",
    switchText: "Ainda não tem conta?",
    switchLabel: "Criar conta",
    switchHref: paths.signUp,
  },
  "sign-up": {
    title: "Criar conta",
    lead: "Grátis. Sua carteira fica salva na sua conta.",
    switchText: "Já tem conta?",
    switchLabel: "Entrar",
    switchHref: paths.signIn,
  },
} as const;

/** Lido só no envio, para a página não depender da URL ao renderizar. */
const returnTo = () => safeRedirect(new URLSearchParams(window.location.search).get(RETURN_PARAM));

const send = async (mode: AuthMode, values: SignUpInput) => {
  const { error } =
    mode === "sign-up"
      ? await authClient.signUp.email(values)
      : await authClient.signIn.email({ email: values.email, password: values.password });
  if (error) return authErrorMessage(error);
  // navegação completa: o app abre do zero, já com a carteira da conta
  window.location.assign(returnTo());
  return null;
};

/** Os dois pilares do símbolo, grandes, ao lado do formulário (decorativo). */
const Pillars = () => (
  <svg viewBox="0 0 200 160" aria-hidden="true" className="w-full max-w-[280px]">
    <rect x="52" y="52" width="36" height="98" rx="9" className="fill-paper" />
    <rect x="112" y="18" width="36" height="132" rx="9" className="fill-brick" />
    <line x1="16" y1="152" x2="184" y2="152" className="stroke-line" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AuthScreen = ({ mode }: { mode: AuthMode }) => {
  const copy = COPY[mode];
  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
        <BrandLink />
        <LandingThemeToggle />
      </header>

      <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-wrap items-center gap-x-16 gap-y-10 px-6 pt-8 pb-16 md:pt-14">
        <section
          aria-hidden="true"
          className="hidden flex-[1_1_320px] flex-col gap-8 rounded-[28px] border border-line bg-surface p-10 md:flex"
        >
          <Pillars />
          <p className="text-[34px] leading-[1.05] font-semibold tracking-[-0.04em]">
            Sua renda em <span className="text-paper">papel</span> e <span className="text-brick">tijolo</span>.
          </p>
        </section>

        <main id="conteudo" className="flex min-w-0 flex-[1_1_340px] flex-col">
          <h1 className="text-[40px] leading-none font-semibold tracking-[-0.045em]">{copy.title}</h1>
          <p className="mt-3 mb-7 text-[15px] text-muted">{copy.lead}</p>
          <AuthForm mode={mode} onSubmit={(values) => send(mode, values).catch(() => authErrorMessage(null))} />
          <p className="mt-6 text-sm text-muted">
            {copy.switchText}{" "}
            <Link href={copy.switchHref} className="font-semibold text-paper underline underline-offset-4">
              {copy.switchLabel}
            </Link>
          </p>
        </main>
      </div>

      <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
    </div>
  );
};
