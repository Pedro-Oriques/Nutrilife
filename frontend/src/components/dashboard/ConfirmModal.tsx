"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] mx-4 p-6 md:p-8 flex flex-col gap-5 md:gap-6">
        {/* Trash icon */}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="3 6 5 6 21 6" stroke="#C94A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#C94A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11v6M14 11v6" stroke="#C94A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#C94A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <h2 className="text-[28px] font-semibold text-[#002017] leading-tight">{title}</h2>

        <p className="text-[16px] text-[#002017] leading-[22px] tracking-[0.005em]">
          <strong>{message}</strong>
        </p>

        <div className="flex gap-4 mt-2 justify-end">
          <button
            onClick={onCancel}
            className="px-10 py-3 bg-[#00674F] text-[#E9E7E7] text-[18px] font-semibold rounded-xl hover:bg-[#004f3d] transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 border-2 border-[#C94A31] text-[#C94A31] text-[18px] font-semibold rounded-xl hover:bg-[#C94A31]/10 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
