import { FiClipboard, FiTarget, FiCoffee, FiTrendingUp } from "react-icons/fi";

const steps = [
  {
    icon: <FiClipboard size={22} />,
    step: "Passo 1",
    title: "Faça sua anamnese",
    desc: "Responda perguntas sobre seu perfil, rotina e objetivos no cadastro.",
  },
  {
    icon: <FiTarget size={22} />,
    step: "Passo 2",
    title: "Receba metas personalizadas",
    desc: "O sistema calcula sua meta calórica diária e consumo ideal de água.",
  },
  {
    icon: <FiCoffee size={22} />,
    step: "Passo 3",
    title: "Registre suas refeições",
    desc: "Adicione alimentos ou pratos completos de forma rápida e prática.",
  },
  {
    icon: <FiTrendingUp size={22} />,
    step: "Passo 4",
    title: "Acompanhe sua evolução",
    desc: "Visualize relatórios e entenda seus hábitos alimentares ao longo do tempo.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest mb-2">
            Como funciona
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            Comece em 4 passos simples
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-secondary-200/15 text-secondary-300 w-11 h-11 rounded-xl flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <p className="text-secondary-200 text-xs font-semibold mb-1">
                {s.step}
              </p>
              <h3 className="text-gray-900 font-bold text-base mb-2">
                {s.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
