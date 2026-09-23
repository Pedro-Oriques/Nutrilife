"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function DarkModeButton() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex items-center gap-2 px-4 py-[6px] bg-[#E9E7E7] dark:bg-[#2a2a2a] border border-[#008F6F]/30 dark:border-[#444444] shadow-[0_0_8px_rgba(0,0,0,0.15)] rounded-lg text-[#002017] dark:text-[#e8e8e8] font-medium hover:opacity-80 transition cursor-pointer text-sm md:text-base"
    >
      {isDark ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span className="hidden sm:inline">Modo claro</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span className="hidden sm:inline">Modo escuro</span>
        </>
      )}
    </button>
  );
}
