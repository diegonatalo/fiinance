import { useRef } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCarteiraContext } from "../contexts/carteira-context";
import { useToast } from "../contexts/toast-context";
import {
  baixarArquivo,
  dadosParaJson,
  transacoesParaCsv,
} from "../lib/exportar";
import { hoje } from "../lib/data";
import {
  DownloadSimpleIcon,
  FileCsvIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

export function BackupCard() {
  const { dados, importar } = useCarteiraContext();
  const notify = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleArquivo(ev: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = ev.target.files?.[0];
    ev.target.value = "";
    if (!arquivo) return;
    const temDados = dados.ativos.length > 0;
    if (
      temDados &&
      !window.confirm("Importar vai substituir TODOS os dados atuais. Continuar?")
    ) {
      return;
    }
    const ok = importar(await arquivo.text());
    notify(ok ? "Backup importado" : "Arquivo inválido: nada foi alterado");
  }

  return (
    <Card>
      <CardTitle className="mb-1">Backup dos dados</CardTitle>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Seus dados ficam apenas neste navegador. Exporte um backup para não
        perdê-los ao limpar o navegador ou trocar de computador.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            baixarArquivo(
              `fiinance-backup-${hoje()}.json`,
              dadosParaJson(dados),
              "application/json",
            )
          }
        >
          <DownloadSimpleIcon size={16} /> Exportar backup (JSON)
        </Button>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          <UploadSimpleIcon size={16} /> Importar backup
        </Button>
        <Button
          variant="outline"
          disabled={dados.transacoes.length === 0}
          onClick={() =>
            baixarArquivo(
              `fiinance-operacoes-${hoje()}.csv`,
              transacoesParaCsv(dados),
              "text/csv;charset=utf-8",
            )
          }
        >
          <FileCsvIcon size={16} /> Exportar operações (CSV)
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleArquivo}
        />
      </div>
    </Card>
  );
}
