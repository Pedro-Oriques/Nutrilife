"use client";
import { useRouter } from "next/navigation";

export default function TermosPage() {
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
        <h1 className="text-4xl font-bold text-[#002017] mb-1">Termos e Condições de Uso</h1>
        <p className="text-gray-400 text-sm">Última atualização: março de 2026</p>
      </div>

      <div className="flex flex-col gap-8 text-[#002017]">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Aceitação dos Termos</h2>
          <p className="text-gray-600 leading-relaxed">
            Ao acessar e utilizar a plataforma NutriLife, você concorda com os presentes Termos e Condições de Uso.
            Caso não concorde com qualquer disposição deste documento, recomendamos que não utilize nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Descrição do Serviço</h2>
          <p className="text-gray-600 leading-relaxed">
            O NutriLife é uma plataforma digital de acompanhamento alimentar que oferece ferramentas para registro
            de refeições, controle de ingestão calórica e hídrica, e geração de relatórios nutricionais personalizados.
            As informações fornecidas têm caráter informativo e não substituem orientação de profissional de saúde.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Cadastro e Conta</h2>
          <p className="text-gray-600 leading-relaxed">
            Para utilizar os recursos da plataforma, o usuário deve criar uma conta fornecendo informações verdadeiras
            e atualizadas. O usuário é responsável pela confidencialidade de suas credenciais de acesso e por todas
            as atividades realizadas em sua conta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Uso Adequado</h2>
          <p className="text-gray-600 leading-relaxed">
            O usuário compromete-se a utilizar a plataforma de forma lícita e em conformidade com estes termos.
            É vedado o uso para fins ilícitos, a tentativa de acesso não autorizado a sistemas, e qualquer ação
            que possa prejudicar o funcionamento da plataforma ou outros usuários.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Propriedade Intelectual</h2>
          <p className="text-gray-600 leading-relaxed">
            Todo o conteúdo disponível na plataforma NutriLife, incluindo textos, imagens, logotipos e código-fonte,
            é de propriedade exclusiva da NutriLife ou de seus licenciadores, sendo protegido pelas leis de
            propriedade intelectual aplicáveis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Limitação de Responsabilidade</h2>
          <p className="text-gray-600 leading-relaxed">
            O NutriLife não se responsabiliza por decisões tomadas com base nas informações fornecidas pela plataforma.
            As metas calóricas e nutricionais são calculadas com base em fórmulas gerais e não substituem avaliação
            individualizada por nutricionista ou médico.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Alterações nos Termos</h2>
          <p className="text-gray-600 leading-relaxed">
            O NutriLife reserva-se o direito de modificar estes Termos a qualquer momento. As alterações entrarão
            em vigor após publicação na plataforma. O uso continuado dos serviços após as alterações implica
            aceitação dos novos termos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contato</h2>
          <p className="text-gray-600 leading-relaxed">
            Em caso de dúvidas sobre estes Termos, entre em contato pelo e-mail:{" "}
            <span className="text-secondary-200 font-medium">contato@nutrilife.com.br</span>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
        © 2026 NutriLife. Todos os direitos reservados.
      </div>
    </div>
  );
}
