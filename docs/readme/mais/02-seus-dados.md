### 🔒 Seus dados

Não há servidor nem conta. Tudo é salvo no `localStorage` do navegador, na chave `fiinance:data:v1`.

Limpar os dados do navegador apaga a carteira, então use **Carteira → Backup dos dados** de vez em quando.
Ao importar, o app confere se o arquivo é um backup do fiinance e se cada registro está certo; se não estiver, recusa e nada muda.

Para buscar cotações, o app consulta a [brapi](https://brapi.dev), que exige um token para FIIs.
Sem ele a API responde 401, e dá para digitar a cotação à mão. O token fica só no navegador e não entra no backup.
