"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createProfileRequest,
  getRecommendedFoodsRequest,
  getProfileRequest,
} from "@/services/api";

import PersonalDataModal from "./personalDataModal";
import ActivityLevelModal from "./activityLevelModal";
import GoalModal from "./goalModal";
import DietaryRestrictionsModal from "./dietaryRestrictionsModal";
import CalorieTargetModal from "./calorieTargetModal";

import RightChevron from "@/assets/Right-chevron.svg";
import LogoutModal from "@/components/dashboard/LogoutModal";

import Anamnese1 from "@/assets/Anamnese1.svg";
import Anamnese2 from "@/assets/Anamnese2.svg";
import Anamnese3 from "@/assets/Anamnese3.svg";
import goalmodal from "@/assets/goalmodal.svg";
import BackgroundPattern from "@/assets/Background.svg";

export default function AnamnesePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    birthDate?: string;
    height?: string;
    weight?: string;
    gender?: string;
  }>({});

  const [formData, setFormData] = useState({
    birthDate: "",
    height: "",
    weight: "",
    gender: "",
    physicalActivity: "",
    goal: "",
    foodRestrictions: [] as string[],
    otherFoods: [] as string[],
    lgpdConsent: false,
  });

  const [foodOptions, setFoodOptions] = useState<string[]>([]);

  const [profileGoals, setProfileGoals] = useState<{
    dailyCalorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  } | null>(null);

  const RESTRICTIONS_OPTIONS = [
    "Sem restrições",
    "Celíaco",
    "Vegano",
    "Vegetariano",
    "Colesterol alto",
  ];

  useEffect(() => {
    async function checkProfile() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        const profile = await getProfileRequest(token);
        if (profile && Object.keys(profile).length > 0) setHasProfile(true);
      } catch {
        // no profile, keep false
      }
    }
    checkProfile();
  }, []);

  useEffect(() => {
    async function fetchFoods() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFoodOptions([]);
          return;
        }

        const foods = await getRecommendedFoodsRequest(token);

        setFoodOptions(
          foods.map((f: any) => ({
            _id: f._id || f.id,
            name: f.name,
          })),
        );
      } catch (err) {
        console.error("Erro ao buscar alimentos:", err);
        setFoodOptions([]);
      }
    }
    fetchFoods();
  }, []);

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setError("");
  }

  function handleArrayChange(e: any, arrayName: "otherFoods") {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let currentArray = [...prev[arrayName]];
      if (checked) {
        currentArray.push(value);
      } else {
        currentArray = currentArray.filter((item) => item !== value);
      }
      return { ...prev, [arrayName]: currentArray };
    });
  }

  function handleRestrictionChange(e: any) {
    const { value, checked } = e.target;

    setFormData((prev) => {
      let currentRestrictions = [...prev.foodRestrictions];

      if (checked) {
        if (value === "Sem restrições") {
          currentRestrictions = ["Sem restrições"];
        } else {
          currentRestrictions = currentRestrictions.filter(
            (item) => item !== "Sem restrições",
          );
          currentRestrictions.push(value);
        }
      } else {
        currentRestrictions = currentRestrictions.filter(
          (item) => item !== value,
        );
      }

      return { ...prev, foodRestrictions: currentRestrictions };
    });
    setError("");
  }

  async function nextStep() {
    setError("");

    if (step === 1) {
      const newErrors: typeof fieldErrors = {};

      if (!formData.birthDate) {
        newErrors.birthDate = "O campo Data de nascimento é obrigatório.";
      } else {
        const date = new Date(formData.birthDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(date.getTime())) {
          newErrors.birthDate =
            "Informe uma data válida no formato DD/MM/AAAA.";
        } else if (date > today) {
          newErrors.birthDate = "A data de nascimento não pode ser futura.";
        } else {
          const age = today.getFullYear() - date.getFullYear();
          const m = today.getMonth() - date.getMonth();
          const adjustedAge =
            m < 0 || (m === 0 && today.getDate() < date.getDate())
              ? age - 1
              : age;
          if (adjustedAge < 1 || adjustedAge > 120) {
            newErrors.birthDate =
              "A idade informada deve estar entre 1 e 120 anos.";
          }
        }
      }

      const h = Number(formData.height);
      if (!formData.height) {
        newErrors.height = "O campo Altura é obrigatório.";
      } else if (h <= 0) {
        newErrors.height =
          "O valor informado no campo Altura deve ser maior que zero.";
      } else if (h < 1 || h > 300) {
        newErrors.height = "A Altura deve estar entre 1 e 300 cm.";
      }

      const w = Number(formData.weight);
      if (!formData.weight) {
        newErrors.weight = "O campo Peso é obrigatório.";
      } else if (w <= 0) {
        newErrors.weight =
          "O valor informado no campo Peso deve ser maior que zero.";
      } else if (w < 1 || w > 300) {
        newErrors.weight = "O Peso deve estar entre 1 e 300 kg.";
      }

      if (!formData.gender) {
        newErrors.gender = "O campo Sexo é obrigatório.";
      }

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
      }
    }

    if (step === 2) {
      if (!formData.physicalActivity)
        return setError("O campo Nível de Atividade Física é obrigatório.");
    }

    if (step === 3) {
      if (!formData.goal)
        return setError("Selecione um objetivo para continuar.");
    }

    if (step === 4) {
      if (formData.foodRestrictions.length === 0) {
        return setError("O campo Restrição Alimentar é obrigatório.");
      }
      if (!formData.lgpdConsent) {
        return setError(
          "Você precisa aceitar os termos de privacidade para continuar.",
        );
      }
    }

    if (step === 4) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const payload = {
          ...formData,
          height: Number.parseInt(formData.height, 10),
          weight: Number.parseFloat(formData.weight),
        };

        const response = await createProfileRequest(payload, token);

        setProfileGoals({
          dailyCalorieGoal: response.dailyCalorieGoal || 0,
          proteinGoal: response.proteinGoal || 0,
          carbsGoal: response.carbsGoal || 0,
          fatGoal: response.fatGoal || 0,
        });

        setStep(5);
      } catch (err: any) {
        setError(err.message || "Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step < 5) setStep((prev) => prev + 1);
  }

  function prevStep() {
    setError("");
    if (step > 1) setStep(step - 1);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  function finish() {
    router.push("/dashboard");
  }

  return (
    <div className="force-light min-h-screen flex flex-col relative bg-[#FAFEFC]">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-15">
        <Image
          src={BackgroundPattern}
          alt="Padrão de fundo NutriLife"
          fill
          className="object-cover"
          priority
        />
      </div>

      <header className="w-full flex justify-between items-center px-6 py-4 z-10 relative">
        <div className="w-[215px] h-14 flex items-center justify-center gap-2 bg-secondary-400 rounded-2xl shadow-sm">
          <Image
            src="/branding/logo.svg"
            alt="NutriLife"
            width={24}
            height={24}
          />
          <span className="text-white font-bold text-xl">NutriLife</span>
        </div>

        <div className="flex items-center gap-3">
          {hasProfile && (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex justify-center items-center px-[26px] py-[6px] border-2 border-[#00674F] text-[#00674F] rounded-lg font-medium hover:bg-[#00674F]/10 transition cursor-pointer"
            >
              Voltar
            </button>
          )}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex justify-center items-center px-[26px] py-[6px] gap-4 bg-secondary-400 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg text-white font-medium hover:bg-secondary-300 transition cursor-pointer"
          >
            Sair
            <Image src={RightChevron} alt="Sair" width={16} height={16} />
          </button>
        </div>
      </header>

      <main
        className={`flex-1 flex pt-2 w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-[165px] pb-10 z-10 relative transition-all duration-500 ${
          step === 5
            ? "justify-center items-center"
            : "justify-between items-start"
        }`}
      >
        <div
          className={`w-full flex flex-col bg-transparent p-4 rounded-3xl transition-all duration-500 ${
            step === 5 ? "max-w-[1000px]" : "max-w-[540px]"
          }`}
        >
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-3 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <PersonalDataModal
              formData={formData}
              handleChange={handleChange}
              fieldErrors={fieldErrors}
            />
          )}

          {step === 2 && (
            <ActivityLevelModal formData={formData} setFormData={setFormData} />
          )}

          {step === 3 && (
            <GoalModal formData={formData} setFormData={setFormData} />
          )}

          {step === 4 && (
            <DietaryRestrictionsModal
              formData={formData}
              handleRestrictionChange={handleRestrictionChange}
              handleChange={handleChange}
              handleArrayChange={handleArrayChange}
              RESTRICTIONS_OPTIONS={RESTRICTIONS_OPTIONS}
              OTHER_FOODS_OPTIONS={foodOptions}
            />
          )}

          {step === 5 && profileGoals && (
            <CalorieTargetModal
              goal={formData.goal}
              metrics={{
                dailyCalories: profileGoals.dailyCalorieGoal,
                proteins: profileGoals.proteinGoal,
                carbohydrates: profileGoals.carbsGoal,
                fats: profileGoals.fatGoal,
              }}
              onFinish={finish}
              isLoading={loading}
            />
          )}

          {step < 5 && (
            <div className="flex items-center w-full mt-4 pt-4 border-t border-gray-100">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg border-2 border-secondary-400 text-secondary-400 font-bold hover:bg-secondary-100 transition disabled:opacity-50"
                >
                  Voltar
                </button>
              )}

              <button
                onClick={nextStep}
                disabled={loading}
                className={`bg-secondary-400 text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-secondary-300 transition disabled:opacity-70 ${step > 1 ? "ml-auto" : ""}`}
              >
                {loading ? "Processando..." : "Avançar"}
              </button>
            </div>
          )}
        </div>

        {step < 5 && (
          <div className="hidden lg:flex w-[40%] justify-center items-center">
            {step === 1 && <Image src={Anamnese1} alt="" />}
            {step === 2 && <Image src={Anamnese2} alt="" />}
            {step === 3 && <Image src={goalmodal} alt="" />}
            {step === 4 && <Image src={Anamnese3} alt="" />}
          </div>
        )}
      </main>

      <footer className="w-full h-20 flex justify-between items-center px-6 py-4 bg-secondary-700 text-white mt-auto z-10 relative">
        <div className="hidden md:flex items-center gap-2 text-xl font-bold">
          <Image
            src="/branding/logo.svg"
            alt="NutriLife"
            width={24}
            height={24}
          />
          NutriLife
        </div>
        <div className="flex gap-6 text-sm text-white/80">
          <a href="/termos" className="hover:text-white transition">
            Termos e Condições
          </a>
          <a href="/politicas" className="hover:text-white transition">
            Políticas de Privacidade
          </a>
        </div>
      </footer>

      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  );
}
