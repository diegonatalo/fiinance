Requer [Node.js](https://nodejs.org) e [pnpm](https://pnpm.io).

```bash
git clone https://github.com/diegonatalo/FIInance.git
cd FIInance
pnpm install
pnpm dev        # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento, também acessível pela rede local |
| `pnpm build` | Checa os tipos e gera o build de produção em `.next/` |
| `pnpm start` | Serve o build de produção |
| `pnpm lint` | Roda o ESLint |

### 🔑 Variáveis de ambiente

Há uma só. O nome antigo, `VITE_SITE_URL`, continua sendo aceito. O modelo está em [`.env.example`](.env.example).

| Variável | Descrição | Se não for definida |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, sem barra final. | `robots.txt` sai sem a linha `Sitemap`, e o `sitemap.xml` sai vazio. |

No repositório, `.env.production` já aponta para `https://fiinance1.vercel.app`.
