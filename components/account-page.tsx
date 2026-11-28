"use client";

import { useState, type FormEvent } from "react";
import { SignOutIcon } from "@phosphor-icons/react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAccount } from "@/hooks/use-account";
import { authClient } from "@/lib/auth-client";
import { ACCOUNT_HEADER, deleteErrorMessage } from "@/lib/auth-form";

/**
 * Navegação completa de propósito, não `router.push`: descarta a carteira e o
 * cache do roteador, para nada da conta ficar na memória da aba depois de sair.
 */
const leave = () => window.location.assign(new URL("/", window.location.origin));

export const AccountPage = () => {
  const account = useAccount();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState("");

  const closeDelete = () => {
    setConfirmDelete(false);
    setPassword("");
  };

  const signOut = async () => {
    setPending(true);
    setError(null);
    const { error } = await authClient.signOut().catch(() => ({ error: true }));
    if (error) {
      setPending(false);
      setError("Não foi possível sair. Verifique sua conexão e tente de novo.");
      return;
    }
    leave();
  };

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    const typed = password;
    closeDelete();
    setPending(true);
    setError(null);
    const { error } = await authClient
      .deleteUser({ password: typed, fetchOptions: { headers: { [ACCOUNT_HEADER]: account.id } } })
      .catch(() => ({ error: { code: "NETWORK" } }));
    if (error) {
      setPending(false);
      setError(deleteErrorMessage(error.code));
      return;
    }
    leave();
  };

  return (
    <>
      <PageHeader title="Conta" description="Sua carteira fica salva nesta conta, em qualquer aparelho." />

      <Card className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-raised text-2xl font-semibold"
          >
            {account.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{account.name}</p>
            <p className="truncate text-sm text-muted">{account.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 *:max-sm:w-full">
          <Button variant="outline" onClick={signOut} disabled={pending}>
            <SignOutIcon size={18} aria-hidden="true" /> Sair
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 border-down/30">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Excluir conta</CardTitle>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            A conta e toda a carteira (todos os fundos) são apagadas para sempre. Não dá para desfazer.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            className="border-down/40 text-down hover:bg-down/10 max-sm:w-full"
            onClick={() => setConfirmDelete(true)}
            disabled={pending}
          >
            Excluir conta
          </Button>
        </div>
      </Card>

      {error && (
        <p role="alert" className="rounded-[14px] border border-down/40 bg-down/10 px-4 py-3 text-sm font-medium text-down">
          {error}
        </p>
      )}

      <Modal open={confirmDelete} title="Excluir sua conta?" onClose={closeDelete}>
        <form onSubmit={deleteAccount} className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted">
            A conta e toda a carteira são apagadas para sempre. Para confirmar, digite sua senha.
          </p>
          <Field label="Sua senha">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={closeDelete}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!password} className="bg-down text-white">
              Excluir conta
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
