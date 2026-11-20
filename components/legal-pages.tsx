import Link from "next/link";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { PRIVACY_EMAIL, SOURCE_URL } from "@/lib/site";

/** Data da última mudança nos textos (`AAAA-MM-DD`). */
const UPDATED_AT = "2026-11-20";

const linkClass = "font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300";

const Header = () => (
  <div className="mb-10 flex items-center justify-between gap-3">
    <BrandLink />
    <LandingThemeToggle />
  </div>
);

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
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
      header={<Header />}
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
                alocação e as últimas cotações buscadas. Se você informar, também o token da brapi. E a sua escolha de
                tema claro ou escuro.
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
                <strong>brapi.dev</strong>: só quando você pede para atualizar as cotações, o navegador envia à brapi o
                código de cada fundo e, se você informou, o seu token. A brapi devolve o preço atual e tem a{" "}
                <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  própria política de privacidade
                </a>
                . Quantidades, preços pagos e proventos nunca são enviados.
              </p>
              <p>
                <strong>Vercel</strong>: a hospedagem do site registra dados técnicos de acesso (como IP e navegador)
                para entregar as páginas. Não usamos cookies, estatísticas de visita nem propaganda.
              </p>
            </>
          ),
        },
        {
          id: "backup",
          title: "Backup",
          content: (
            <p>
              O backup em JSON leva toda a carteira (fundos, operações, proventos, cotações e meta), mas não o token
              da brapi. A exportação em CSV leva as operações. Depois de baixados, os arquivos ficam sob o seu cuidado.
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
      header={<Header />}
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
