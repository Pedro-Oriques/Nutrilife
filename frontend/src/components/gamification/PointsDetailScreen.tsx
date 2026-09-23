"use client";

import { useState, useEffect, useCallback } from "react";
import { getGamificationPoints, GamificationPointsRecord } from "@/services/api";
import PointsModal from "./PointsModal";

interface PointsDetailScreenProps {
  token: string;
  showHowItWorks?: boolean;
}

const LIMIT_OPTIONS = [5, 10, 20, 30, 50];

const ACTION_TYPE_LABELS: Record<string, string> = {
  login: "Login diário",
  cafe_da_manha: "Café da manhã registrado",
  almoco: "Almoço registrado",
  jantar: "Jantar registrado",
  lanche: "Lanche registrado",
  agua: "Consumo de água registrado",
  peso: "Peso atualizado",
};

function formatDate(dateStr: string): string {
  // Expects YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function PointsDetailScreen({ token, showHowItWorks = true }: PointsDetailScreenProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState<GamificationPointsRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(total / limit);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGamificationPoints(token, page, limit);
      setRecords(result.data);
      setTotal(result.total);
    } catch {
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  function handleLimitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLimit(Number(e.target.value));
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-[#002017]">Pontuação</h1>
        {showHowItWorks && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-[#00674F] underline hover:opacity-75 transition-opacity"
          >
            Como funciona a pontuação
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            Carregando...
          </div>
        ) : records.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
            Você ainda não possui registros de pontuação.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 [&>li]:border-gray-100 dark:[&>li]:border-[#2a2a2a]">
            {records.map((record) => (
              <li key={record._id} className="flex items-center gap-3 py-4">
                {/* Points — highlighted left */}
                <span className="w-20 text-2xl font-bold text-[#00674F] shrink-0">
                  +{record.points}
                </span>

                {/* Description — center */}
                <span className="flex-1 text-[#002017] text-sm font-medium">
                  {ACTION_TYPE_LABELS[record.actionType] ?? record.actionType}
                </span>

                {/* Date — right */}
                <span className="text-sm text-gray-500 shrink-0 whitespace-nowrap">
                  {formatDate(record.date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <label htmlFor="points-limit">Registros por página:</label>
          <select
            id="points-limit"
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
          <span className="text-sm text-gray-500">
            {page} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || totalPages === 0}
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
