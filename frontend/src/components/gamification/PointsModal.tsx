"use client";

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POINTS_ACTIONS = [
  { label: "Fazer login", points: 50 },
  { label: "Registrar consumo de água", points: 100 },
  { label: "Atualizar peso", points: 200 },
  { label: "Registrar café da manhã", points: 200 },
  { label: "Registrar almoço", points: 200 },
  { label: "Registrar jantar", points: 200 },
  { label: "Registrar lanche", points: 200 },
];

export default function PointsModal({ isOpen, onClose }: PointsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] mx-4 p-6 md:p-8 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#002017]">
            Como você ganha pontos
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-[#002017] hover:text-[#00674F] transition text-2xl font-bold leading-none"
          >
            ✕
          </button>
        </div>

        {/* Actions list */}
        <ul className="flex flex-col divide-y divide-gray-100">
          {POINTS_ACTIONS.map(({ label, points }) => (
            <li key={label} className="flex items-center justify-between py-3">
              <span className="text-[#002017] text-base">{label}</span>
              <span className="text-[#00674F] font-bold text-base whitespace-nowrap ml-4">
                {points} pontos
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
