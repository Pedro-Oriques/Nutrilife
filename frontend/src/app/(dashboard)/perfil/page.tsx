"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import {
  getProfileRequest,
  createProfileRequest,
  updateProfileRequest,
  getRecommendedFoodsRequest,
} from "@/services/api";

import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/dashboard/Footer";
import LogoutModal from "@/components/dashboard/LogoutModal";
import Image from "next/image";
import BackgroundPattern from "@/assets/Background.svg";
import RightChevron from "@/assets/Right-chevron.svg"; // Ícone do botão Sair
import { useTheme } from "@/contexts/ThemeContext";

type Sexo = "Feminino" | "Masculino";

type Perfil = {
  nascimento: string;
  altura: number;
  peso: number;
  sexo: Sexo;
  objetivo: string;
  atividade: string;
};

const RESTRICTION_OPTIONS = [
  "Sem restrições",
  "Celíaco",
  "Vegano",
  "Vegetariano",
  "Colesterol alto",
];

const ACTIVITY_OPTIONS = [
  "Sedentário",
  "Pouco ativo",
  "Ativo",
  "Muito Ativo",
  "Extremamente Ativo",
];

const GOAL_OPTIONS = ["Perda de peso", "Ganho de massa", "Manter saúde"];

const SelectArrow = () => (
  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#002017]">
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </div>
);

export default function EditarPerfilPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Estado que controla a visibilidade do modal de logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [userName, setUserName] = useState("Usuário");
  const [userInitials, setUserInitials] = useState("US");
  const [userMemberSince, setUserMemberSince] = useState("");

  const [perfil, setPerfil] = useState<Perfil>({
    nascimento: "",
    altura: 0,
    peso: 0,
    sexo: "Feminino",
    objetivo: "Manter saúde",
    atividade: "Sedentário",
  });
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [alimentos, setAlimentos] = useState<string[]>([]);
  const [macros, setMacros] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });

  const [foodOptions, setFoodOptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const binaryString = window.atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const jsonPayload = new TextDecoder("utf-8").decode(bytes);
          const payload = JSON.parse(jsonPayload);

          if (payload.username) {
            setUserName(payload.username);

            const nameParts = payload.username.trim().split(/\s+/);
            let initials = "US";
            if (nameParts.length >= 2) {
              initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            } else if (nameParts.length === 1) {
              initials = nameParts[0].substring(0, 2).toUpperCase();
            }
            setUserInitials(initials);
          }

          const dataAtual = new Date();
          const mes = dataAtual
            .toLocaleString("pt-BR", { month: "short" })
            .replace(".", "");
          const ano = dataAtual.getFullYear();
          setUserMemberSince(`Cadastrado(a) desde ${mes}. ${ano}`);
        } catch (e) {
          console.error("Não foi possível ler o nome no token.", e);
        }

        const [profileData, foods] = await Promise.all([
          getProfileRequest(token).catch(() => null),
          getRecommendedFoodsRequest(token).catch(() => []),
        ]);

        setFoodOptions(foods);

        if (profileData) {
          const p = Array.isArray(profileData) ? profileData[0] : profileData;
          if (p) {
            setHasExistingProfile(true);
            const d = new Date(p.birthDate);
            const formattedDate = !isNaN(d.getTime())
              ? d.toISOString().split("T")[0]
              : "";

            setPerfil({
              nascimento: formattedDate,
              altura: p.height || 0,
              peso: p.weight || 0,
              sexo: p.gender || "Feminino",
              objetivo: p.goal || "Manter saúde",
              atividade: p.physicalActivity || "Sedentário",
            });
            setRestricoes(p.foodRestrictions || []);
            setAlimentos(p.otherFoods || []);
            setMacros({
              calories: p.dailyCalorieGoal || 0,
              carbs: p.carbsGoal || 0,
              protein: p.proteinGoal || 0,
              fat: p.fatGoal || 0,
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  function updatePerfil<K extends keyof Perfil>(
    campo: K,
    valor: Perfil[K],
  ): void {
    setPerfil((prev: Perfil) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function toggleRestricao(item: string): void {
    setRestricoes((prev: string[]) => {
      if (prev.includes(item)) {
        return prev.filter((r) => r !== item);
      } else {
        if (item === "Sem restrições") {
          return ["Sem restrições"];
        } else {
          return [...prev.filter((r) => r !== "Sem restrições"), item];
        }
      }
    });
  }

  function removeFood(foodId: string): void {
    setAlimentos((prev: string[]) =>
      prev.filter((id: string) => id !== foodId),
    );
  }

  async function salvar(): Promise<void> {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const payload = {
        birthDate: perfil.nascimento,
        height: Number(perfil.altura),
        weight: Number(perfil.peso),
        gender: perfil.sexo,
        physicalActivity: perfil.atividade,
        goal: perfil.objetivo,
        foodRestrictions: restricoes,
        otherFoods: alimentos,
        lgpdConsent: true,
      };

      const updatedProfile = hasExistingProfile
        ? await updateProfileRequest(payload, token)
        : await createProfileRequest(payload, token);

      setMacros({
        calories: updatedProfile.dailyCalorieGoal || 0,
        carbs: updatedProfile.carbsGoal || 0,
        protein: updatedProfile.proteinGoal || 0,
        fat: updatedProfile.fatGoal || 0,
      });

      alert("Perfil salvo e metas atualizadas com sucesso!");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  function cancelar(): void {
    router.back();
  }

  function handleLogout(): void {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/");
  }

  const filteredFoods = foodOptions.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !alimentos.includes(f._id || f.id),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-xl" style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}>
        Carregando seu perfil...
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-15">
        <Image
          src={BackgroundPattern}
          alt="Padrão de fundo NutriLife"
          fill
          className="object-cover"
          priority
        />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1 px-4 md:px-10 lg:px-[85px] pt-8 pb-24 md:pb-20">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl md:text-[48px] font-extrabold text-[#002017] leading-none">
                Meu perfil
              </h1>

              <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
                  className="flex items-center gap-2 px-4 py-[6px] bg-[#E9E7E7] dark:bg-[#2a2a2a] border border-[#008F6F]/30 dark:border-[#444444] shadow-[0_0_8px_rgba(0,0,0,0.15)] rounded-lg text-[#002017] dark:text-[#e8e8e8] font-medium hover:opacity-80 transition cursor-pointer"
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
                      Modo claro
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>
                      Modo escuro
                    </>
                  )}
                </button>

                {/* Botão atualizado para abrir o modal de logout */}
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex justify-center items-center px-[26px] py-[6px] gap-4 bg-[#00674F] shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg text-white font-medium hover:bg-[#004f3d] transition cursor-pointer"
                >
                  Sair
                  <Image src={RightChevron} alt="Sair" width={16} height={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-16">
              <div className="w-[108px] h-[104px] rounded-full bg-[#008F6F] flex items-center justify-center text-white font-bold text-[40px] shadow-sm">
                {userInitials}
              </div>

              <div className="flex flex-col justify-center">
                <h2 className="text-[34px] font-medium text-[#002017] leading-none mb-1">
                  {userName}
                </h2>
                <p className="text-[14px] text-[#002017] opacity-70 font-medium">
                  {userMemberSince}
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-16">
              <div className="flex-1 max-w-[600px] flex flex-col gap-6">
                <h3 className="text-[34px] font-semibold text-[#002017] mb-2 tracking-wide">
                  Minhas informações
                </h3>

                <div className="flex items-center justify-between w-full">
                  <label className="text-[18px] font-semibold text-[#002017]">
                    Data de nascimento:
                  </label>
                  <input
                    type="date"
                    value={perfil.nascimento}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updatePerfil("nascimento", e.target.value)
                    }
                    className="w-[280px] h-[48px] bg-transparent border border-[#008F6F] rounded-full px-5 text-[#002017] font-medium outline-none focus:ring-2 focus:ring-[#008F6F]/30"
                  />
                </div>

                <div className="flex items-center justify-between w-full">
                  <label className="text-[18px] font-semibold text-[#002017]">
                    Altura:
                  </label>
                  <div className="relative w-[280px]">
                    <input
                      type="number"
                      value={perfil.altura}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updatePerfil("altura", Number(e.target.value))
                      }
                      className="w-full h-[48px] bg-transparent border border-[#008F6F] rounded-full pl-5 pr-12 text-[#002017] font-medium outline-none focus:ring-2 focus:ring-[#008F6F]/30"
                    />
                    <span className="absolute right-5 top-3.5 text-sm font-bold text-[#002017]">
                      cm
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full">
                  <label className="text-[18px] font-semibold text-[#002017]">
                    Peso:
                  </label>
                  <div className="relative w-[280px]">
                    <input
                      type="number"
                      step="0.1"
                      value={perfil.peso}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updatePerfil("peso", Number(e.target.value))
                      }
                      className="w-full h-[48px] bg-transparent border border-[#008F6F] rounded-full pl-5 pr-12 text-[#002017] font-medium outline-none focus:ring-2 focus:ring-[#008F6F]/30"
                    />
                    <span className="absolute right-5 top-3.5 text-sm font-bold text-[#002017]">
                      kg
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full">
                  <label className="text-[18px] font-semibold text-[#002017]">
                    Sexo:
                  </label>
                  {/* Select */}
                  <div className="relative w-[280px]">
                    <select
                      value={perfil.sexo}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updatePerfil("sexo", e.target.value as Sexo)
                      }
                      className="w-full h-[48px] bg-transparent border border-[#008F6F] rounded-full pl-5 pr-12 text-[#002017] font-medium outline-none focus:ring-2 focus:ring-[#008F6F]/30 appearance-none cursor-pointer"
                    >
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                    </select>
                    <SelectArrow />
                  </div>
                </div>

                <div className="h-2"></div>

                <div className="flex items-center justify-between w-full">
                  <label className="text-[18px] font-semibold text-[#002017] flex items-center gap-2">
                    <span>🎯</span> Objetivo na plataforma:
                  </label>
                  {/* Select  */}
                  <div className="relative w-[280px]">
                    <select
                      value={perfil.objetivo}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updatePerfil("objetivo", e.target.value)
                      }
                      className="w-full h-[48px] bg-transparent border border-[#008F6F] rounded-full pl-5 pr-12 text-[#002017] font-medium outline-none focus:ring-2 focus:ring-[#008F6F]/30 appearance-none cursor-pointer"
                    >
                      {GOAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mb-6">
                  <label className="text-[18px] font-semibold text-[#002017] flex items-center gap-2">
                    <span>💪</span> Nível de atividade física:
                  </label>
                  {/* Select */}
                  <div className="relative w-[280px]">
                    <select
                      value={perfil.atividade}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updatePerfil("atividade", e.target.value)
                      }
                      className="w-full h-[48px] bg-transparent border border-[#008F6F] rounded-full pl-5 pr-12 text-[#002017] font-medium outline-none focus:ring-2 focus:ring-[#008F6F]/30 appearance-none cursor-pointer"
                    >
                      {ACTIVITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>

                {/* RESTRIÇÕES LISTA */}
                <h3 className="text-[34px] font-semibold text-[#002017] mb-2 tracking-wide mt-4">
                  Minhas restrições alimentares
                </h3>

                <div className="flex flex-col gap-4 mb-8">
                  {RESTRICTION_OPTIONS.map((item: string) => {
                    const isSelected = restricoes.includes(item);
                    return (
                      <label
                        key={item}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRestricao(item)}
                            className="peer hidden"
                          />
                          <div
                            className={`w-[22px] h-[22px] rounded-[4px] border-[1.5px] transition-colors flex items-center justify-center ${
                              isSelected
                                ? "bg-[#008F6F] border-[#008F6F]"
                                : "border-[#008F6F] bg-transparent group-hover:bg-[#008F6F]/10"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3.5"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>

                        <span className="text-[16px] text-[#002017] font-medium group-hover:opacity-80 transition">
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* ALIMENTOS ESPECÍFICOS */}
                <div>
                  <h4 className="text-[20px] font-semibold text-[#002017] mb-4">
                    Alimentos específicos
                  </h4>

                  <div className="relative w-full mb-4">
                    <input
                      placeholder="Pesquisar alimentos para bloquear..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsFoodDropdownOpen(true)}
                      onBlur={() =>
                        setTimeout(() => setIsFoodDropdownOpen(false), 200)
                      }
                      className="w-full h-[48px] bg-[#F4F4F4] border border-[#008F6F] rounded-[24px] px-6 text-[#002017] outline-none focus:ring-2 focus:ring-[#008F6F]/20"
                    />
                    <div className="absolute right-5 top-[14px]">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#008F6F"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>

                    {isFoodDropdownOpen && filteredFoods.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-[#008F6F]/20 rounded-2xl shadow-xl max-h-56 overflow-y-auto">
                        {filteredFoods.map((food) => (
                          <div
                            key={food._id || food.id}
                            onClick={() => {
                              setAlimentos((prev) => [
                                ...prev,
                                food._id || food.id,
                              ]);
                              setSearchTerm("");
                              setIsFoodDropdownOpen(false);
                            }}
                            className="px-5 py-3 hover:bg-[#F4F8F6] cursor-pointer text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0"
                          >
                            {food.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pills de alimentos selecionados */}
                  <div className="flex flex-wrap gap-2 w-full">
                    {alimentos.map((foodId: string) => {
                      const foodObj = foodOptions.find(
                        (f) => f._id === foodId || f.id === foodId,
                      );
                      const foodName = foodObj ? foodObj.name : "Carregando...";

                      return (
                        <div
                          key={foodId}
                          className="flex items-center gap-2 bg-transparent border border-[#008F6F] text-[#008F6F] px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm"
                        >
                          {foodName}
                          <button
                            type="button"
                            onClick={() => removeFood(foodId)}
                            className="hover:text-red-500 transition"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex gap-4 mt-12 w-full justify-end">
                  <button
                    type="button"
                    onClick={cancelar}
                    className="w-[140px] h-[38px] bg-transparent border-2 border-[#008F6F] text-[#008F6F] rounded-lg shadow-[0px_0px_8px_rgba(0,0,0,0.25)] flex items-center justify-center font-bold hover:bg-[#008F6F]/10 transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={salvar}
                    disabled={saving}
                    className="w-[140px] h-[38px] bg-[#00674F] text-white rounded-lg shadow-[0px_0px_8px_rgba(0,0,0,0.25)] flex items-center justify-center font-bold hover:bg-[#0a4a3a] transition disabled:opacity-70 cursor-pointer"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>

              {/* COLUNA DIREITA: METAS */}
              <div className="w-full lg:w-[300px] flex-shrink-0 pt-4">
                <div className="sticky top-10 flex flex-col items-end">
                  <h3 className="w-full text-left text-[25px] font-semibold text-[#002017] mb-6">
                    Sua meta calórica
                  </h3>

                  <div className="w-full flex flex-col gap-5 border-b border-[#008F6F]/20 pb-6 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-3 text-[16px] font-semibold text-[#002017]">
                        <span className="w-5 h-5 bg-[#00D194] rounded-full"></span>
                        Carboidratos
                      </span>
                      <span className="text-[18px] font-bold text-[#002017]">
                        {macros.carbs}g
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-3 text-[16px] font-semibold text-[#002017]">
                        <span className="w-5 h-5 bg-[#4A2F1D] rounded-full"></span>
                        Proteínas
                      </span>
                      <span className="text-[18px] font-bold text-[#002017]">
                        {macros.protein}g
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-3 text-[16px] font-semibold text-[#002017]">
                        <span className="w-5 h-5 bg-[#C94A31] rounded-full"></span>
                        Gordura
                      </span>
                      <span className="text-[18px] font-bold text-[#002017]">
                        {macros.fat}g
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline w-full px-2 mb-6">
                    <span className="text-[14px] font-bold text-[#002017]">
                      Total:
                    </span>
                    <span className="text-[48px] font-extrabold text-[#002017] leading-none">
                      {macros.calories}
                    </span>
                    <span className="text-[14px] font-bold text-[#002017]">
                      kcal
                    </span>
                  </div>

                  <p className="text-[12px] font-bold leading-relaxed text-[#002017] text-right">
                    Os valores de carboidratos, proteínas e<br />
                    gorduras apresentados são sugestões
                    <br />
                    baseadas em recomendações
                    <br />
                    nutricionais gerais para auxiliar na
                    <br />
                    distribuição equilibrada de
                    <br />
                    macronutrientes ao longo do dia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>

      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  );
}
