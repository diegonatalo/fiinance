import { useRef } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { useToast } from "@/lib/toast-context";
import {
  downloadFile,
  dataToJson,
  transactionsToCsv,
} from "@/lib/export-data";
import { today } from "@/lib/date";
import {
  DownloadSimpleIcon,
  FileCsvIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

export function BackupCard() {
  const { data, importData } = usePortfolioContext();
  const notify = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    const hasData = data.assets.length > 0;
    if (
      hasData &&
      !window.confirm("Importar vai substituir TODOS os dados atuais. Continuar?")
    ) {
      return;
    }
    const ok = importData(await file.text());
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
            downloadFile(
              `fiinance-backup-${today()}.json`,
              dataToJson(data),
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
          disabled={data.transactions.length === 0}
          onClick={() =>
            downloadFile(
              `fiinance-operacoes-${today()}.csv`,
              transactionsToCsv(data),
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
          onChange={handleFile}
        />
      </div>
    </Card>
  );
}
