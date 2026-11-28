import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { PRIVACY_EMAIL, SOURCE_URL } from "@/lib/site";

/** Data da última mudança nos textos (`AAAA-MM-DD`). */
const UPDATED_AT = "2026-11-27";

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
      summary="O FIInance guarda a sua carteira na sua conta, num banco de dados, para você ver os mesmos números em qualquer aparelho. Nada é vendido nem usado para propaganda."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-fica-guardado",
          title: "O que fica guardado",
          content: (
            <>
              <p>
                <strong>Da conta:</strong> seu nome, seu e-mail e a sua senha, guardada só como hash (não dá para lê-la
                de volta). Para manter você conectado, também as sessões abertas, com o IP e o navegador de cada uma.
              </p>
              <p>
                <strong>Da carteira:</strong> os fundos que você cadastra: ticker, tipo, segmento ou perfil de risco,
                cotas, preço médio, último rendimento e a nota que você dá a cada um.
              </p>
              <p>
                <strong>Neste navegador:</strong> o cookie de sessão, necessário para entrar, e a sua escolha de tema
                claro ou escuro. Não usamos outros cookies.
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
                <strong>Neon:</strong> o banco de dados onde ficam a conta e a carteira.
              </p>
              <p>
                <strong>Vercel:</strong> a hospedagem do site e do servidor, que também registra dados técnicos de acesso
                (como IP e navegador) para entregar as páginas.
              </p>
              <p>Ninguém mais recebe seus dados. Não usamos estatísticas de visita nem propaganda.</p>
            </>
          ),
        },
        {
          id: "como-apagar",
          title: "Como apagar",
          content: (
            <p>
              Em <strong>Conta → Excluir conta</strong>, com a sua senha. A conta e toda a carteira são apagadas do banco
              na hora e não podem ser recuperadas.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              Dúvidas ou pedidos sobre os seus dados: <Contact />.
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
              venda, e as decisões de investimento são suas. Confira os números na sua corretora antes de decidir.
            </p>
          ),
        },
        {
          id: "seus-dados",
          title: "Seus dados",
          content: (
            <p>
              A carteira fica na sua conta, e você é responsável por manter a sua senha em segredo. Você pode excluir a
              conta e todos os dados quando quiser, em Conta. Detalhes em{" "}
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
