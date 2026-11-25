"use client";

import { useId, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import {
  PASSWORD_MIN,
  hasErrors,
  validateSignIn,
  validateSignUp,
  type FieldErrors,
  type SignUpInput,
} from "@/lib/auth-form";
import { cn } from "@/lib/cn";

export type AuthMode = "sign-in" | "sign-up";

type Props = {
  mode: AuthMode;
  /** Sends the form; resolves with an error message, or null on success. */
  onSubmit: (values: SignUpInput) => Promise<string | null>;
};

const COPY = {
  "sign-in": { submit: "Entrar", pending: "Entrando…" },
  "sign-up": { submit: "Criar conta", pending: "Criando conta…" },
} as const;

const noSubscribe = () => () => {};

export const AuthForm = ({ mode, onSubmit }: Props) => {
  const id = useId();
  const [values, setValues] = useState<SignUpInput>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<SignUpInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const signUp = mode === "sign-up";

  const change = (field: keyof SignUpInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // a mensagem some assim que a pessoa corrige o campo
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const found: FieldErrors<SignUpInput> = signUp
      ? validateSignUp(values)
      : validateSignIn(values);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) {
      const first = (["name", "email", "password"] as const).find((f) => found[f]);
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setPending(true);
    const message = await onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    // em caso de sucesso a tela navega; o botão fica em "Entrando…" até lá
    if (message) {
      setFormError(message);
      setPending(false);
    }
  };

  // `post` e o botão desligado até hidratar: antes do JavaScript carregar, o envio
  // nativo (GET por padrão) poria a senha na URL, no histórico e nos logs.
  return (
    <form method="post" noValidate onSubmit={submit} className="flex flex-col gap-4">
      {signUp && (
        <Field
          id={`${id}-name`}
          label="Nome"
          error={errors.name}
          input={{
            type: "text",
            autoComplete: "name",
            value: values.name,
            onChange: change("name"),
          }}
        />
      )}
      <Field
        id={`${id}-email`}
        label="E-mail"
        error={errors.email}
        input={{
          type: "email",
          autoComplete: "email",
          inputMode: "email",
          value: values.email,
          onChange: change("email"),
        }}
      />
      <Field
        id={`${id}-password`}
        label="Senha"
        hint={signUp ? `Pelo menos ${PASSWORD_MIN} caracteres.` : undefined}
        error={errors.password}
        input={{
          type: showPassword ? "text" : "password",
          autoComplete: signUp ? "new-password" : "current-password",
          value: values.password,
          onChange: change("password"),
        }}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className="grid size-10 place-items-center rounded-[10px] text-muted hover:bg-raised hover:text-fg"
          >
            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        }
      />

      {formError && (
        <p role="alert" className="rounded-[14px] border border-down/40 bg-down/10 px-4 py-3 text-sm font-medium text-down">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={!hydrated || pending}
        className="mt-2 h-13 rounded-[14px] bg-fg text-base font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? COPY[mode].pending : COPY[mode].submit}
      </button>
    </form>
  );
};

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  input: {
    type: string;
    autoComplete: string;
    inputMode?: "email";
    value: string;
    onChange: (value: string) => void;
  };
  trailing?: ReactNode;
};

const Field = ({ id, label, hint, error, input, trailing }: FieldProps) => {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] text-muted">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-1 rounded-xl border bg-bg pr-1.5 focus-within:border-paper",
          error ? "border-down" : "border-line",
        )}
      >
        <input
          id={id}
          name={id.split("-").pop()}
          type={input.type}
          autoComplete={input.autoComplete}
          inputMode={input.inputMode}
          value={input.value}
          onChange={(e) => input.onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn("min-w-0 flex-1 bg-transparent px-4 text-base outline-none", trailing ? "pr-1" : "")}
        />
        {trailing}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-down">
          {error}
        </p>
      )}
    </div>
  );
};
