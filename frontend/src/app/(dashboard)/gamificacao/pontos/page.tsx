"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/dashboard/Footer";
import LogoutModal from "@/components/dashboard/LogoutModal";
import DarkModeButton from "@/components/dashboard/DarkModeButton";
import PointsDetailScreen from "@/components/gamification/PointsDetailScreen";
import Image from "next/image";
import RightChevron from "@/assets/Right-chevron.svg";
import BackgroundPattern from "@/assets/Background.svg";

export default function PontosPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
      return;
    }
    setToken(storedToken);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="h-screen flex relative overflow-hidden" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <Image src={BackgroundPattern} alt="Padrão de fundo NutriLife" fill className="object-cover" priority />
      </div>
      <Sidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1">
          <div className="px-4 md:px-10 lg:px-[85px] pt-6 pb-24 md:pb-12 flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl lg:text-[36px] [@media(min-height:781px)]:lg:text-[48px] font-extrabold text-[#002017] leading-tight">
                  Histórico de Pontos
                </h1>
                <p className="text-base md:text-lg text-gray-500 mt-2 capitalize">
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DarkModeButton />
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex justify-center items-center px-4 md:px-[26px] py-[6px] gap-2 md:gap-4 bg-[#00674F] shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg text-white font-medium hover:bg-[#004f3d] transition cursor-pointer text-sm md:text-base"
                >
                  Sair
                  <Image src={RightChevron} alt="Sair" width={16} height={16} />
                </button>
              </div>
            </div>

            {token && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <PointsDetailScreen token={token} />
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>

      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  );
}
