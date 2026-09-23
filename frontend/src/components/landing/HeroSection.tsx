"use client";

import { useAuth } from "@/contexts/AuthContexts";

const mockMeals = [
  { title: "Café da manhã", items: [{ name: "Ovo cozido", qty: 2, unit: "un", cal: 155 }, { name: "Pão integral", qty: 1, unit: "un", cal: 89 }] },
  { title: "Almoço", items: [{ name: "Frango grelhado", qty: 150, unit: "g", cal: 248 }, { name: "Arroz branco", qty: 100, unit: "g", cal: 130 }] },
  { title: "Lanche", items: [] },
  { title: "Jantar", items: [] },
];

const consumed = 622;
const goal = 1847;
const progressPct = Math.round((consumed / goal) * 100);

export default function HeroSection() {
  const { openRegister, openLogin } = useAuth();

  return (
    <section className="bg-[#f0faf7] min-h-[calc(100vh-65px)] flex items-center px-5 md:px-12 py-12 md:py-20">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-16">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-8">
          <span className="inline-flex items-center gap-2 bg-white border border-secondary-200/30 text-secondary-300 text-base font-medium px-5 py-2.5 rounded-full w-fit shadow-sm">
            <span className="text-lg">🌿</span> Controle alimentar inteligente
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Sua alimentação,{" "}
            <span className="text-secondary-200">personalizada</span>{" "}
            para você
          </h1>

          <p className="text-gray-500 text-xl leading-relaxed max-w-lg">
            O NutriLife ajuda você a controlar sua alimentação de forma
            personalizada, com metas calóricas e de hidratação definidas a
            partir do seu perfil.
          </p>

          <div className="flex items-center gap-5 flex-wrap">
            <button
              onClick={openRegister}
              className="bg-secondary-200 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-secondary-300 transition-colors shadow-sm"
            >
              Comece Agora
            </button>
          </div>
        </div>

        {/* Right — real dashboard UI preview */}
        <div className="flex-1 flex justify-center pointer-events-none select-none">
          <div className="bg-[#F8F9F9] rounded-2xl shadow-xl w-full border border-gray-200 overflow-hidden">
            {/* Mini header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-lg font-extrabold text-[#002017]">Acompanhamento Diário</span>
              <div className="flex gap-2">
                {["25", "26", "27"].map((d, i) => (
                  <div key={d} className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border-[1.5px] font-bold ${i === 0 ? "bg-[#00D194] border-[#00D194] text-white" : "border-[#00674F] text-[#00674F]"}`}>
                    <span className="text-xl font-extrabold leading-none">{d}</span>
                    <span className="text-xs">Mar</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calorie bar */}
            <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100">
              <div className="flex justify-between text-sm font-semibold text-[#002017] mb-2">
                <span>Sua meta calórica do dia</span>
                <span className="text-[#00674F]">{consumed}/{goal} kcal</span>
              </div>
              <div className="w-full bg-[#00B890] rounded-full h-5 overflow-hidden">
                <div className="bg-[#00674F] h-full rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex gap-5 mt-3">
                {[{ label: "Carbs", color: "#00D194", val: "45/281g" }, { label: "Prot.", color: "#4A2F1D", val: "38/113g" }, { label: "Gord.", color: "#E7564A", val: "18/75g" }].map(m => (
                  <div key={m.label} className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ background: m.color }} />
                    {m.label} {m.val}
                  </div>
                ))}
              </div>
            </div>

            {/* Meal cards */}
            <div className="px-6 py-4 flex flex-col gap-2.5">
              {mockMeals.map((meal, i) => (
                <div key={meal.title} className={`rounded-xl border overflow-hidden ${i === 0 ? "border-gray-200 shadow-sm" : "border-gray-100"}`}>
                  <div className={`flex items-center justify-between px-5 py-3 ${i === 0 ? "bg-gray-50 border-b border-gray-100" : "bg-white"}`}>
                    <span className="text-base font-semibold text-[#002017]">{meal.title}</span>
                    {meal.items.length === 0 ? (
                      <span className="text-xs bg-[#00674F] text-white px-3 py-1.5 rounded-full font-medium">Adicionar alimentos +</span>
                    ) : (
                      <span className="text-sm text-[#00674F] font-semibold">{meal.items.reduce((s, it) => s + it.cal, 0)} kcal</span>
                    )}
                  </div>
                  {i === 0 && meal.items.length > 0 && (
                    <div className="px-5 py-2.5 bg-white">
                      {meal.items.map(it => (
                        <div key={it.name} className="flex justify-between text-sm text-gray-600 py-0.5">
                          <span>• {it.name}</span>
                          <span>{it.qty}{it.unit} — {it.cal} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
