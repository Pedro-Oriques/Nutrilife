"use client";

import { useAuth } from "@/contexts/AuthContexts";
import Image from "next/image";

export default function LandingHeader() {
  const { openLogin, openRegister } = useAuth();

  return (
    <header className="w-full sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-2">
        <Image
          src="/branding/logo.svg"
          alt="NutriLife"
          width={32}
          height={32}
        />
        <span className="font-bold text-lg text-gray-800">NutriLife</span>
      </div>

      <button
        onClick={openLogin}
        className="bg-secondary-200 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-secondary-300 transition-colors shadow-sm"
      >
        Entrar
      </button>
    </header>
  );
}
