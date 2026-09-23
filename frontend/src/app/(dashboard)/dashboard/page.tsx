"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import MealCard from "@/components/dashboard/MealCard";
import SearchFoodModal from "@/components/dashboard/SearchFoodModal";
import Footer from "@/components/dashboard/Footer";
import DatePicker from "@/components/dashboard/DatePicker";
import {
  getDailyTrackingRequest,
  removeFoodEntryRequest,
  getProfileRequest,
  getWaterRequest,
  addWaterRequest,
  DailyTrackingResponse,
} from "@/services/api";
import { useRouter } from "next/navigation";
import BackgroundPattern from "@/assets/Background.svg";
import ConfirmModal from "@/components/dashboard/ConfirmModal";

export default function DashboardPage() {
  const router = useRouter();
  const [trackingData, setTrackingData] =
    useState<DailyTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState("almoco");

  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeCard, setActiveCard] = useState<string | null>("cafe_da_manha");

  // Estados de Metas de Calorias
  const [macroGoals, setMacroGoals] = useState({
    calories: 2240,
    carbs: 281,
    protein: 113,
    fat: 75,
  });

  // Estados de Água
  const [waterGoal, setWaterGoal] = useState(2500);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [waterInput, setWaterInput] = useState<number | "">("");
  const [waterLoading, setWaterLoading] = useState(false);

  const formatDateForBackend = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const dateStr = formatDateForBackend(selectedDate);

      // Busca diário, perfil e a água do dia simultaneamente
      const [data, profileData, waterData] = await Promise.all([
        getDailyTrackingRequest(token, dateStr).catch(() => null),
        getProfileRequest(token).catch(() => null),
        getWaterRequest(token, dateStr).catch(() => null),
      ]);

      setTrackingData(data);

      if (profileData) {
        const profile = Array.isArray(profileData)
          ? profileData[0]
          : profileData;
        if (profile) {
          setMacroGoals({
            calories: profile.dailyCalorieGoal || 2240,
            carbs: profile.carbsGoal || 281,
            protein: profile.proteinGoal || 113,
            fat: profile.fatGoal || 75,
          });
          // Busca a meta de água gerada no backend
          if (profile.dailyWaterGoal) {
            setWaterGoal(profile.dailyWaterGoal);
          }
        }
      }

      if (waterData) {
        setWaterConsumed(waterData.consumedMl || 0);
      } else {
        setWaterConsumed(0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router, selectedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddWater = async (subtract = false) => {
    if (!waterInput || Number(waterInput) <= 0) return;
    setWaterLoading(true);

    const amountMl = subtract ? -Number(waterInput) : Number(waterInput);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const dateStr = formatDateForBackend(selectedDate);

      await addWaterRequest({ date: dateStr, amountMl }, token);

      setWaterConsumed((prev) => Math.max(0, prev + amountMl));
      setWaterInput("");
    } catch (err) {
      alert("Erro ao atualizar água.");
    } finally {
      setWaterLoading(false);
    }
  };

  const handleOpenSearchModal = (mealSession: string) => {
    setCurrentSession(mealSession);
    setIsModalOpen(true);
  };

  const handleRemoveFoodEntry = async (entryId: string) => {
    setConfirmRemoveId(entryId);
  };

  const doRemoveFoodEntry = async (entryId: string) => {
    setConfirmRemoveId(null);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      await removeFoodEntryRequest(entryId, token);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message || "Não foi possível remover o alimento.");
    }
  };

  const handleToggleCard = (session: string) => {
    setActiveCard((prev) => (prev === session ? null : session));
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const dateRange = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const consumed = trackingData?.totalCalories || 0;

  const displayPercent =
    macroGoals.calories > 0 ? (consumed / macroGoals.calories) * 100 : 0;

  const progressPercent = Math.min(displayPercent, 100);

  const waterProgressPercent = Math.min((waterConsumed / waterGoal) * 100, 100);

  const isExceeded = consumed > macroGoals.calories;

  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;

  if (trackingData?.meals) {
    Object.values(trackingData.meals).forEach((mealItems) => {
      mealItems?.forEach((item: any) => {
        totalCarbs += item.carbs || 0;
        totalProtein += item.protein || 0;
        totalFat += item.fat || 0;
      });
    });
  }

  const displayMacros = {
    carbs: { consumed: totalCarbs.toFixed(0), goal: macroGoals.carbs },
    protein: { consumed: totalProtein.toFixed(0), goal: macroGoals.protein },
    fat: { consumed: totalFat.toFixed(0), goal: macroGoals.fat },
  };

  return (
    <div className="h-screen flex relative overflow-hidden" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <Image
          src={BackgroundPattern}
          alt="Padrão de fundo NutriLife"
          fill
          className="object-cover"
          priority
        />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1">
            <div className="px-4 md:px-10 lg:px-[85px] pt-4 [@media(min-height:781px)]:pt-6 pb-24 md:pb-12 flex-1 flex flex-col">
              <Header />

              <main
                className={`mt-6 flex flex-col lg:flex-row gap-8 lg:gap-20 transition-opacity duration-300 ${loading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
              >
                {/* COLUNA ESQUERDA: Calendário e Refeições */}
                <div className="flex-1 flex flex-col max-w-full lg:max-w-[650px]">
                  {/* Date Picker */}
                  <DatePicker
                    dateRange={dateRange}
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    onPrev={handlePrevDay}
                    onNext={handleNextDay}
                  />

                  <div className="mb-6">
                    <h2 className="text-[32px] font-extrabold text-secondary-700 mb-1 leading-tight">
                      Acompanhamento Diário
                    </h2>
                    <p className="text-sm font-medium text-gray-800">
                      Insira alimentos para calcular o número de macronutrientes
                      da sua refeição.
                    </p>
                  </div>

                  {/* Refeições Empilhadas (Accordion) */}
                  <div className="flex flex-col gap-4">
                    <MealCard
                      title="Café da manhã"
                      items={trackingData?.meals?.cafe_da_manha}
                      onAddFood={() => handleOpenSearchModal("cafe_da_manha")}
                      onRemoveFood={handleRemoveFoodEntry}
                      isOpen={activeCard === "cafe_da_manha"}
                      onToggle={() => handleToggleCard("cafe_da_manha")}
                    />
                    <MealCard
                      title="Almoço"
                      items={trackingData?.meals?.almoco}
                      onAddFood={() => handleOpenSearchModal("almoco")}
                      onRemoveFood={handleRemoveFoodEntry}
                      isOpen={activeCard === "almoco"}
                      onToggle={() => handleToggleCard("almoco")}
                    />
                    <MealCard
                      title="Lanche"
                      items={trackingData?.meals?.lanche_tarde}
                      onAddFood={() => handleOpenSearchModal("lanche_tarde")}
                      onRemoveFood={handleRemoveFoodEntry}
                      isOpen={activeCard === "lanche_tarde"}
                      onToggle={() => handleToggleCard("lanche_tarde")}
                    />
                    <MealCard
                      title="Jantar"
                      items={trackingData?.meals?.jantar}
                      onAddFood={() => handleOpenSearchModal("jantar")}
                      onRemoveFood={handleRemoveFoodEntry}
                      isOpen={activeCard === "jantar"}
                      onToggle={() => handleToggleCard("jantar")}
                    />
                  </div>
                </div>

                {/* COLUNA DIREITA: Metas e Hidratação */}
                <div className="dashboard-right w-full lg:w-[445px] pt-4 flex flex-col">
                  {/* --- SEÇÃO DE CALORIAS --- */}
                  <div className="mb-3">
                    <h3 className="text-[17px] [@media(min-height:781px)]:text-[20px] font-bold text-[#002017] mb-1">
                      Sua meta calórica do dia
                    </h3>
                    <div className="w-[160px] h-[1px] bg-[#008F6F]"></div>
                  </div>

                  <div className="flex flex-col gap-1.5 [@media(min-height:781px)]:gap-4 mb-3 [@media(min-height:781px)]:mb-6">
                    {[
                      { color: "bg-[#00D194]", label: "Carboidratos", val: `${displayMacros.carbs.consumed}/${displayMacros.carbs.goal}g` },
                      { color: "bg-[#4A2F1D]", label: "Proteínas", val: `${displayMacros.protein.consumed}/${displayMacros.protein.goal}g` },
                      { color: "bg-[#E7564A]", label: "Gordura", val: `${displayMacros.fat.consumed}/${displayMacros.fat.goal}g` },
                    ].map((m) => (
                      <div key={m.label} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 [@media(min-height:781px)]:w-6 [@media(min-height:781px)]:h-6 rounded-full ${m.color}`}></div>
                          <span className="text-[13px] [@media(min-height:781px)]:text-[17px] font-semibold text-gray-800">{m.label}</span>
                        </div>
                        <span className="text-[13px] [@media(min-height:781px)]:text-[17px] font-semibold text-gray-800">{m.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Barra de Progresso e Total de Calorias */}
                  <div className="mb-2 [@media(min-height:781px)]:mb-4">
                    <div className="w-full bg-[#00B890] rounded-full h-[16px] [@media(min-height:781px)]:h-[24px] mb-2 [@media(min-height:781px)]:mb-4 overflow-hidden relative flex items-center">
                      <div
                        className={`${isExceeded ? "bg-[#E7564A]" : "bg-[#00674F]"} h-full rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                      {progressPercent >= 0 && (
                        <span className="absolute left-3 text-[11px] font-bold text-white drop-shadow-md">
                          {`${displayPercent.toFixed(0)}%`}
                        </span>
                      )}
                    </div>

                    <div className="text-center font-extrabold flex items-baseline justify-center gap-1">
                      <span className="text-[11px] [@media(min-height:781px)]:text-[14px] text-gray-800 uppercase tracking-wider font-bold">Total:</span>
                      <span className={`text-[28px] [@media(min-height:781px)]:text-[44px] ${isExceeded ? "text-[#E7564A]" : "text-[#002017]"} leading-none`}>
                        {consumed.toFixed(0)}
                      </span>
                      <span className="text-[18px] [@media(min-height:781px)]:text-[28px] text-[#002017] leading-none">
                        /{macroGoals.calories}
                      </span>
                      <span className="text-[12px] [@media(min-height:781px)]:text-[16px] text-gray-600 font-bold ml-1">kcal</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 text-center leading-relaxed font-medium px-4 mb-3 [@media(min-height:781px)]:mb-8">
                    Os valores de carboidratos, proteínas e gorduras
                    apresentados são sugestões baseadas em recomendações
                    nutricionais gerais para auxiliar na distribuição
                    equilibrada de macronutrientes ao longo do dia.
                  </p>

                  {/* --- NOVA SEÇÃO DE HIDRATAÇÃO --- */}
                  <div className="mb-3 [@media(min-height:781px)]:mb-6">
                    <h3 className="text-[17px] [@media(min-height:781px)]:text-[20px] font-bold text-[#002017] mb-1">
                      Sua meta de hidratação do dia
                    </h3>
                    <div className="w-[160px] h-[1px] bg-[#008F6F]"></div>
                  </div>

                  <div className="flex justify-between items-end gap-4 mb-3 [@media(min-height:781px)]:mb-4">
                    {/* Vetor Dinâmico do Copo de Água */}
                    <div className="relative w-[56px] h-[72px] [@media(min-height:781px)]:w-[86px] [@media(min-height:781px)]:h-[111px] flex-shrink-0 ml-2">
                      <svg width="86" height="111" viewBox="0 0 86 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
                        <path fillRule="evenodd" clipRule="evenodd" d="M22.0267 111L15 78.4951C22.5826 76.3135 32.3541 75 43.0187 75C53.6657 75 63.4227 76.3092 71 78.4844L64.0002 111H22.0267Z" fill="#86e2ce7a"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M43.0327 37C57.8654 37 70.9903 39.4705 79 43.2599L71.6176 76.9876C64.0734 74.5719 54.0425 73.099 43.0327 73.099C32.0041 73.099 21.9577 74.5768 14.4092 77L7 43.2908C15.0035 39.4838 28.1595 37 43.0327 37Z" fill="#86e2ce7a"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M43 0C66.4781 0 85.562 6.3419 85.9986 14.2212L86 14.2484L85.3755 16.9851L79.6748 41.964C72.1009 37.8269 58.5308 35.0697 43.0502 35.0697C27.5248 35.0697 13.9208 37.8428 6.35991 42L0.629319 16.9943L0 14.2483L0.00140913 14.2212C0.438029 6.3419 19.5219 0 43 0Z" fill="#86e2ce7a"/>
                      </svg>
                      <div className="absolute inset-0">
                        <svg width="86" height="111" viewBox="0 0 86 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
                          <defs>
                            <clipPath id="waterFillClip">
                              <rect
                                x="0"
                                width="86"
                                y={111 - (111 * waterProgressPercent) / 100}
                                height={(111 * waterProgressPercent) / 100}
                                style={{ transition: 'y 1s ease-out, height 1s ease-out' }}
                              />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#waterFillClip)">
                            <path fillRule="evenodd" clipRule="evenodd" d="M22.0267 111L15 78.4951C22.5826 76.3135 32.3541 75 43.0187 75C53.6657 75 63.4227 76.3092 71 78.4844L64.0002 111H22.0267Z" fill="#00B890"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M43.0327 37C57.8654 37 70.9903 39.4705 79 43.2599L71.6176 76.9876C64.0734 74.5719 54.0425 73.099 43.0327 73.099C32.0041 73.099 21.9577 74.5768 14.4092 77L7 43.2908C15.0035 39.4838 28.1595 37 43.0327 37Z" fill="#7AC1B1"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M43 0C66.4781 0 85.562 6.3419 85.9986 14.2212L86 14.2484L85.3755 16.9851L79.6748 41.964C72.1009 37.8269 58.5308 35.0697 43.0502 35.0697C27.5248 35.0697 13.9208 37.8428 6.35991 42L0.629319 16.9943L0 14.2483L0.00140913 14.2212C0.438029 6.3419 19.5219 0 43 0Z" fill="#7AADA1"/>
                          </g>
                        </svg>
                      </div>
                    </div>

                    {/* Textos e Inputs */}
                    <div className="flex flex-col items-end flex-1 pb-1">
                      <div className="text-[#002017] mb-2 flex items-baseline">
                        <span className="text-[24px] [@media(min-height:781px)]:text-[38px] font-medium leading-none">{waterConsumed}</span>
                        <span className="text-[18px] [@media(min-height:781px)]:text-[32px] font-bold leading-none">/{waterGoal}</span>
                        <span className="text-[12px] [@media(min-height:781px)]:text-[16px] font-medium ml-1">mL</span>
                      </div>

                      <div className="flex items-center gap-2 [@media(min-height:781px)]:gap-3">
                        <input
                          type="number"
                          value={waterInput}
                          onChange={(e) => setWaterInput(Number(e.target.value))}
                          placeholder="0000"
                          className="w-[80px] [@media(min-height:781px)]:w-[100px] h-[30px] [@media(min-height:781px)]:h-[36px] border border-[#008F6F] rounded-full px-2 text-center outline-none text-[#002017] font-medium focus:ring-2 focus:ring-[#008F6F]/20"
                        />
                        <span className="text-[13px] font-semibold text-[#002017]">mL</span>
                        <button
                          onClick={() => handleAddWater(false)}
                          disabled={!waterInput || waterLoading}
                          className="w-[30px] h-[30px] [@media(min-height:781px)]:w-[36px] [@media(min-height:781px)]:h-[36px] rounded-full bg-[#00B890] hover:bg-[#00674F] text-white flex items-center justify-center shadow-md transition disabled:opacity-50"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        </button>
                        <button
                          onClick={() => handleAddWater(true)}
                          disabled={!waterInput || waterLoading || waterConsumed === 0}
                          className="w-[30px] h-[30px] [@media(min-height:781px)]:w-[36px] [@media(min-height:781px)]:h-[36px] rounded-full bg-[#C94A31] hover:bg-[#a33a24] text-white flex items-center justify-center shadow-md transition disabled:opacity-50"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso da Água */}
                  <div className="w-full bg-[#00B890] rounded-full h-[16px] [@media(min-height:781px)]:h-[24px] overflow-hidden relative flex items-center mt-1">
                    <div className="bg-[#00674F] h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${waterProgressPercent}%` }}></div>
                    <span className="absolute left-3 text-[11px] font-bold text-white drop-shadow-md">
                      {waterProgressPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </main>
            </div>
          </div>

          <Footer />
        </div>
      </div>

      <SearchFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={currentSession}
        date={formatDateForBackend(selectedDate)}
        onSuccess={fetchDashboardData}
      />

      {confirmRemoveId && (
        <ConfirmModal
          title="Remover alimento"
          message="Deseja remover este alimento da sua refeição?"
          confirmLabel="Remover"
          cancelLabel="Cancelar"
          onConfirm={() => doRemoveFoodEntry(confirmRemoveId)}
          onCancel={() => setConfirmRemoveId(null)}
        />
      )}
    </div>
  );
}
