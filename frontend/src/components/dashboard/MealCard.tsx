import { useState } from "react";
import Image from "next/image";
import { Food } from "@/types/food";
import AddFood from "@/assets/AddDash.svg";
import ButtonDash from "./ButtonDash";

interface FoodEntry {
  _id: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealCardProps {
  title: string;
  items?: FoodEntry[];
  onAddFood: () => void;
  onRemoveFood: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function MealCard({
  title,
  items = [],
  onAddFood,
  onRemoveFood,
  isOpen,
  onToggle,
}: MealCardProps) {
  const hasItems = items && items.length > 0;

  const sessionMacros = items.reduce(
    (acc, item) => ({
      carbs: acc.carbs + (item.carbs || 0),
      protein: acc.protein + (item.protein || 0),
      fat: acc.fat + (item.fat || 0),
    }),
    { carbs: 0, protein: 0, fat: 0 },
  );

  return (
    <div
      className={`border transition-all duration-300 overflow-hidden ${
        isOpen
          ? "border-gray-200 rounded-2xl shadow-md"
          : "border-gray-100 rounded-[20px] shadow-sm hover:shadow-md"
      }`}
      style={{ backgroundColor: "var(--bg-card, white)" }}
    >
      {/* HEADER DO CARD */}
      <div
        onClick={onToggle}
        className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          isOpen ? "border-b border-gray-100 bg-gray-50" : ""
        }`}
      >
        <h3 className="text-[22px] font-semibold tracking-tight" style={{ color: "var(--text-primary, #002017)" }}>
          {title}
        </h3>

        {!isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFood();
            }}
            className="flex items-center gap-2 bg-[#00674F] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary-800 transition shadow-sm"
          >
            Adicionar alimentos
            <span className="bg-white text-[#00674F] rounded-full w-[18px] h-[18px] flex items-center justify-center text-lg font-bold leading-none pb-0.5">
              +
            </span>
          </button>
        )}

        {isOpen && (
          <div className="flex items-center gap-4 text-sm font-medium" style={{ color: "var(--text-primary, #1f2937)" }}>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#E7564A]"></span>{" "}
              {sessionMacros.fat.toFixed(0)}g
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#00D194]"></span>{" "}
              {sessionMacros.carbs.toFixed(0)}g
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#4A2F1D]"></span>{" "}
              {sessionMacros.protein.toFixed(0)}g
            </span>
          </div>
        )}
      </div>

      {/* CONTEÚDO EXPANDIDO */}
      {isOpen && (
        <div className="px-6 py-5">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-6 text-sm font-bold mb-3" style={{ color: "var(--text-primary, #002017)" }}>
            <div>Alimentos</div>
            <div className="text-center w-12">Qtde.</div>
            <div className="text-center w-8">Un.</div>
            <div className="text-right w-16">Calorias</div>
          </div>

          {!hasItems ? (
            <p className="text-sm text-gray-500 py-4 font-medium">
              Nenhum alimento registrado nesta refeição.
            </p>
          ) : (
            <ul className="space-y-2 mb-8">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-6 text-sm items-center font-medium group"
                  style={{ color: "var(--text-primary, #1f2937)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-lg leading-none mt-0.5">
                      •
                    </span>
                    {item.foodName}
                  </div>
                  <div className="text-center w-12">{item.quantity}</div>

                  {/* Renderizando a unidade dinâmica que vem do JSON */}
                  <div className="text-center w-8 font-medium text-gray-500">
                    {item.unit}
                  </div>

                  <div className="text-right w-16 flex items-center justify-end gap-2">
                    {item.calories.toFixed(0)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFood(item._id);
                      }}
                      className="text-red-400 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between items-center mt-2">
            <button
              onClick={onAddFood}
              className="flex items-center gap-2 text-[#00674F] border-[1.5px] border-[#00674F] px-4 py-2 rounded-xl text-sm font-bold transition"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,103,79,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Incluir Refeição
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
