"use client";

import { useRouter } from "next/navigation";
import { GiTrophy } from "react-icons/gi";
import { FaStar, FaUtensils, FaTint } from "react-icons/fa";

export interface SummaryBarProps {
  rankingPosition: number | null;
  totalPoints: number;
  mealsCount: number;
  waterLiters: number;
}

function formatRankingPosition(position: number): string {
  if (position <= 10) return "Top 10";
  const magnitude = Math.pow(10, Math.floor(Math.log10(position)));
  const rounded = Math.ceil(position / magnitude) * magnitude;
  return `Top ${rounded.toLocaleString("pt-BR")}`;
}

export default function SummaryBar({
  rankingPosition,
  totalPoints,
  mealsCount,
  waterLiters,
}: SummaryBarProps) {
  const router = useRouter();

  return (
    <div className="bg-[#00674F] w-full flex items-center justify-around px-4 py-5 text-white">
      <div className="flex flex-col items-center gap-1">
        <GiTrophy size={26} color="#ffffff" />
        <span className="text-2xl font-bold leading-tight">
          {rankingPosition === null ? "--" : formatRankingPosition(rankingPosition)}
        </span>
        <span className="text-sm opacity-90 text-center">Ranking no mês</span>
      </div>

      <button
        onClick={() => router.push("/gamificacao/pontos")}
        className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
        aria-label="Ver detalhamento de pontos"
      >
        <FaStar size={24} color="#ffffff" />
        <span className="text-2xl font-bold leading-tight">{totalPoints}</span>
        <span className="text-sm opacity-90 text-center">Pontos acumulados</span>
      </button>

      <div className="flex flex-col items-center gap-1">
        <FaUtensils size={22} color="#ffffff" />
        <span className="text-2xl font-bold leading-tight">{mealsCount}</span>
        <span className="text-sm opacity-90 text-center">Refeições registradas</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <FaTint size={24} color="#ffffff" />
        <span className="text-2xl font-bold leading-tight">{waterLiters}L</span>
        <span className="text-sm opacity-90 text-center">Água consumida</span>
      </div>
    </div>
  );
}
