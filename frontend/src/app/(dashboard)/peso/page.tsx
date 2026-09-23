"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/dashboard/Footer";
import LogoutModal from "@/components/dashboard/LogoutModal";
import DarkModeButton from "@/components/dashboard/DarkModeButton";
import IMCGauge, { calculateIMC } from "@/components/dashboard/IMCGauge";
import Image from "next/image";
import RightChevron from "@/assets/Right-chevron.svg";
import BackgroundPattern from "@/assets/Background.svg";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getProfileRequest,
  getWeightEntries,
  createWeightEntry,
  deleteWeightEntry,
  WeightEntry,
} from "@/services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = "1M" | "6M" | "1A" | "Tudo";

export default function PesoPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const tickColor = isDark ? "#ffffff" : "#002017";

  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [weightInput, setWeightInput] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [timeRange, setTimeRange] = useState<TimeRange>("Tudo");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const [profileData, weightData] = await Promise.all([
        getProfileRequest(token).catch(() => null),
        getWeightEntries(token).catch(() => []),
      ]);
      const p = Array.isArray(profileData) ? profileData[0] : profileData;
      setProfile(p || null);
      setEntries(Array.isArray(weightData) ? weightData : []);
    } catch {
      // silently fail, data stays empty
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const w = parseFloat(weightInput);
    if (!weightInput || isNaN(w) || w <= 0) {
      setFormError("Informe um peso válido.");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      await createWeightEntry({ weight: w }, token);
      setWeightInput("");
      await fetchData();
    } catch (err: any) {
      setFormError(err.message || "Erro ao registrar peso.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      await deleteWeightEntry(id, token);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir registro.");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  const currentWeight = profile?.weight ?? 0;
  const currentHeight = profile?.height ?? 0;
  const imc = currentWeight && currentHeight ? calculateIMC(currentWeight, currentHeight) : 0;

  const chartData = (() => {
    const days = timeRange === "1M" ? 30 : timeRange === "6M" ? 180 : timeRange === "1A" ? 365 : null;
    const entryMap = new Map<string, number>();
    // Sort ascending so the last write per key overwrites earlier ones (last entry of the day wins)
    [...entries]
      .sort((a, b) => new Date(a.recordedAt || a.createdAt).getTime() - new Date(b.recordedAt || b.createdAt).getTime())
      .forEach((e) => {
        const key = new Date(e.recordedAt || e.createdAt).toLocaleDateString("pt-BR");
        entryMap.set(key, e.weight); // later entries overwrite earlier ones — last of the day wins
      });

    if (days === null) {
      // "Tudo" — deduplicate by day, keeping last entry, then sort ascending
      const dayMap = new Map<string, { date: string; peso: number; time: number }>();
      entries.forEach((e) => {
        const t = new Date(e.recordedAt || e.createdAt).getTime();
        const label = new Date(t).toLocaleDateString("pt-BR");
        const existing = dayMap.get(label);
        if (!existing || t > existing.time) {
          dayMap.set(label, { date: label, peso: e.weight, time: t });
        }
      });
      return [...dayMap.values()]
        .sort((a, b) => a.time - b.time)
        .map(({ date, peso }) => ({ date, peso }));
    }

    // Build full date range with gaps as null
    const result: { date: string; peso: number | null }[] = [];
    const now = new Date();
    // For 6M/1A, group by week to avoid too many points
    const groupByWeek = days > 30;
    if (groupByWeek) {
      const weeks = Math.ceil(days / 7);
      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekEntries = [...entries]
          .filter((e) => {
            const d = new Date(e.recordedAt || e.createdAt);
            return d >= weekStart && d < weekEnd;
          })
          .sort((a, b) => new Date(a.recordedAt || a.createdAt).getTime() - new Date(b.recordedAt || b.createdAt).getTime());
        const label = weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        const last = weekEntries[weekEntries.length - 1];
        result.push({ date: label, peso: last ? last.weight : null });
      }
    } else {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = d.toLocaleDateString("pt-BR");
        result.push({ date: label, peso: entryMap.get(label) ?? null });
      }
    }
    return result;
  })();

  const TIME_RANGES: TimeRange[] = ["1M", "6M", "1A", "Tudo"];

  return (
    <div className="h-screen flex relative overflow-hidden" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <Image src={BackgroundPattern} alt="Padrão de fundo NutriLife" fill className="object-cover" priority />
      </div>
      <Sidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1">
          <div className="px-4 md:px-10 lg:px-[85px] pt-6 pb-12 flex flex-col gap-8">

              <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl lg:text-[36px] [@media(min-height:781px)]:lg:text-[48px] font-extrabold text-[#002017] leading-tight">
                  Acompanhamento de Peso
                </h1>
                <p className="text-base md:text-lg text-gray-500 mt-2 capitalize">
                  {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DarkModeButton />
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex justify-center items-center px-4 md:px-[26px] py-[6px] gap-2 md:gap-4 bg-[#00674F] shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg text-white font-medium hover:bg-[#004f3d] transition cursor-pointer text-sm md:text-base"
                >
                  Sair
                  <Image src={RightChevron} alt="Sair" width={16} height={16} />
                </button>
              </div>
            </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00674F]" />
            </div>
          )}

          {!loading && (
            <div className="flex flex-col gap-8">
              {/* Top row: form + IMC gauge */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Weight input form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1 flex flex-col gap-5">
                  <h2 className="text-[22px] font-semibold text-[#002017]">
                    Registrar peso
                  </h2>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {/* Input + button side by side */}
                    <div className="flex items-stretch gap-3">
                      <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-4 focus-within:border-[#00674F] focus-within:ring-2 focus-within:ring-[#00674F]/20 transition" style={{ backgroundColor: "var(--bg-input, #f9fafb)" }}>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="300"
                          value={weightInput}
                          onChange={(e) => {
                            setWeightInput(e.target.value);
                            setFormError("");
                          }}
                          placeholder="0.0"
                          className="flex-1 bg-transparent text-[28px] font-bold outline-none placeholder:text-gray-300 w-0 py-3" style={{ color: "var(--text-primary, #002017)" }}
                        />
                        <span className="text-[18px] font-semibold text-gray-400 shrink-0">kg</span>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 bg-[#00674F] text-white text-[16px] font-bold rounded-xl shadow hover:bg-[#004f3d] active:scale-[0.98] transition disabled:opacity-60 shrink-0"
                      >
                        {submitting ? "..." : "Salvar"}
                      </button>
                    </div>
                    {formError && (
                      <p className="text-[13px] font-semibold text-[#C94A31]">{formError}</p>
                    )}
                  </form>

                  {/* Last 3 entries */}
                  {entries.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] text-gray-400 uppercase tracking-wide font-semibold">
                        Últimos registros
                      </p>
                      {entries.slice(0, 3).map((entry) => (
                        <div key={entry._id} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="font-bold text-[#002017] text-[15px]">
                            {entry.weight} kg
                          </span>
                          <span className="text-gray-400 text-[14px]">
                            {new Date(entry.recordedAt || entry.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* IMC Gauge */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center flex-1">
                  <h2 className="text-[22px] font-semibold text-[#002017] mb-2">
                    Seu IMC
                  </h2>
                  <IMCGauge imc={imc} weight={currentWeight} height={currentHeight} />
                  {currentWeight > 0 && currentHeight > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {currentWeight} kg · {currentHeight} cm
                    </p>
                  )}
                </div>
              </div>

              {/* Weight history chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-[22px] font-semibold text-[#002017]">
                    Evolução do peso
                  </h2>
                  <div className="flex gap-2">
                    {TIME_RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                          timeRange === r
                            ? "bg-[#00674F] text-white"
                            : "border border-[#00674F] text-[#00674F] hover:bg-[#00674F]/10"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum registro encontrado</p>
                ) : (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart key={timeRange} data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: tickColor, fontSize: 11 }}
                        />
                        <YAxis
                          tick={{ fill: tickColor, fontSize: 11 }}
                          domain={["auto", "auto"]}
                          unit=" kg"
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #008F6F",
                            backgroundColor: isDark ? "#374151" : "#ffffff",
                            color: isDark ? "#ffffff" : "#002017",
                          }}
                          labelStyle={{ color: isDark ? "#ffffff" : "#002017" }}
                          itemStyle={{ color: isDark ? "#ffffff" : "#374151" }}
                          formatter={(value: any) => [`${value} kg`, "Peso"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="peso"
                          stroke="#00674F"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: "#00B890" }}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Weight history list */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-[22px] font-semibold text-[#002017] mb-4">
                  Histórico de registros
                </h2>

                {entries.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum registro encontrado</p>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      {entries
                        .slice((historyPage - 1) * historyLimit, historyPage * historyLimit)
                        .map((entry) => (
                          <div
                            key={entry._id}
                            className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-[18px] font-bold text-[#002017]">
                                {entry.weight} kg
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(entry.recordedAt || entry.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#002017]">Mostrar</span>
                        <select
                          value={historyLimit}
                          onChange={(e) => { setHistoryLimit(Number(e.target.value)); setHistoryPage(1); }}
                          className="border border-[#002017] rounded-md px-2 py-1 text-sm outline-none cursor-pointer"
                        >
                          {[5, 10, 20, 30, 50].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <span className="text-sm font-semibold text-[#002017]">
                        Página {historyPage} de {Math.ceil(entries.length / historyLimit)}
                      </span>

                      <div className="flex gap-2">
                        <button
                          disabled={historyPage === 1}
                          onClick={() => setHistoryPage(historyPage - 1)}
                          className="px-5 py-2 text-sm font-semibold text-[#00674F] border border-[#00674F] rounded-lg disabled:opacity-30 hover:bg-[#00674F]/10 transition"
                        >
                          Anterior
                        </button>
                        <button
                          disabled={historyPage === Math.ceil(entries.length / historyLimit)}
                          onClick={() => setHistoryPage(historyPage + 1)}
                          className="px-5 py-2 text-sm font-semibold text-white bg-[#00674F] rounded-lg disabled:opacity-30 hover:bg-[#004f3d] transition"
                        >
                          Próximo
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
        <Footer />
      </main>

      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  );
}
