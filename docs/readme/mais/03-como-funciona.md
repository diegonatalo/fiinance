### 🧠 Como funciona

O app guarda **operações**, e a posição de cada fundo é sempre derivada delas.

| Conceito | Regra |
|---|---|
| **Compra** | Soma as cotas e recalcula o preço médio ponderado. |
| **Venda** | Reduz as cotas e mantém o preço médio. Não deixa vender mais do que havia na data. |
| **Provento** | `valor por cota × cotas em carteira na data do pagamento`. |
| **Yield on cost (12m)** | Proventos dos últimos 12 meses ÷ total investido. |
| **Número mágico** | `⌈cotação ÷ provento por cota⌉`: cotas para o provento do mês comprar uma nova. |
| **Cotação** | Chega sozinha ao abrir o app e é buscada de novo depois de 15 minutos. |
| **Aporte para a meta** | Menor compra em uma só classe que leva à proporção desejada: `(A + x) / (T + x) = alvo`. |

> Os valores servem para acompanhamento e não substituem a nota de corretagem nem o informe de
> rendimentos. O app não calcula imposto de renda.
