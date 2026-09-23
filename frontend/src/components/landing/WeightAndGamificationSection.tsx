"use client";

import { FiTrendingDown, FiAward } from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import { FaStar, FaUtensils } from "react-icons/fa";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weightData = [
  { date: "01/03", peso: 88.5 },
  { date: "08/03", peso: 87.2 },
  { date: "15/03", peso: 86.0 },
  { date: "22/03", peso: 85.1 },
  { date: "29/03", peso: 84.3 },
];

// --- Static 30-day calendar (3 rows × 10 cols) with labels ---
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function build30DayGrid(): Array<{ date: string; points: number }> {
  const seed = (dateStr: string) => {
    let h = 0;
    for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
    return h;
  };
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const s = seed(dateStr) % 100;
    const points = s < 65 ? [0, 80, 200, 450, 700][s % 5] : 0;
    return { date: dateStr, points };
  });
}

// Row labels: rows represent ~10-day periods within the month
const ROW_LABELS = ["1–10", "11–20", "21–30"];


function getColor(points: number): string {
  if (points === 0) return "#e5e7eb";
  if (points <= 100) return "#86efac";
  if (points <= 300) return "#4ade80";
  if (points <= 600) return "#16a34a";
  return "#00674F";
}

function YearCalendarPreview() {
  const [hovered, setHovered] = useState<string | null>(null);
  const days = build30DayGrid();
  const CELL = 28;
  const GAP = 6;
  const STEP = CELL + GAP;
  const LABEL_W = 36;

  // Month label: derive from the middle day
  const midDate = new Date(days[14].date + "T00:00:00");
  const monthLabel = MONTH_LABELS[midDate.getMonth()];

  const rows = [days.slice(0, 10), days.slice(10, 20), days.slice(20, 30)];

  return (
    <div className="w-full flex flex-col items-center">
      <div style={{ position: "relative" }}>
        {/* Month label row */}
        <div style={{ marginLeft: LABEL_W, height: 18, display: "flex", alignItems: "center" }}>
          <span className="text-[11px] text-gray-500 font-medium">{monthLabel}</span>
        </div>

        {/* Grid with row labels */}
        <div className="flex flex-col" style={{ gap: GAP }}>
          {rows.map((row, ri) => (
            <div key={ri} className="flex items-center" style={{ gap: GAP }}>
              {/* Row label */}
              <div style={{ width: LABEL_W, fontSize: 9, color: "#9ca3af", textAlign: "right", paddingRight: 4, flexShrink: 0 }}>
                {ROW_LABELS[ri]}
              </div>
              {/* Cells */}
              {row.map(({ date, points }) => (
                <div
                  key={date}
                  style={{ width: CELL, height: CELL, backgroundColor: getColor(points), borderRadius: 5, position: "relative", flexShrink: 0 }}
                  onMouseEnter={() => setHovered(date)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {hovered === date && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 whitespace-nowrap pointer-events-none">
                      <div className="bg-[#002017] text-white text-[10px] rounded px-2 py-1 shadow-lg">
                        {points > 0 ? `${points} pontos` : "Sem pontos"} · {new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-500 justify-center">
          <span>Menos</span>
          {["#e5e7eb", "#86efac", "#4ade80", "#16a34a", "#00674F"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, backgroundColor: c, borderRadius: 2 }} />
          ))}
          <span>Mais</span>
        </div>
      </div>
    </div>
  );
}


export default function WeightAndGamificationSection() {
  return (
    <section className="py-16 md:py-28 px-5 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-20">

        {/* Weight tracking */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="flex-1 flex flex-col gap-8">
            <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest">
              Acompanhamento de peso
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Acompanhe sua evolução com precisão
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Registre seu peso diariamente e visualize sua jornada em um gráfico
              claro. Veja seu IMC atualizado e mantenha o foco nos seus objetivos.
            </p>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-4">
                <span className="text-secondary-200 mt-0.5"><FiTrendingDown size={22} /></span>
                <div>
                  <p className="font-semibold text-gray-800 text-base">Histórico de peso</p>
                  <p className="text-gray-500 text-base">Filtre por 1 mês, 6 meses, 1 ano ou tudo.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-secondary-200 mt-0.5"><FiAward size={22} /></span>
                <div>
                  <p className="font-semibold text-gray-800 text-base">IMC em tempo real</p>
                  <p className="text-gray-500 text-base">Saiba exatamente onde você está na escala de saúde.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 pointer-events-none select-none w-full">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8">
              <p className="text-xl font-semibold text-[#002017] mb-1">Evolução do peso</p>
              <p className="text-sm text-gray-400 mb-6">Últimas 5 semanas</p>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis dataKey="date" tick={{ fill: "#002017", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#002017", fontSize: 12 }} domain={[82, 90]} unit=" kg" />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #008F6F" }}
                      formatter={(v: any) => [`${v} kg`, "Peso"]}
                    />
                    <Line type="monotone" dataKey="peso" stroke="#00674F" strokeWidth={3} dot={{ r: 5, fill: "#00B890" }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between bg-[#f0faf7] rounded-xl px-5 py-3">
                <span className="text-sm text-gray-500">Peso atual</span>
                <span className="text-xl font-bold text-[#00674F]">84.3 kg</span>
                <span className="text-sm font-semibold text-[#00674F]">▼ 4.2 kg no mês</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gamification */}
        <div className="flex flex-col md:flex-row-reverse items-stretch gap-12 md:gap-20">
          <div className="flex-1 flex flex-col gap-8">
            <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest">
              Ranking
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Transforme hábitos em conquistas
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Ganhe pontos a cada refeição registrada, suba no ranking mensal e
              visualize sua consistência no calendário de contribuições.
            </p>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-4">
                <span className="text-secondary-200 mt-0.5"><GiTrophy size={22} /></span>
                <div>
                  <p className="font-semibold text-gray-800 text-base">Ranking mensal</p>
                  <p className="text-gray-500 text-base">Compete com outros usuários e veja sua posição.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-secondary-200 mt-0.5"><FaStar size={20} /></span>
                <div>
                  <p className="font-semibold text-gray-800 text-base">Pontos acumulados</p>
                  <p className="text-gray-500 text-base">Cada refeição registrada vale pontos. Mantenha a sequência.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full h-full">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md overflow-hidden h-full flex flex-col">
              {/* Summary bar */}
              <div className="bg-[#00674F] flex items-center justify-around px-4 py-5 text-white">
                <div className="flex flex-col items-center gap-1">
                  <GiTrophy size={24} />
                  <span className="text-xl font-bold">Top 50</span>
                  <span className="text-xs opacity-80">Ranking no mês</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <FaStar size={22} />
                  <span className="text-xl font-bold">1.240</span>
                  <span className="text-xs opacity-80">Pontos acumulados</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <FaUtensils size={20} />
                  <span className="text-xl font-bold">62</span>
                  <span className="text-xs opacity-80">Refeições registradas</span>
                </div>
              </div>

              {/* Full-year contribution calendar */}
              <div className="p-6 flex flex-col items-center flex-1 justify-center">
                <p className="text-sm font-semibold text-[#002017] mb-4 text-center w-full">Atividade recente</p>
                <YearCalendarPreview />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
