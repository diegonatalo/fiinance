### 🧠 Como funciona

Cada fundo guarda a posição que você informa: cotas, preço médio e último rendimento, além do tipo (tijolo com segmento, papel com perfil de risco) e de uma nota de 1 a 10.

| Conceito | Regra |
|---|---|
| **Investido** | `cotas × preço médio` de cada fundo; o total é a soma. |
| **Peso** | Fatia de cada fundo no total investido. O app não busca cotações. |
| **Meta** | `nota do fundo ÷ soma das notas`. Notas 8, 6 e 6 dão 40%, 30% e 30%. |
| **Proventos esperados** | `último rendimento × cotas`, somado entre os fundos: o que a carteira deve pagar no mês. |
| **Yield on cost** | Proventos esperados × 12 ÷ total investido. |
| **Aporte mínimo para a meta** | O fundo mais acima da meta define o tamanho da carteira: `max(investido ÷ meta) − total`. |
| **Divisão do aporte** | Cada fundo recebe na proporção do que falta para a meta depois do aporte. |
| **Diversificação** | Donuts pelo valor investido: por tipo, tijolo por segmento e papel por perfil de risco. |
| **Número mágico** | `⌈preço da cota ÷ último rendimento⌉`: cotas para o provento do mês comprar uma nova. |

> Os valores servem para acompanhamento e não substituem a nota de corretagem nem o informe de
> rendimentos. O app não calcula imposto de renda.
