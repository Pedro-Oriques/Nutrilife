"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/dashboard/Footer";
import LogoutModal from "@/components/dashboard/LogoutModal";
import DarkModeButton from "@/components/dashboard/DarkModeButton";
import AuthGuard from "@/components/AuthGuard";
import { MdFastfood, MdFoodBank } from "react-icons/md";
import { GiScales } from "react-icons/gi";
import { getReportRequest } from "@/services/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RightChevron from "@/assets/Right-chevron.svg";
import BackgroundPattern from "@/assets/Background.svg";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getLocalYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ReportPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const tickColor = isDark ? "#ffffff" : "#002017";
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return getLocalYMD(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalYMD(new Date()));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reportData, setReportData] = useState<any>(null);

  async function fetchReport(currentPage = 1, currentLimit = limit) {
    setError("");
    if (!startDate || !endDate) {
      setError("Selecione o período para realizar a busca.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("A data final não pode ser anterior à data inicial.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      if (!token) { setError("Sessão inválida. Faça login novamente."); return; }
      const data = await getReportRequest(token, startDate, endDate, currentPage, currentLimit);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar relatório.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReport(1, limit); }, []);

  useEffect(() => {
    const onBeforePrint = () => setIsPrinting(true);
    const onAfterPrint = () => setIsPrinting(false);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  function handleFilter() { setPage(1); fetchReport(1, limit); }

  function handleLimitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1);
    fetchReport(1, newLimit);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  const handlePrint = () => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    if (wasDark) html.classList.remove("dark");

    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      if (wasDark) html.classList.add("dark");
    }, 300);
  };

  return (
    <AuthGuard>
    <div className="h-screen flex relative overflow-hidden" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10 no-print">
        <Image src={BackgroundPattern} alt="Padrão de fundo NutriLife" fill className="object-cover" priority />
      </div>

      {/* Sidebar hidden on print */}
      <div className="no-print" style={{ display: "contents" }}><Sidebar /></div>

      <main className="flex-1 overflow-y-auto flex flex-col print-main">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1">
          <div className="px-4 md:px-10 lg:px-[85px] pt-6 pb-12 flex flex-col gap-6">

            {/* Header — hidden on print */}
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap no-print">
              <h1 className="text-3xl lg:text-[36px] [@media(min-height:781px)]:lg:text-[48px] font-extrabold leading-tight" style={{ color: "var(--text-primary, #002017)" }}>
                Relatórios de calorias
              </h1>
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

            {/* Print header — only visible when printing */}
            <div className="print-only">
              <h1 className="text-[36px] font-extrabold text-[#002017]">Relatórios de calorias</h1>
              <p className="text-[16px] text-[#002017] mt-1">
                Período: {startDate.split("-").reverse().join("/")} – {endDate.split("-").reverse().join("/")}
              </p>
            </div>

            {/* Filters — hidden on print */}
            <div className="flex items-center gap-3 mb-1 flex-wrap no-print">
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-semibold" style={{ color: "var(--text-primary, #002017)" }}>Data inicial:</span>
                <div className="flex items-center border border-[#002017] rounded-lg px-3 py-1.5 gap-2" style={{ backgroundColor: "var(--bg-input, white)" }}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-[16px] outline-none bg-transparent w-36" style={{ color: "var(--text-primary, #002017)" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-semibold" style={{ color: "var(--text-primary, #002017)" }}>Data final:</span>
                <div className="flex items-center border border-[#002017] rounded-lg px-3 py-1.5 gap-2" style={{ backgroundColor: "var(--bg-input, white)" }}>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-[16px] outline-none bg-transparent w-36" style={{ color: "var(--text-primary, #002017)" }}
                  />
                </div>
              </div>
              <button
                onClick={handleFilter}
                disabled={loading}
                className="px-8 py-2 bg-[#00674F] text-white text-[20px] font-semibold rounded-lg shadow hover:bg-[#004f3d] transition disabled:opacity-60"
              >
                {loading ? "..." : "Filtrar"}
              </button>
            </div>

            {error && <p className="text-[14px] font-bold text-[#C94A31] mb-4">{error}</p>}

            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00674F]" />
              </div>
            )}

            {!loading && reportData && (
              <div className="flex flex-col gap-8 mt-6">

                {/* Section title above both chart and cards */}
                <h2 className="text-[34px] font-semibold text-[#002017] leading-tight">
                  Resumo do período
                </h2>

                {/* Chart + Summary cards row */}
                <div className="flex flex-col xl:flex-row gap-6 items-start print-row">

                  {/* Chart */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full xl:w-0 xl:flex-[2] print-chart">
                    <h2 className="text-[24px] font-semibold text-[#002017] mb-4">
                      Evolução de calorias consumidas
                    </h2>
                    <div className="h-[330px] w-full print-chart-inner">
                      {isPrinting ? (
                        <LineChart
                          width={480}
                          height={220}
                          data={reportData.chartData.filter((d: { date: string }) => d.date >= startDate && d.date <= endDate)}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                          <XAxis dataKey="date" tick={{ fill: "#002017", fontSize: 10 }} tickFormatter={(val) => val.split("-").reverse().slice(0, 2).join("/")} />
                          <YAxis tick={{ fill: "#002017", fontSize: 10 }} />
                          <Line type="monotone" dataKey="calories" stroke="#00674F" strokeWidth={2} dot={{ r: 3, fill: "#00B890" }} isAnimationActive={false} />
                        </LineChart>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={reportData.chartData.filter((d: { date: string }) => d.date >= startDate && d.date <= endDate)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: tickColor, fontSize: 11 }}
                              tickFormatter={(val) => val.split("-").reverse().slice(0, 2).join("/")}
                            />
                            <YAxis tick={{ fill: tickColor, fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #008F6F",
                                backgroundColor: isDark ? "#374151" : "#ffffff",
                                color: isDark ? "#ffffff" : "#002017",
                              }}
                              labelStyle={{ color: isDark ? "#ffffff" : "#002017" }}
                              itemStyle={{ color: isDark ? "#ffffff" : "#374151" }}
                              labelFormatter={(label) => `Data: ${label.split("-").reverse().join("/")}`}
                              formatter={(value: any) => [value, "Calorias"]}
                            />
                            <Line
                              type="monotone"
                              dataKey="calories"
                              stroke="#00674F"
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: "#00B890" }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Summary cards — screen only (vertical stack on the right) */}
                  {!isPrinting && (
                    <div className="flex flex-col gap-4 w-full xl:w-[280px] shrink-0 self-stretch">
                      <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <MdFastfood size={22} color="#C94A31" />
                            <span className="text-[20px] font-semibold text-[#002017]">Calorias consumidas</span>
                          </div>
                          <p className="text-[24px] font-semibold text-[#00674F] text-right">
                            {reportData.summary.totalCaloriesConsumed?.toLocaleString("pt-BR")} kcal
                          </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <GiScales size={22} color="#C94A31" />
                            <span className="text-[20px] font-semibold text-[#002017]">Meta total de calorias</span>
                          </div>
                          <p className="text-[24px] font-semibold text-[#00674F] text-right">
                            {reportData.summary.expectedTotalCalories?.toLocaleString("pt-BR")} kcal
                          </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <MdFoodBank size={22} color="#C94A31" />
                            <span className="text-[20px] font-semibold text-[#002017]">Refeições feitas</span>
                          </div>
                          <p className="text-[24px] font-semibold text-[#00674F] text-right">
                            {reportData.summary.totalMeals}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary cards — print only (horizontal row below chart) */}
                {isPrinting && (
                  <div className="flex flex-row gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <MdFastfood size={18} color="#C94A31" />
                        <span className="text-[14px] font-semibold text-[#002017]">Calorias consumidas</span>
                      </div>
                      <p className="text-[18px] font-semibold text-[#00674F] text-right">
                        {reportData.summary.totalCaloriesConsumed?.toLocaleString("pt-BR")} kcal
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <GiScales size={18} color="#C94A31" />
                        <span className="text-[14px] font-semibold text-[#002017]">Meta total de calorias</span>
                      </div>
                      <p className="text-[18px] font-semibold text-[#00674F] text-right">
                        {reportData.summary.expectedTotalCalories?.toLocaleString("pt-BR")} kcal
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <MdFoodBank size={18} color="#C94A31" />
                        <span className="text-[14px] font-semibold text-[#002017]">Refeições feitas</span>
                      </div>
                      <p className="text-[18px] font-semibold text-[#00674F] text-right">
                        {reportData.summary.totalMeals}
                      </p>
                    </div>
                  </div>
                )}

                {/* Detailed table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 print-table-section">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[24px] font-semibold text-[#002017]">
                      Detalhamento de refeições
                    </h2>
                    <button
                      onClick={handlePrint}
                      className="no-print flex items-center gap-1.5 text-[14px] font-bold text-[#00674F] border border-[#00674F] px-3 py-1.5 rounded-lg hover:bg-[#00674F]/10 transition tracking-[0.0025em]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9V2h12v7" stroke="#00674F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="#00674F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="6" y="14" width="12" height="8" rx="1" stroke="#00674F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Imprimir como PDF
                    </button>
                  </div>

                  {reportData.table.data.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Não há dados registrados neste período.</p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-3 px-4 text-[14px] font-bold text-[#002017]">Data</th>
                              <th className="py-3 px-4 text-[14px] font-bold text-[#002017]">Refeição</th>
                              <th className="py-3 px-4 text-[14px] font-bold text-[#002017]">Alimentos</th>
                              <th className="py-3 px-4 text-[14px] font-bold text-[#002017] text-right">Calorias totais</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.table.data.map((meal: any, idx: number) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {meal.date.split("-").reverse().join("/")}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                                  {meal.mealType.replace(/_/g, " ")}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {meal.foods.join(", ")}
                                </td>
                                <td className="py-3 px-4 text-sm font-bold text-[#002017] text-right">
                                  {meal.totalCalories}kcal
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination — hidden on print */}
                      <div className="no-print flex items-center justify-between mt-5 pt-4 border-t border-gray-100 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#002017]">Mostrar</span>
                          <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="border border-[#002017] rounded-md px-2 py-1 text-sm outline-none cursor-pointer"
                          >
                            {[5, 10, 20, 30, 50].map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <span className="text-sm font-semibold text-[#002017]">
                          Página {reportData.table.pagination.currentPage} de {reportData.table.pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={page === 1}
                            onClick={() => { setPage(page - 1); fetchReport(page - 1); }}
                            className="px-5 py-2 text-sm font-semibold text-[#00674F] border border-[#00674F] rounded-lg disabled:opacity-30 hover:bg-[#00674F]/10 transition"
                          >
                            Anterior
                          </button>
                          <button
                            disabled={page === reportData.table.pagination.totalPages}
                            onClick={() => { setPage(page + 1); fetchReport(page + 1); }}
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
        <div className="no-print"><Footer /></div>
      </main>

      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
    </AuthGuard>
  );
}
