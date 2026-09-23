"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/dashboard/Footer";
import LogoutModal from "@/components/dashboard/LogoutModal";
import DarkModeButton from "@/components/dashboard/DarkModeButton";
import SummaryBar from "@/components/gamification/SummaryBar";
import ContributionCalendar from "@/components/gamification/ContributionCalendar";
import RankingScreen from "@/components/gamification/RankingScreen";
import Image from "next/image";
import RightChevron from "@/assets/Right-chevron.svg";
import BackgroundPattern from "@/assets/Background.svg";
import {
  getGamificationSummary,
  getGamificationCalendar,
  GamificationSummary,
  CalendarDay,
} from "@/services/api";

export default function GamificacaoPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      setToken(token);
      const [summaryData, calendarData] = await Promise.all([
        getGamificationSummary(token).catch(
          () =>
            ({
              rankingPosition: null,
              totalPoints: 0,
              mealsCount: 0,
              waterLiters: 0,
            }) as GamificationSummary,
        ),
        getGamificationCalendar(token).catch(() => [] as CalendarDay[]),
      ]);
      setSummary(summaryData);
      setCalendarDays(Array.isArray(calendarData) ? calendarData : []);
    } catch {
      // silently fail, data stays empty
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div
      className="h-screen flex relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <Image
          src={BackgroundPattern}
          alt="Padrão de fundo NutriLife"
          fill
          className="object-cover"
          priority
        />
      </div>
      <Sidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1">
          <div className="px-4 md:px-10 lg:px-[85px] pt-6 pb-12 flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl lg:text-[36px] [@media(min-height:781px)]:lg:text-[48px] font-extrabold text-[#002017] leading-tight">
                  Ranking
                </h1>
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

            {/* Loading spinner */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00674F]" />
              </div>
            )}

            {!loading && (
              <div className="flex flex-col gap-6">
                {summary && (
                  <div className="rounded-2xl overflow-hidden shadow-sm">
                    <SummaryBar
                      rankingPosition={summary.rankingPosition}
                      totalPoints={summary.totalPoints}
                      mealsCount={summary.mealsCount}
                      waterLiters={summary.waterLiters}
                    />
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <ContributionCalendar days={calendarDays} />
                </div>

                {token && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <RankingScreen token={token} />
                  </div>
                )}
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
