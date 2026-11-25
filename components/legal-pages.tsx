import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { PRIVACY_EMAIL, SOURCE_URL } from "@/lib/site";

/** Data da última mudança nos textos (`AAAA-MM-DD`). */
const UPDATED_AT = "2026-11-24";

const linkClass = "font-medium text-paper underline underline-offset-2";

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-full flex-col bg-bg text-fg">
    <LandingHeader sections={false} />
    {children}
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </div>
);

const Contact = () => (
  <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
    {PRIVACY_EMAIL}
  </a>
);

export const PrivacyPage = () => (
  <Shell>
    <LegalPage
      title="Privacidade"
      summary="O FIInance guarda a sua carteira só no seu navegador. Nada do que você cadastra vai para um servidor nosso."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-fica-guardado",
          title: "O que fica guardado",
          content: (
            <>
              <p>
                Os fundos que você cadastra (ticker, tipo e segmento), as compras e vendas, os proventos, a meta de
                alocação e as últimas cotações. E a sua escolha de tema claro ou escuro.
              </p>
              <p>
                Tudo fica no armazenamento deste navegador (localStorage), neste aparelho. Nós não temos acesso a
                nada disso.
              </p>
            </>
          ),
        },
        {
          id: "terceiros",
          title: "Quem mais recebe dados",
          content: (
            <>
              <p>
                <strong>Cotações (nosso servidor e brapi.dev):</strong> para mostrar o preço de hoje, o app envia ao
                nosso servidor só os códigos dos fundos que você tem. O servidor pergunta o preço à brapi, que tem a{" "}
                <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  própria política de privacidade
                </a>
                , e devolve a resposta. Os preços ficam guardados no servidor por alguns minutos, sem nenhum dado seu.
                Quantidades, preços pagos e proventos nunca saem do seu navegador.
              </p>
              <p>
                <strong>Vercel:</strong> a hospedagem do site e do servidor registra dados técnicos de acesso (como IP e
                navegador) para entregar as páginas. Não usamos cookies, estatísticas de visita nem propaganda.
              </p>
            </>
          ),
        },
        {
          id: "backup",
          title: "Backup",
          content: (
            <p>
              O backup em JSON leva toda a carteira: fundos, operações, proventos, cotações e meta. A exportação em CSV
              leva as operações. Depois de baixados, os arquivos ficam sob o seu cuidado.
            </p>
          ),
        },
        {
          id: "como-apagar",
          title: "Como apagar",
          content: (
            <p>
              Limpe os dados deste site nas configurações do navegador. A carteira é apagada de vez e só volta se você
              tiver um backup.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              Dúvidas sobre esta página: <Contact />.
            </p>
          ),
        },
      ]}
    />
  </Shell>
);

export const TermsPage = () => (
  <Shell>
    <LegalPage
      title="Termos de uso"
      summary="As regras para usar o FIInance. Ao usar o app, você concorda com elas."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-e",
          title: "O que é o FIInance",
          content: (
            <p>
              Um painel gratuito para acompanhar uma carteira de fundos imobiliários, mantido por Diego Natalo como
              projeto pessoal. O código é aberto, no{" "}
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                GitHub
              </a>
              .
            </p>
          ),
        },
        {
          id: "nao-e-recomendacao",
          title: "Não é recomendação de investimento",
          content: (
            <p>
              O FIInance só organiza e calcula os números que você informa. Nada nele é recomendação de compra ou
              venda, e as decisões de investimento são suas. As cotações vêm de um serviço externo e podem atrasar,
              falhar ou vir erradas; confira na sua corretora antes de decidir.
            </p>
          ),
        },
        {
          id: "seus-dados",
          title: "Seus dados",
          content: (
            <p>
              A carteira fica só no seu navegador, e fazer backup é responsabilidade sua: limpar o navegador, trocar
              de aparelho ou usar uma aba anônima pode apagar tudo. Detalhes em{" "}
              <Link href="/privacidade" className={linkClass}>
                Privacidade
              </Link>
              .
            </p>
          ),
        },
        {
          id: "disponibilidade",
          title: "Disponibilidade",
          content: (
            <p>
              O FIInance é oferecido &quot;como está&quot;, sem garantia de que vai funcionar sempre ou sem erros. Ele
              pode mudar ou sair do ar.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              <Contact />
            </p>
          ),
        },
      ]}
    />
  </Shell>
);
