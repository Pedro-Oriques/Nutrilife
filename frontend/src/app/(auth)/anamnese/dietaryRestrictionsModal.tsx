"use client";

import React, { useState } from "react";

type DietaryRestrictionsModalProps = {
  formData: {
    birthDate: string;
    height: string;
    weight: string;
    gender: string;
    physicalActivity: string;
    goal: string;
    foodRestrictions: string[];
    otherFoods: string[];
    lgpdConsent: boolean;
  };
  handleRestrictionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleArrayChange: (
    e: React.ChangeEvent<HTMLInputElement> | any,
    arrayName: "otherFoods",
  ) => void;
  RESTRICTIONS_OPTIONS: string[];
  OTHER_FOODS_OPTIONS: any[];
};

const EMOJI_MAP: Record<string, string> = {
  "Sem restrições": "✅",
  Celíaco: "🌾",
  Vegano: "🐄",
  Vegetariano: "🌱",
  "Colesterol alto": "🧂",
};

export default function DietaryRestrictionsModal({
  formData,
  handleRestrictionChange,
  handleChange,
  handleArrayChange,
  RESTRICTIONS_OPTIONS,
  OTHER_FOODS_OPTIONS,
}: DietaryRestrictionsModalProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableFoods = OTHER_FOODS_OPTIONS.filter((food) => {
    const foodId = food._id || food.id;
    return !formData.otherFoods.includes(foodId);
  });

  return (
    <div className="w-full max-w-[540px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-500 font-medium">4/5</span>
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-secondary-700 leading-tight">
          Queremos saber mais <br /> sobre você ✨
        </h1>
        <p className="text-gray-600 mt-1 text-sm font-medium">
          Você segue alguma restrição alimentar?
        </p>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        {RESTRICTIONS_OPTIONS.map((item) => {
          const isSelected = formData.foodRestrictions.includes(item);
          const emoji = EMOJI_MAP[item] || "🍽️";

          return (
            <label
              key={item}
              className={`w-full min-h-[48px] px-3 rounded-xl border-2 flex items-center justify-between transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? "bg-secondary-400 border-secondary-400 text-white shadow-sm"
                    : "bg-white border-secondary-400 text-gray-800 hover:bg-gray-50"
                }`}
            >
              <input
                type="checkbox"
                name="foodRestrictions"
                value={item}
                checked={isSelected}
                onChange={handleRestrictionChange}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${
                    isSelected ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {emoji}
                </div>

                <span
                  className={`font-bold text-base ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item}
                </span>
              </div>

              {isSelected && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </label>
          );
        })}
      </div>

      <div className="relative mt-4">
        <p className="text-xs font-bold text-gray-900 mb-1">
          Tem alimentos específicos que não pode? Selecione-os aqui.
        </p>

        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full min-h-[48px] bg-gray-50 border-2 border-secondary-400 rounded-xl flex items-center justify-between px-3 py-1.5 cursor-pointer transition-all"
        >
          <div className="flex flex-wrap gap-1.5 flex-1">
            {formData.otherFoods.length === 0 && (
              <span className="text-gray-400 text-sm ml-1 select-none font-medium">
                Selecionar...
              </span>
            )}

            {formData.otherFoods.map((selectedId, index) => {
              const foodObj = OTHER_FOODS_OPTIONS.find(
                (f) => f._id === selectedId || f.id === selectedId,
              );

              const displayName = foodObj ? foodObj.name : "Desconhecido";

              return (
                <span
                  key={selectedId || `selected-food-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArrayChange(
                      { target: { value: selectedId, checked: false } },
                      "otherFoods",
                    );
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border-2 border-secondary-400 text-secondary-700 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  {displayName}
                  <svg
                    className="w-3.5 h-3.5 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              );
            })}
          </div>

          <div className="ml-2 text-secondary-400 flex flex-col -space-y-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 15l7-7 7 7"
              />
            </svg>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-100 rounded-xl shadow-lg max-h-40 overflow-y-auto">
            {OTHER_FOODS_OPTIONS.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 italic">
                Carregando alimentos...
              </div>
            ) : availableFoods.length > 0 ? (
              availableFoods.map((food, index) => {
                const foodId = food._id || food.id;
                const foodName = food.name || "Sem nome";

                return (
                  <div
                    key={foodId || `food-${index}`}
                    onClick={() => {
                      handleArrayChange(
                        { target: { value: foodId, checked: true } },
                        "otherFoods",
                      );
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-secondary-50 cursor-pointer text-sm text-gray-700 font-bold border-b border-gray-100 last:border-0 transition-colors"
                  >
                    {foodName}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 italic font-medium">
                Todas as opções já foram selecionadas.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          name="lgpdConsent"
          checked={formData.lgpdConsent}
          onChange={handleChange}
          className="w-4 h-4 text-secondary-400 border-gray-300 rounded focus:ring-secondary-400 cursor-pointer"
        />
        <span className="text-xs text-gray-600 font-medium">
          Declaro que li e aceito os termos de privacidade e uso de dados
          (LGPD).
        </span>
      </div>
    </div>
  );
}
