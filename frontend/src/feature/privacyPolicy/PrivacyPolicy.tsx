import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigation = useNavigate();

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-gray-800">
      <header className="mx-auto max-w-4xl">
        <button
          className={
            "hover:bg-accent-color cursor-pointer rounded-lg border-2 border-black px-6 py-0.5 text-black hover:border-white hover:text-white"
          }
          onClick={() => navigation(-1)}
        >
          <span className={"text-2xl"}>&larr;</span>
        </button>
      </header>

      <main className="mx-auto mt-8 max-w-4xl">
        <article className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold">
              Política de Privacidade do Kaysen
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Última atualização: 14 de novembro de 2026
            </p>
          </header>

          <p>
            Esta Política explica como a Full Jam, responsável pelo website
            Kaysen (“Kaysen”, “Empresa”, “nós”), trata dados pessoais quando o
            proprietário de um pequeno comércio ou seus funcionários utilizam o
            serviço. O Kaysen é um website de gestão com módulos de estoque,
            pedidos e vendas e fluxo de caixa.
          </p>

          <p>
            O Kaysen não é uma ferramenta de cadastro de consumidores finais. No
            MVP, não há cadastro de clientes da loja, endereços de entrega,
            rotas, notificações de entrega, comprovantes ao consumidor, áreas
            públicas ou funcionamento offline.
          </p>

          <section>
            <h2 className="text-xl font-semibold">1. Quais dados tratamos</h2>
            <p>
              Tratamos somente os dados necessários para disponibilizar,
              proteger e dar suporte ao Kaysen:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Dados da conta:</strong> e-mail, identificadores de
                usuário e informações necessárias para autenticação e
                administração do acesso.
              </li>
              <li>
                <strong>Dados da operação do comércio:</strong> produtos,
                preços, quantidades, pedidos e vendas, entradas e saídas de
                caixa, registros de fechamento e histórico de alterações. Esses
                dados podem ser associados à conta que realizou uma ação.
              </li>
              <li>
                <strong>Dados técnicos e de segurança:</strong> endereço IP,
                tipo e versão do navegador, dispositivo e sistema operacional
                quando disponíveis, horários de acesso, registros de sessão e
                informações de diagnóstico necessárias à segurança, prevenção de
                uso indevido e solução de falhas.
              </li>
              <li>
                <strong>Dados de suporte:</strong> conteúdo das solicitações e
                comunicações enviadas ao canal de atendimento.
              </li>
              <li>
                <strong>Dados de assinatura:</strong> informações necessárias
                para administrar o plano contratado, número de usuários e volume
                de pedidos/vendas contado para faturamento. Se um provedor de
                pagamento for usado, os dados de pagamento serão tratados
                conforme a política desse provedor; o Kaysen não pretende
                armazenar dados completos de cartão.
              </li>
            </ul>
            <p>
              Não solicitamos dados pessoais de clientes finais para os módulos
              do MVP. Evite inserir nesses campos informações pessoais que não
              sejam necessárias à operação do seu comércio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Como usamos os dados</h2>
            <p>Usamos os dados para:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>criar e administrar contas e autenticar usuários;</li>
              <li>disponibilizar estoque, pedidos/vendas e fluxo de caixa;</li>
              <li>
                relacionar operações ao usuário responsável, manter o histórico
                e apoiar a conferência dos registros;
              </li>
              <li>
                calcular o uso incluído no plano e eventual excedente, conforme
                as condições apresentadas antes da contratação;
              </li>
              <li>
                manter a segurança, prevenir fraudes e investigar falhas ou uso
                indevido;
              </li>
              <li>responder a solicitações e prestar suporte;</li>
              <li>
                cumprir obrigações legais e contratuais e proteger direitos em
                procedimentos administrativos ou judiciais;
              </li>
              <li>
                avaliar o funcionamento do serviço com registros técnicos
                necessários, buscando reduzir ou agregar dados quando possível.
              </li>
            </ul>
            <p>
              Não usamos os dados do Kaysen para enviar campanhas de marketing,
              ofertas por SMS ou anúncios direcionados como parte do modelo
              atual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              3. Bases e papéis no tratamento
            </h2>
            <p>
              Tratamos dados pessoais conforme a legislação aplicável e a base
              legal adequada a cada finalidade, como execução do contrato,
              cumprimento de obrigação legal ou regulatória, exercício regular
              de direitos, legítimo interesse avaliado conforme a lei ou
              consentimento quando necessário.
            </p>
            <p>
              Para dados de conta, segurança e administração do próprio Kaysen,
              a Empresa determina as finalidades e atua como controladora. Para
              dados pessoais que o comércio eventualmente inclua nos registros
              operacionais, o comércio contratante determina as finalidades da
              sua atividade e, conforme o caso, atua como controlador; o Kaysen
              trata esses dados para prestar o serviço, segundo as instruções e
              condições acordadas. O comércio deve ter fundamento adequado para
              inserir dados pessoais no sistema e orientar seus funcionários
              sobre o uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Cookies</h2>
            <p>
              O website pode utilizar cookies estritamente necessários para
              manter a sessão, autenticar usuários e proteger a conta. Esses
              cookies são necessários ao funcionamento das áreas autenticadas. O
              modelo atual não prevê cookies de publicidade, pixels de marketing
              ou ferramentas de análise comportamental. Caso sejam adicionadas
              tecnologias opcionais, esta Política será atualizada e as escolhas
              do usuário serão solicitadas quando exigido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Compartilhamento</h2>
            <p>
              Podemos permitir o acesso aos dados por fornecedores contratados
              que sejam necessários para operar o website, como serviços de
              hospedagem, banco de dados, autenticação, armazenamento, segurança
              e suporte. Esses fornecedores devem tratar os dados somente para
              prestar os serviços contratados, conforme instruções e medidas de
              proteção aplicáveis.
            </p>
            <p>
              Também poderemos compartilhar dados quando isso for necessário
              para cumprir a lei ou uma ordem válida de autoridade, proteger
              direitos e segurança, investigar fraude ou responder a uma
              situação de risco. Não vendemos dados pessoais nem os
              compartilhamos com terceiros para marketing próprio deles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              6. Armazenamento e transferências
            </h2>
            <p>
              Os dados podem ser armazenados pela Empresa ou por fornecedores de
              infraestrutura necessários ao serviço. Dependendo dos fornecedores
              efetivamente contratados, o tratamento poderá ocorrer no Brasil ou
              em outros países. Quando houver transferência internacional, ela
              deverá observar os mecanismos e salvaguardas exigidos pela
              legislação brasileira.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Por quanto tempo mantemos os dados
            </h2>
            <p>
              Mantemos dados pessoais pelo tempo necessário às finalidades
              informadas, à prestação do serviço e ao cumprimento de obrigações
              legais, contratuais e regulatórias.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Conta:</strong> durante a vigência do acesso e, depois
                do encerramento, por até 24 meses quando necessário para tratar
                questões pendentes, cumprir obrigações ou defender direitos.
              </li>
              <li>
                <strong>Suporte:</strong> solicitações e correspondências por
                até 24 meses após o encerramento do atendimento, salvo
                necessidade de retenção maior por obrigação legal ou exercício
                de direitos.
              </li>
              <li>
                <strong>Registros técnicos e de segurança:</strong> por até 24
                meses, quando necessários para segurança e solução de problemas,
                salvo obrigação legal ou investigação em andamento.
              </li>
              <li>
                <strong>Registros operacionais do comércio:</strong> durante o
                contrato e pelo período necessário para atender às instruções do
                contratante, às regras contratuais e às obrigações legais
                aplicáveis. O comércio deve exportar os registros de que
                necessite antes do encerramento, conforme as condições de saída
                do plano.
              </li>
            </ul>
            <p>
              Ao fim dos prazos aplicáveis, os dados serão excluídos ou
              anonimizados. Cópias de segurança poderão permanecer por período
              limitado, conforme o ciclo de retenção e recuperação, e não serão
              usadas para finalidades ordinárias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              8. Direitos dos titulares e solicitações
            </h2>
            <p>
              Nos termos da legislação aplicável, titulares podem solicitar
              confirmação e acesso a dados pessoais, correção, informação sobre
              compartilhamento, portabilidade quando aplicável, anonimização,
              bloqueio ou eliminação nos casos previstos em lei, além de revogar
              consentimento quando essa for a base utilizada.
            </p>
            <p>
              Para exercer direitos relacionados aos dados de conta, segurança
              ou atendimento do Kaysen, entre em contato pelo canal de
              privacidade indicado no website Kaysen. Poderemos solicitar
              informações para confirmar a identidade e localizar os dados.
              Quando os dados estiverem sob responsabilidade do comércio
              contratante, encaminharemos ou apoiaremos a solicitação conforme
              os papéis e instruções aplicáveis. Alguns dados poderão ser
              mantidos quando houver obrigação legal ou outra hipótese
              autorizada por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Segurança</h2>
            <p>
              Adotamos medidas técnicas e administrativas compatíveis com a
              natureza dos dados e os riscos do serviço para proteger os dados
              contra acesso não autorizado, perda, alteração ou divulgação
              indevida. Nenhum meio de transmissão ou armazenamento é
              absolutamente seguro. Em caso de incidente que possa gerar risco
              ou dano relevante, serão adotadas as providências e comunicações
              exigidas pela legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              10. Atualizações desta Política
            </h2>
            <p>
              Esta Política poderá ser atualizada para refletir mudanças no
              serviço, nos dados tratados ou na legislação. Publicaremos a
              versão atualizada no website e informaremos mudanças relevantes
              pelos canais disponíveis. A data no início do documento indica a
              revisão mais recente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Fale Conosco</h2>
            <p>
              Se Você tiver qualquer dúvida sobre esta Política de Privacidade,
              Você pode entrar em contato conosco:
            </p>
            <ul className="list-disc pl-6">
              <li>
                Por e-mail:{" "}
                <a
                  className="text-blue-700 hover:underline"
                  href="mailto:suporte@kaysen.com"
                >
                  suporte@kaysen.com
                </a>
              </li>
            </ul>
          </section>
        </article>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
