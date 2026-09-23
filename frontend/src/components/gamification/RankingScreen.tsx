"use client";

import { useState, useEffect, useCallback } from "react";
import { getGamificationRanking, RankingEntry } from "@/services/api";
import PointsModal from "./PointsModal";

interface RankingScreenProps {
  token: string;
}

const TABS = [
  { label: "Ranking semanal", period: "weekly" },
  { label: "Ranking mensal", period: "monthly" },
  { label: "Ranking geral", period: "all-time" },
] as const;

const LIMIT_OPTIONS = [5, 10, 20, 30, 50];

const AVATAR_COLORS = [
  "#00674F", "#C94A31", "#2563EB", "#7C3AED", "#D97706",
  "#059669", "#DC2626", "#0891B2", "#9333EA", "#EA580C",
];

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function formatRankingPosition(position: number): string {
  if (position <= 10) return ">10";
  const magnitude = Math.pow(10, Math.floor(Math.log10(position)));
  const rounded = Math.ceil(position / magnitude) * magnitude;
  return `>${rounded.toLocaleString("pt-BR")}`;
}

export default function RankingScreen({ token }: RankingScreenProps) {
  const [activeTab, setActiveTab] = useState(1); // "Ranking mensal" default
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const period = TABS[activeTab].period;
  const totalPages = Math.ceil(total / limit);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGamificationRanking(token, period, page, limit);
      setEntries(result.data);
      setTotal(result.total);
    } catch {
      setEntries([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, period, page, limit]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  function handleTabChange(index: number) {
    setActiveTab(index);
    setPage(1);
  }

  function handleLimitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLimit(Number(e.target.value));
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary, #002017)" }}>Ranking</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-[#00674F] underline hover:opacity-75 transition-opacity"
        >
          Como funciona a pontuação
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-2 overflow-x-auto">
        {TABS.map((tab, index) => (
          <button
            key={tab.period}
            onClick={() => handleTabChange(index)}
            className={`py-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-1 min-w-0 ${
              activeTab === index
                ? "border-[#00674F] text-[#00674F]"
                : "border-transparent text-gray-500 hover:text-[#002017] dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            Carregando...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
            Nenhum ranking disponível no momento
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 [&>li]:border-gray-100 dark:[&>li]:border-[#2a2a2a]">
            {entries.map((entry, index) => (
              <li key={`${entry.userId}-${index}`} className="flex items-center gap-3 py-3">
                {/* Position */}
                <span className="w-16 text-sm font-semibold shrink-0" style={{ color: "var(--text-primary, #4b5563)" }}>
                  #{entry.position}
                </span>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
                  style={{ backgroundColor: getAvatarColor(entry.fullName) }}
                  aria-hidden="true"
                >
                  {entry.fullName.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--text-primary, #002017)" }}>
                  {entry.fullName}
                </span>

                {/* Points */}
                <span className="text-sm font-semibold shrink-0" style={{ color: "var(--text-primary, #00674f)" }}>
                  {entry.totalPoints} pontos
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary, #4b5563)" }}>
          <label htmlFor="ranking-limit">Registros por página:</label>
          <select
            id="ranking-limit"
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#00674F]"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm" style={{ color: "var(--text-primary, #6b7280)" }}>
            {page} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Próximo
          </button>
        </div>
      </div>

      <PointsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
