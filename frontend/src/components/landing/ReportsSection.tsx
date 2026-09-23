"use client";

import { FiBarChart2, FiTrendingUp } from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const chartData = [
  { date: "19/03", cal: 1650 },
  { date: "20/03", cal: 2100 },
  { date: "21/03", cal: 1420 },
  { date: "22/03", cal: 2800 },
  { date: "23/03", cal: 1900 },
  { date: "24/03", cal: 1600 },
  { date: "25/03", cal: 2200 },
];

export default function ReportsSection() {
  return (
    <section className="py-16 md:py-28 px-5 md:px-12 bg-[#f0faf7]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        {/* Left — real recharts preview */}
        <div className="flex-1 pointer-events-none select-none">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 w-full">
            <p className="text-xl font-semibold text-[#002017] mb-4">Evolução de calorias consumidas</p>
            <div className="flex gap-5 mb-6">
              {[
                { label: "Calorias consumidas", val: "13.670 kcal" },
                { label: "Refeições feitas", val: "21" },
                { label: "Meta atingida", val: "96%" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 flex flex-col">
                  <span className="text-sm text-gray-400">{s.label}</span>
                  <span className="text-xl font-semibold text-[#00674F]">{s.val}</span>
                </div>
              ))}
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis dataKey="date" tick={{ fill: "#002017", fontSize: 13 }} />
                  <YAxis tick={{ fill: "#002017", fontSize: 13 }} domain={[1000, 3000]} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #008F6F" }}
                    formatter={(v: any) => [`${v} kcal`, "Calorias"]}
                  />
                  <Line type="monotone" dataKey="cal" stroke="#00674F" strokeWidth={3} dot={{ r: 5, fill: "#00B890" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col gap-8">
          <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest">
            Relatórios
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Entenda seus hábitos e evolua com dados
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Relatórios detalhados por período mostram seu progresso real.
            Acompanhe calorias, refeições e compare com suas metas.
          </p>
          <ul className="flex flex-col gap-5">
            <li className="flex items-start gap-4">
              <span className="text-secondary-200 mt-0.5"><FiBarChart2 size={22} /></span>
              <div>
                <p className="font-semibold text-gray-800 text-base">Relatórios por período</p>
                <p className="text-gray-500 text-base">Visualize dados semanais, mensais ou personalizados.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-secondary-200 mt-0.5"><FiTrendingUp size={22} /></span>
              <div>
                <p className="font-semibold text-gray-800 text-base">Comparação com metas</p>
                <p className="text-gray-500 text-base">Entenda se está no caminho certo dia após dia.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
