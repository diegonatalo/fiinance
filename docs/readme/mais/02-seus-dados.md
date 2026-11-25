### 🔒 Seus dados

Não há conta. A carteira é salva no `localStorage` do navegador, na chave `fiinance:data:v1`.

Limpar os dados do navegador apaga a carteira, então use **Carteira → Backup dos dados** de vez em quando.
Ao importar, o app confere se o arquivo é um backup do fiinance e se cada registro está certo; se não estiver, recusa e nada muda.

As cotações chegam sozinhas: ao abrir o app, ele chama a rota `/api/quotes` com os tickers que você tem.
A rota consulta a [brapi](https://brapi.dev) no servidor, com o token em `BRAPI_TOKEN`, e guarda cada preço por alguns minutos.
Quantidades, preços pagos e proventos nunca saem do navegador.
