import { useRef } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToast } from "@/hooks/use-toast";
import { useDownload } from "@/hooks/use-download";
import {
  dataToJson,
  transactionsToCsv,
} from "@/lib/export-data";
import { today } from "@/lib/date";
import {
  DownloadSimpleIcon,
  FileCsvIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

export const BackupCard = () => {
  const { data, importData } = usePortfolioContext();
  const downloadFile = useDownload();
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
      <CardTitle className="mb-1.5">Backup dos dados</CardTitle>
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted">
        Seus dados ficam apenas neste navegador. Exporte um backup para não
        perdê-los ao limpar o navegador ou trocar de computador. O arquivo leva
        toda a carteira: guarde em lugar seguro.
      </p>
      <div className="flex flex-wrap gap-2 *:max-sm:w-full">
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
          <DownloadSimpleIcon size={16} aria-hidden="true" /> Exportar backup (JSON)
        </Button>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          <UploadSimpleIcon size={16} aria-hidden="true" /> Importar backup
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
          <FileCsvIcon size={16} aria-hidden="true" /> Exportar operações (CSV)
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
};
