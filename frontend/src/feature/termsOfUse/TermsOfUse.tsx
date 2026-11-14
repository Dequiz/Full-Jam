import { useNavigate } from "react-router-dom";

const TermsOfUse = () => {
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
            <h1 className="text-3xl font-bold">Termos de Uso do Kaysen</h1>
            <p className="mt-2 text-sm text-gray-600">
              Última atualização: 14 de novembro de 2026
            </p>
          </header>

          <p>
            Estes Termos regulam o acesso ao website Kaysen, oferecido pela{" "}
            <strong>Full Jam</strong> (“Full Jam”, “Kaysen” ou “Empresa”) para
            pequenos comércios. O Kaysen é uma ferramenta de gestão que
            contempla estoque, pedidos/vendas e fluxo de caixa.
          </p>

          <section>
            <h2 className="text-xl font-semibold">
              1. Aceitação e finalidade do serviço
            </h2>
            <p>
              Ao criar uma conta, aceitar estes Termos ou usar o Kaysen, o
              usuário confirma que teve acesso ao seu conteúdo e concorda com as
              condições aplicáveis. Se não concordar, não deve utilizar o
              serviço. A contratação do plano deve ser realizada pelo
              proprietário do comércio ou por pessoa autorizada a representá-lo.
            </p>
            <p>
              O Kaysen apoia os registros da operação do comércio. Não substitui
              a conferência das informações, os controles contábeis ou fiscais,
              nem o julgamento do responsável pelo estabelecimento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              2. Usuários, contas e permissões
            </h2>
            <p>O serviço destina-se a dois grupos:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Proprietário ou administrador do comércio:</strong>{" "}
                contrata o plano, administra a conta do estabelecimento, mantém
                os dados comerciais e autoriza os acessos da equipe, conforme as
                funções disponíveis.
              </li>
              <li>
                <strong>Funcionário:</strong> utiliza uma conta individual
                criada ou autorizada pelo comércio e acessa somente as funções
                liberadas para seu perfil.
              </li>
            </ul>
            <p>
              As contas são pessoais e não devem ser compartilhadas. Cada
              usuário deve proteger suas credenciais e informar ao proprietário
              ou ao canal oficial do Kaysen se suspeitar de acesso indevido. O
              proprietário deve remover ou ajustar o acesso de funcionários que
              deixem de utilizar o sistema.
            </p>
            <p>
              O usuário deve fornecer informações corretas, manter seus dados de
              acesso atualizados e utilizar o Kaysen apenas em nome do comércio
              que autorizou o acesso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Escopo</h2>
            <p>O escopo do Kaysen compreende:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>cadastro e consulta de produtos, preços e quantidades;</li>
              <li>registro de pedidos/vendas e histórico;</li>
              <li>
                registro de saldo inicial, entradas e saídas e acompanhamento do
                fluxo de caixa.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. Dados e conteúdo inseridos pelo comércio
            </h2>
            <p>
              O comércio mantém os direitos sobre os dados e conteúdos que
              inserir no Kaysen, incluindo produtos, preços, quantidades,
              pedidos/vendas e movimentações de caixa. O comércio autoriza a
              Full Jam a armazenar e tratar esses dados somente na medida
              necessária para fornecer, proteger, manter e dar suporte ao
              serviço, conforme estes Termos e a Política de Privacidade.
            </p>
            <p>
              O proprietário é responsável por autorizar os funcionários e
              orientar a equipe sobre os dados que podem ser inseridos. Não
              devem ser inseridos dados pessoais de consumidores finais ou
              informações sensíveis que não sejam necessários.
            </p>
            <p>
              A Política de Privacidade do Kaysen explica como dados pessoais de
              proprietários, funcionários e registros da conta são tratados. Em
              caso de divergência sobre o tratamento de dados, a Política de
              Privacidade e as instruções do comércio devem ser consideradas
              conforme os papéis de cada parte e a legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Uso adequado</h2>
            <p>O usuário e o comércio comprometem-se a:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                utilizar o serviço de forma lícita e conforme as permissões de
                sua conta;
              </li>
              <li>
                não tentar acessar contas, dados ou áreas sem autorização;
              </li>
              <li>
                não interferir na segurança, disponibilidade ou funcionamento do
                website;
              </li>
              <li>
                não inserir código malicioso ou conteúdo que comprometa o
                serviço;
              </li>
              <li>
                conferir os registros antes de confirmar operações e comunicar
                falhas ou divergências pelo canal oficial.
              </li>
            </ul>
            <p>
              A Full Jam poderá investigar indícios de uso indevido e tomar
              medidas proporcionais para proteger o serviço e seus usuários,
              respeitando a legislação aplicável e comunicando o responsável
              quando possível.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              6. Propriedade intelectual
            </h2>
            <p>
              O Kaysen, sua marca, interface, código e materiais pertencem à
              Full Jam ou aos respectivos titulares e são protegidos pelas leis
              aplicáveis. Durante a vigência do plano, a Full Jam concede ao
              comércio uma autorização limitada, não exclusiva e não
              transferível para acessar o serviço e utilizá-lo nas atividades do
              estabelecimento.
            </p>
            <p>
              Estes Termos não transferem ao comércio a titularidade do código,
              da marca ou dos materiais do Kaysen. Também não transferem à Full
              Jam a titularidade dos dados comerciais inseridos pelo comércio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Disponibilidade, manutenção e suporte
            </h2>
            <p>
              A Full Jam buscará manter o serviço disponível e poderá realizar
              manutenção, atualizações ou correções. O serviço pode ficar
              temporariamente indisponível por manutenção, falha de rede,
              infraestrutura ou outros eventos. Quando possível, a Full Jam
              comunicará manutenções relevantes pelos canais disponíveis.
            </p>
            <p>
              O usuário deve comunicar problemas e fornecer as informações
              necessárias para a análise, sem enviar senhas, tokens ou outros
              segredos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              8. Alterações do serviço e dos Termos
            </h2>
            <p>
              A Full Jam poderá atualizar o serviço e estes Termos para refletir
              mudanças de funcionalidade, segurança ou exigências legais.
              Mudanças relevantes serão comunicadas pelos canais disponíveis com
              antecedência razoável, quando aplicável. Alterações de preço,
              franquia ou escopo deverão ser informadas antes de entrarem em
              vigor e seguir as condições do plano e a legislação aplicável.
            </p>
            <p>
              Se o usuário não concordar com uma alteração relevante, poderá
              solicitar o cancelamento conforme as condições do plano. Direitos
              obrigatórios previstos em lei não são limitados por estes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              9. Cancelamento, suspensão e encerramento
            </h2>
            <p>
              O proprietário pode solicitar o cancelamento pelo canal ou
              procedimento informado no plano. As condições de cobrança
              proporcional, aviso prévio e encerramento devem ser apresentadas
              antes da contratação.
            </p>
            <p>
              A Full Jam poderá suspender temporariamente um acesso quando
              necessário para proteger a segurança do serviço, responder a
              exigência legal ou tratar violação relevante destes Termos. Sempre
              que possível, informará o motivo e permitirá que o responsável
              regularize a situação. O encerramento definitivo deverá observar o
              contrato e os direitos aplicáveis.
            </p>
            <p>
              Antes do encerramento, o comércio deve poder consultar e, conforme
              os recursos disponíveis e as condições contratadas, exportar os
              dados operacionais de que necessite. Após o encerramento, os dados
              serão tratados e retidos conforme a Política de Privacidade, as
              instruções do comércio, as condições contratuais e obrigações
              legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              10. Responsabilidades e limitações
            </h2>
            <p>
              O comércio é responsável pela exatidão dos dados que informa, pela
              gestão de seus usuários e pela conferência das operações
              registradas. A Full Jam é responsável por fornecer o serviço nos
              termos contratados e adotar as medidas e providências previstas na
              legislação aplicável.
            </p>
            <p>
              O Kaysen é uma ferramenta de apoio à operação e não garante, por
              si só, resultados financeiros, aumento de vendas, eliminação de
              erros ou disponibilidade ininterrupta. Nada nestes Termos exclui
              ou limita direitos ou responsabilidades que não possam ser
              excluídos ou limitados pela legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              11. Legislação e resolução de solicitações
            </h2>
            <p>
              Estes Termos são interpretados conforme as leis brasileiras,
              respeitadas as normas obrigatórias aplicáveis à relação entre as
              partes. Em caso de dúvida ou problema, o usuário pode procurar
              inicialmente o canal oficial de atendimento do Kaysen, sem
              prejuízo de outros direitos e meios de resolução previstos em lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">12. Contato</h2>
            <p>Dúvidas sobre estes Termos podem ser enviadas:</p>
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

export default TermsOfUse;
