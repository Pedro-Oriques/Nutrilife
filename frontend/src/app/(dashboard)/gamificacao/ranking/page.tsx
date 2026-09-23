"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/dashboard/Footer";
import LogoutModal from "@/components/dashboard/LogoutModal";
import DarkModeButton from "@/components/dashboard/DarkModeButton";
import RankingScreen from "@/components/gamification/RankingScreen";

export default function RankingPage() {
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
    <div className="h-screen flex flex-col" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 flex flex-col px-4 md:px-10 py-6 overflow-y-auto pb-24 md:pb-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-[48px] font-extrabold text-[#002017] leading-none">
                Ranking
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
                className="flex items-center gap-3 px-6 py-2 bg-[#00674F] text-white font-semibold rounded-lg shadow hover:bg-[#004f3d] transition"
              >
                Sair
              </button>
            </div>
          </div>

          {token && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1">
              <RankingScreen token={token} />
            </div>
          )}
        </main>
      </div>

      <Footer />

      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  );
}
