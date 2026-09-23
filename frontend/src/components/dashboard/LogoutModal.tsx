"use client";

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] mx-4 p-6 md:p-8 flex flex-col gap-5 md:gap-6">
        {/* Exit icon */}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#C94A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="16 17 21 12 16 7" stroke="#C94A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke="#C94A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Title */}
        <h2 className="text-[34px] font-semibold text-[#002017] leading-tight">
          Sair da plataforma
        </h2>

        {/* Body */}
        <p className="text-[16px] text-[#002017] leading-[22px] tracking-[0.005em]">
          {" "}
          <strong>Tem certeza que deseja sair do NutriLife?</strong>
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-2 justify-end">
          <button
            onClick={onCancel}
            className="px-10 py-3 bg-[#00674F] text-[#E9E7E7] text-[20px] font-semibold rounded-xl hover:bg-[#004f3d] transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 border-2 border-[#00674F] text-[#00674F] text-[20px] font-semibold rounded-xl hover:bg-[#00674F]/10 transition"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
