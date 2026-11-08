Requer [Node.js](https://nodejs.org) e [pnpm](https://pnpm.io).

```bash
git clone https://github.com/diegonatalo/FIInance.git
cd FIInance
pnpm install
pnpm dev        # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento com HMR, também acessível pela rede local (`--host`) |
| `pnpm build` | Checa os tipos e gera o build de produção em `dist/` |
| `pnpm preview` | Serve o build de produção |
| `pnpm lint` | Roda o ESLint |

### 🔑 Variáveis de ambiente

Há uma só, usada apenas no build. O modelo está em [`.env.example`](.env.example).

| Variável | Descrição | Se não for definida |
|---|---|---|
| `VITE_SITE_URL` | URL pública do site, sem barra final. | `robots.txt` sai sem a linha `Sitemap`, e o `sitemap.xml` não é gerado. |

No repositório, `.env.production` já aponta para `https://fiinance1.vercel.app`.
