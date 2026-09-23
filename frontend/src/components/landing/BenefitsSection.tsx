import {
  FiZap,
  FiHeart,
  FiBarChart2,
  FiShield,
  FiActivity,
} from "react-icons/fi";

const benefits = [
  {
    icon: <FiActivity size={22} />,
    title: "Personalização desde o início",
    desc: "Metas definidas pela sua anamnese, não por fórmulas genéricas.",
  },
  {
    icon: <FiZap size={22} />,
    title: "Praticidade no registro",
    desc: "Alimentos individuais ou pratos completos — você escolhe.",
  },
  {
    icon: <FiBarChart2 size={22} />,
    title: "Controle completo",
    desc: "Calorias, água e refeições monitoradas em tempo real.",
  },
  {
    icon: <FiHeart size={22} />,
    title: "Mais consciência alimentar",
    desc: "Dados que ajudam você a fazer escolhas mais saudáveis.",
  },
  {
    icon: <FiShield size={22} />,
    title: "Relatórios inteligentes",
    desc: "Análise por período com comparação de metas.",
  },
];

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest mb-2">
            Benefícios
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            Por que escolher o NutriLife?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-secondary-200/10 text-secondary-300 w-11 h-11 rounded-xl flex items-center justify-center mb-4">
                {b.icon}
              </div>
              <h3 className="text-gray-900 font-bold text-base mb-2">
                {b.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
