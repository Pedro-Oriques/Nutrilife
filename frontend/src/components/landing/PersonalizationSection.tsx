import { FiDroplet, FiUser, FiActivity } from "react-icons/fi";

const features = [
  {
    icon: <FiActivity size={22} />,
    title: "Meta calórica personalizada",
    desc: "Calorias diárias calculadas com base no seu perfil, peso, altura e nível de atividade.",
  },
  {
    icon: <FiDroplet size={22} />,
    title: "Meta diária de água",
    desc: "Hidratação monitorada de acordo com seu corpo e rotina.",
  },
  {
    icon: <FiUser size={22} />,
    title: "Experiência adaptada",
    desc: "O app evolui com você, ajustando metas conforme seu progresso.",
  },
];

const waterPct = 72;

export default function PersonalizationSection() {
  return (
    <section className="py-16 md:py-28 px-5 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-8">
          <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest">
            Personalização
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            O NutriLife entende sua rotina e adapta sua alimentação às suas necessidades
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Cada pessoa é única. Por isso, desde o primeiro acesso, o NutriLife coleta informações
            essenciais para criar um plano alimentar feito sob medida para você.
          </p>
          <ul className="flex flex-col gap-5">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="text-secondary-200 mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-base">{f.title}</p>
                  <p className="text-gray-500 text-base">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — real dashboard goals panel */}
        <div className="flex-1 flex justify-center pointer-events-none select-none">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 w-full max-w-md flex flex-col gap-6">
            {/* Calorie section */}
            <div>
              <h3 className="text-lg font-bold text-[#002017] mb-1">Sua meta calórica do dia</h3>
              <div className="w-36 h-[1px] bg-[#008F6F] mb-5" />

              <div className="flex flex-col gap-3 mb-5">
                {[
                  { label: "Carboidratos", color: "#00D194", val: "120/281g" },
                  { label: "Proteínas", color: "#4A2F1D", val: "55/113g" },
                  { label: "Gordura", color: "#E7564A", val: "22/75g" },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full" style={{ background: m.color }} />
                      <span className="text-base font-semibold text-gray-800">{m.label}</span>
                    </div>
                    <span className="text-base font-semibold text-gray-800">{m.val}</span>
                  </div>
                ))}
              </div>

              <div className="w-full bg-[#00B890] rounded-full h-6 overflow-hidden mb-3">
                <div className="bg-[#00674F] h-full rounded-full" style={{ width: "45%" }} />
              </div>
              <div className="text-center font-extrabold flex items-baseline justify-center gap-1">
                <span className="text-sm text-gray-600 uppercase font-bold">Total:</span>
                <span className="text-[38px] text-[#002017] leading-none">836</span>
                <span className="text-[24px] text-[#002017] leading-none">/1.847</span>
                <span className="text-sm text-gray-500 ml-1">kcal</span>
              </div>
            </div>

            {/* Water section */}
            <div>
              <h3 className="text-lg font-bold text-[#002017] mb-1">Sua meta de hidratação do dia</h3>
              <div className="w-36 h-[1px] bg-[#008F6F] mb-5" />

              <div className="flex items-end gap-5">
                {/* Water cup SVG */}
                <div className="relative w-20 h-[100px] shrink-0">
                  <svg width="80" height="100" viewBox="0 0 86 111" fill="none" className="absolute inset-0 w-full h-full">
                    <path fillRule="evenodd" clipRule="evenodd" d="M22.0267 111L15 78.4951C22.5826 76.3135 32.3541 75 43.0187 75C53.6657 75 63.4227 76.3092 71 78.4844L64.0002 111H22.0267Z" fill="#86e2ce7a"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M43.0327 37C57.8654 37 70.9903 39.4705 79 43.2599L71.6176 76.9876C64.0734 74.5719 54.0425 73.099 43.0327 73.099C32.0041 73.099 21.9577 74.5768 14.4092 77L7 43.2908C15.0035 39.4838 28.1595 37 43.0327 37Z" fill="#86e2ce7a"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M43 0C66.4781 0 85.562 6.3419 85.9986 14.2212L86 14.2484L85.3755 16.9851L79.6748 41.964C72.1009 37.8269 58.5308 35.0697 43.0502 35.0697C27.5248 35.0697 13.9208 37.8428 6.35991 42L0.629319 16.9943L0 14.2483L0.00140913 14.2212C0.438029 6.3419 19.5219 0 43 0Z" fill="#86e2ce7a"/>
                  </svg>
                  <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: `${waterPct}%` }}>
                    <svg width="80" height="100" viewBox="0 0 86 111" fill="none" className="absolute bottom-0 left-0 w-full h-full">
                      <path fillRule="evenodd" clipRule="evenodd" d="M22.0267 111L15 78.4951C22.5826 76.3135 32.3541 75 43.0187 75C53.6657 75 63.4227 76.3092 71 78.4844L64.0002 111H22.0267Z" fill="#00B890"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M43.0327 37C57.8654 37 70.9903 39.4705 79 43.2599L71.6176 76.9876C64.0734 74.5719 54.0425 73.099 43.0327 73.099C32.0041 73.099 21.9577 74.5768 14.4092 77L7 43.2908C15.0035 39.4838 28.1595 37 43.0327 37Z" fill="#7AC1B1"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M43 0C66.4781 0 85.562 6.3419 85.9986 14.2212L86 14.2484L85.3755 16.9851L79.6748 41.964C72.1009 37.8269 58.5308 35.0697 43.0502 35.0697C27.5248 35.0697 13.9208 37.8428 6.35991 42L0.629319 16.9943L0 14.2483L0.00140913 14.2212C0.438029 6.3419 19.5219 0 43 0Z" fill="#7AADA1"/>
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-[34px] font-medium text-[#002017] leading-none">1800</span>
                    <span className="text-[26px] font-bold text-[#002017] leading-none">/2500</span>
                    <span className="text-sm text-gray-500 ml-1">mL</span>
                  </div>
                  <div className="w-full bg-[#00B890] rounded-full h-5 overflow-hidden">
                    <div className="bg-[#00674F] h-full rounded-full" style={{ width: `${waterPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
