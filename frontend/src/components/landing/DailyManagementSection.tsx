import { FiDroplet, FiSun, FiSunrise, FiCoffee } from "react-icons/fi";

const meals = [
  {
    label: "Café da manhã",
    time: "07:30",
    kcal: "324 kcal",
    icon: <FiSunrise size={14} />,
  },
  {
    label: "Almoço",
    time: "12:15",
    kcal: "586 kcal",
    icon: <FiSun size={14} />,
  },
  {
    label: "Lanche",
    time: "16:00",
    kcal: "344 kcal",
    icon: <FiCoffee size={14} />,
  },
];

export default function DailyManagementSection() {
  return (
    <section className="py-20 px-8 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-6">
          <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest">
            Gestão diária
          </p>
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Tudo sobre o seu dia em um só lugar
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Visualize calorias consumidas, meta de água e todas as refeições
            organizadas por período. Simples, visual e direto ao ponto.
          </p>
        </div>

        {/* Right - daily tracking card */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 w-full max-w-md">
            <div className="space-y-3 mb-5">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <FiDroplet className="text-secondary-200" /> Calorias
                  </span>
                  <span>1.254 / 1.847 kcal</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary-200 rounded-full transition-all"
                    style={{ width: "68%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <FiDroplet className="text-secondary-200" /> Água
                  </span>
                  <span>1.8 / 2.3 L</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary-200 rounded-full transition-all"
                    style={{ width: "78%" }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Refeições de hoje
            </p>
            <div className="space-y-2">
              {meals.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between bg-[#f0faf7] rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-secondary-200">{m.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {m.label}
                      </p>
                      <p className="text-xs text-gray-400">{m.time}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{m.kcal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
