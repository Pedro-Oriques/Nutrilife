"use client";
import { useRouter } from "next/navigation";

export default function PoliticasPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white px-6 py-12 max-w-3xl mx-auto">
      <div className="mb-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-[#00674F] font-medium hover:opacity-75 transition mb-6"
        >
          ← Voltar
        </button>
        <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest mb-2">NutriLife</p>
        <h1 className="text-4xl font-bold text-[#002017] mb-1">Política de Privacidade</h1>
        <p className="text-gray-400 text-sm">Última atualização: março de 2026</p>
      </div>

      <div className="flex flex-col gap-8 text-[#002017]">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introdução</h2>
          <p className="text-gray-600 leading-relaxed">
            O NutriLife está comprometido com a proteção dos dados pessoais de seus usuários, em conformidade com
            a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Esta Política descreve como coletamos,
            utilizamos, armazenamos e protegemos suas informações.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Dados Coletados</h2>
          <p className="text-gray-600 leading-relaxed mb-2">Coletamos os seguintes tipos de dados:</p>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 pl-2">
            <li>Dados de identificação: nome completo e endereço de e-mail.</li>
            <li>Dados de saúde: data de nascimento, altura, peso, sexo, nível de atividade física e objetivo.</li>
            <li>Dados de uso: refeições registradas, consumo de água e histórico de calorias.</li>
            <li>Dados de restrições alimentares informados voluntariamente pelo usuário.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Finalidade do Tratamento</h2>
          <p className="text-gray-600 leading-relaxed">
            Os dados coletados são utilizados exclusivamente para personalizar a experiência do usuário na plataforma,
            calcular metas calóricas e hídricas, gerar relatórios nutricionais e melhorar continuamente os serviços
            oferecidos pelo NutriLife.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Compartilhamento de Dados</h2>
          <p className="text-gray-600 leading-relaxed">
            O NutriLife não vende, aluga ou compartilha dados pessoais com terceiros para fins comerciais.
            Os dados poderão ser compartilhados apenas quando exigido por lei ou ordem judicial, ou com
            prestadores de serviço essenciais ao funcionamento da plataforma, sob obrigação de confidencialidade.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Armazenamento e Segurança</h2>
          <p className="text-gray-600 leading-relaxed">
            Os dados são armazenados em servidores seguros com criptografia em trânsito e em repouso.
            Adotamos medidas técnicas e organizacionais adequadas para proteger suas informações contra
            acesso não autorizado, perda ou destruição.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Direitos do Titular</h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            Em conformidade com a LGPD, você tem direito a:
          </p>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 pl-2">
            <li>Confirmar a existência de tratamento de seus dados.</li>
            <li>Acessar, corrigir ou atualizar seus dados pessoais.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
            <li>Solicitar a portabilidade dos seus dados.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Retenção de Dados</h2>
          <p className="text-gray-600 leading-relaxed">
            Os dados pessoais são mantidos enquanto a conta do usuário estiver ativa ou pelo período necessário
            para cumprir as finalidades descritas nesta política. Após a exclusão da conta, os dados serão
            eliminados em até 30 dias, salvo obrigação legal de retenção.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contato e DPO</h2>
          <p className="text-gray-600 leading-relaxed">
            Para exercer seus direitos ou esclarecer dúvidas sobre esta Política, entre em contato com nosso
            Encarregado de Proteção de Dados (DPO) pelo e-mail:{" "}
            <span className="text-secondary-200 font-medium">privacidade@nutrilife.com.br</span>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
        © 2026 NutriLife. Todos os direitos reservados.
      </div>
    </div>
  );
}
