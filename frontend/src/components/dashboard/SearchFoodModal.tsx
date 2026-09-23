"use client";

import { useState, useEffect } from "react";
import {
  searchFoodRequest,
  addFoodEntryRequest,
  getAllowedFoodsRequest,
  getFavoriteMealsRequest,
  createFavoriteMealRequest,
  applyFavoriteMealRequest,
  deleteFavoriteMealRequest,
} from "@/services/api";
import ConfirmModal from "@/components/dashboard/ConfirmModal";

interface FoodItem {
  _id: string;
  name: string;
  caloriesPer100g: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface DraftFoodItem {
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FavoriteMeal {
  _id: string;
  title: string;
  mealSession: string;
  foods: DraftFoodItem[];
}

interface SearchFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: string;
  date: string;
  onSuccess: () => void;
}

export default function SearchFoodModal({
  isOpen,
  onClose,
  session,
  date,
  onSuccess,
}: SearchFoodModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "favorites">("search");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [unit, setUnit] = useState("g");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMeal[]>([]);
  const [isCreatingFavorite, setIsCreatingFavorite] = useState(false);
  const [newFavoriteTitle, setNewFavoriteTitle] = useState("");
  const [draftFoods, setDraftFoods] = useState<DraftFoodItem[]>([]);
  const [confirmDeleteMealId, setConfirmDeleteMealId] = useState<string | null>(null);

  const sessionMap: Record<string, string> = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    lanche_tarde: "Lanche",
    jantar: "Jantar",
  };

  const formattedSession =
    sessionMap[session] ||
    session.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  useEffect(() => {
    if (isOpen) {
      resetStates();
      fetchInitialData();
    }
  }, [isOpen, session]);

  useEffect(() => {
    if (selectedFood) {
      setTimeout(() => {
        const element = document.getElementById(
          `food-item-${selectedFood._id}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  }, [selectedFood]);

  const resetStates = () => {
    setQuery("");
    setSelectedFood(null);
    setQuantity("");
    setError("");
    setActiveTab("search");
    setIsCreatingFavorite(false);
    setDraftFoods([]);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const [foodData, favData] = await Promise.all([
        getAllowedFoodsRequest(token).catch(() => []),
        getFavoriteMealsRequest(token, session).catch(() => []),
      ]);
      setResults(foodData);
      setFavoriteMeals(favData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados iniciais.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleFood = (food: FoodItem) => {
    if (selectedFood?._id === food._id) {
      setSelectedFood(null);
      setQuantity("");
    } else {
      setSelectedFood(food);
      setQuantity("");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSelectedFood(null);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      if (query.trim().length === 0) {
        const data = await getAllowedFoodsRequest(token);
        setResults(data);
      } else {
        if (query.length < 3) {
          setLoading(false);
          return setError("Digite pelo menos 3 caracteres.");
        }
        const data = await searchFoodRequest(query, token);
        setResults(data);
        if (data.length === 0)
          setError("Nenhum alimento compatível encontrado.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCalories = (food: FoodItem, qty: number, un: string) => {
    let grams =
      un === "kg" || un === "L" ? qty * 1000 : un === "mg" ? qty / 1000 : qty;
    return (food.caloriesPer100g / 100) * grams;
  };

  // Format large gram values: >= 1000g → kg with 1 decimal
  const fmtG = (val: number) =>
    val >= 1000 ? `${(val / 1000).toFixed(1)}kg` : `${val.toFixed(0)}g`;

  // Format kcal: >= 10000 → show as integer, else normal
  const fmtKcal = (val: number) =>
    val >= 10000 ? `${Math.round(val / 100) / 10}k` : val.toFixed(0);

  // Nova função para calcular os macronutrientes com base na quantidade
  const calculateMacro = (
    macroValue: number | undefined,
    qty: number,
    un: string,
  ) => {
    if (!macroValue) return 0;
    let grams =
      un === "kg" || un === "L" ? qty * 1000 : un === "mg" ? qty / 1000 : qty;
    return (macroValue / 100) * grams;
  };

  const handleAddFood = async () => {
    if (!selectedFood || !quantity) return;

    if (isCreatingFavorite) {
      const newDraftItem: DraftFoodItem = {
        foodId: selectedFood._id,
        name: selectedFood.name,
        quantity: Number(quantity),
        unit,
        calories: calculateCalories(selectedFood, Number(quantity), unit),
        protein: calculateMacro(selectedFood.protein, Number(quantity), unit),
        carbs: calculateMacro(selectedFood.carbs, Number(quantity), unit),
        fat: calculateMacro(selectedFood.fat, Number(quantity), unit),
      };
      setDraftFoods([...draftFoods, newDraftItem]);
      setSelectedFood(null);
      setQuantity("");
      setQuery("");
      return;
    }

    setSubmitLoading(true);
    setError("");
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      await addFoodEntryRequest(
        {
          foodId: selectedFood._id,
          quantity: Number(quantity),
          unit: unit,
          mealSession: session,
          date: date,
        },
        token,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartCreatingFavorite = () => {
    const nextNumber = favoriteMeals.length + 1;
    setNewFavoriteTitle(
      `${formattedSession} #${nextNumber.toString().padStart(2, "0")}`,
    );
    setDraftFoods([]);
    setQuery("");
    setSelectedFood(null);
    setIsCreatingFavorite(true);
  };

  const handleSaveFavoriteMeal = async () => {
    if (draftFoods.length === 0)
      return setError("Adicione pelo menos um alimento à refeição.");
    if (!newFavoriteTitle.trim())
      return setError("O título da refeição é obrigatório.");

    setSubmitLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const payload = {
        title: newFavoriteTitle,
        mealSession: session,
        foods: draftFoods,
      };

      await createFavoriteMealRequest(payload, token);
      await fetchInitialData();
      setIsCreatingFavorite(false);
      setDraftFoods([]);
      setActiveTab("favorites");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar refeição favorita.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApplyFavoriteMeal = async (mealId: string) => {
    setSubmitLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      await applyFavoriteMealRequest(mealId, date, token);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao aplicar refeição favorita no diário.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteFavorite = async (mealId: string) => {
    setConfirmDeleteMealId(mealId);
  };

  const doDeleteFavorite = async (mealId: string) => {
    setConfirmDeleteMealId(null);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      await deleteFavoriteMealRequest(mealId, token);
      await fetchInitialData();
    } catch (err: any) {
      setError(err.message || "Erro ao excluir refeição.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-gray-100 rounded-2xl w-full max-w-xl h-[85vh] max-h-[750px] flex flex-col shadow-2xl relative overflow-hidden">
        <header className="flex-none flex flex-col px-8 pt-6 border-b border-gray-200 bg-white z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-[24px] font-semibold text-[#002017]">
                {formattedSession}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#002017] text-2xl transition"
            >
              ✕
            </button>
          </div>

          <div className="flex w-full mt-2">
            <button
              onClick={() => {
                setActiveTab("search");
                setIsCreatingFavorite(false);
              }}
              className={`flex-1 text-center pb-3 font-semibold text-[16px] transition-all border-b-[3px] ${
                activeTab === "search" && !isCreatingFavorite
                  ? "border-[#008F6F] text-[#002017]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Buscar Alimentos
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 text-center pb-3 font-semibold text-[16px] transition-all border-b-[3px] ${
                activeTab === "favorites" || isCreatingFavorite
                  ? "border-[#008F6F] text-[#002017]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Refeições Prontas
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-100 min-h-0 relative scroll-smooth custom-scroll">
          {error && (
            <div className="bg-red-100 border border-red-300 text-[#C94A31] px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          {(activeTab === "search" || isCreatingFavorite) && (
            <div className="animate-[fadeIn_.25s_ease]">
              <form onSubmit={handleSearch} className="flex mb-6">
                <div className="flex items-center w-full border border-[#008F6F] rounded-full p-1.5">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pesquisar alimentos..."
                    className="search-input-transparent flex-1 px-4 py-2 outline-none text-[#000000] text-[16px] font-normal placeholder-gray-400 bg-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[32px] h-[32px] flex items-center justify-center bg-[#00B890] text-[#002017] rounded-full hover:bg-[#008F6F] transition disabled:opacity-70 cursor-pointer shrink-0"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
              </form>

              <div className="text-[34px] font-semibold text-[#000000] mb-4">
                Lista de alimentos
              </div>

              <div className="flex flex-col gap-3 pb-4">
                {results.length === 0 && !loading && query.length === 0 && (
                  <p className="text-[#002017] opacity-60 text-[16px] font-normal italic">
                    Nenhum resultado para exibir.
                  </p>
                )}
                {results.map((food) => (
                  <div key={food._id} id={`food-item-${food._id}`}>
                    <div
                      onClick={() => toggleFood(food)}
                      className={`cursor-pointer rounded-xl px-4 py-4 flex items-center justify-between transition-all shadow-sm
                        ${
                          selectedFood?._id === food._id
                            ? "bg-[#008F6F] rounded-b-none"
                            : "bg-[#00674F] hover:bg-[#004f3d]"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-[32px] h-[32px] flex items-center justify-center rounded-md font-semibold text-[20px] shrink-0"
                          style={{ backgroundColor: selectedFood?._id === food._id ? "#007a5e" : "#005a42", color: "rgba(255,255,255,0.7)" }}>
                          {food.name.charAt(0)}
                        </div>
                        <p className="font-semibold text-[20px] text-[#FAFEFC] tracking-[0.0015em]">
                          {food.name}
                        </p>
                      </div>
                      <div className="text-[20px] font-bold leading-none w-6 text-center text-[#E9E7E7]">
                        {selectedFood?._id === food._id ? "−" : "+"}
                      </div>
                    </div>

                    {selectedFood?._id === food._id && (
                      <div className="bg-[#00B890] rounded-b-xl px-5 py-5 text-white animate-[fadeIn_.2s_ease-in-out] shadow-sm relative z-0">
                        <div className="text-[24px] font-semibold text-[#F4F4F4] mb-4">
                          Adicionar porção
                        </div>

                        <div className="text-[20px] font-semibold text-[#F4F4F4] mb-2 tracking-[0.0015em]">
                          Quantidade
                        </div>

                        <div className="flex gap-3 items-center mb-5">
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(Number(e.target.value))
                            }
                            placeholder="000"
                            className="flex-1 rounded-full px-4 py-2 text-[#000000] text-[16px] font-normal border border-[#008F6F] bg-[#FAFEFC] outline-none focus:ring-2 focus:ring-[#00674F]"
                            min="1"
                          />
                          <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="rounded-full px-4 py-2 text-[#000000] text-[16px] font-normal border border-[#008F6F] bg-[#FAFEFC] outline-none shadow-sm cursor-pointer"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          {/* --- NOVO: BLOCO DINÂMICO DE MACRONUTRIENTES --- */}
                          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#002017] px-3 py-1.5 rounded-lg tracking-[0.005em] min-w-0 overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
                            <span className="font-bold whitespace-nowrap">
                              {quantity ? fmtKcal(calculateCalories(food, Number(quantity), unit)) : "0"} kcal
                            </span>
                            <span className="opacity-50">|</span>
                            <span className="whitespace-nowrap">C: {quantity ? fmtG(calculateMacro(food.carbs, Number(quantity), unit)) : "0g"}</span>
                            <span className="opacity-50">•</span>
                            <span className="whitespace-nowrap">P: {quantity ? fmtG(calculateMacro(food.protein, Number(quantity), unit)) : "0g"}</span>
                            <span className="opacity-50">•</span>
                            <span className="whitespace-nowrap">G: {quantity ? fmtG(calculateMacro(food.fat, Number(quantity), unit)) : "0g"}</span>
                          </div>

                          <button
                            onClick={handleAddFood}
                            disabled={!quantity || submitLoading}
                            className="w-[160px] h-[36px] bg-[#002017] text-[#F4F4F4] rounded-lg text-[16px] font-normal tracking-[0.005em] hover:bg-black disabled:opacity-50 transition cursor-pointer shadow-md flex items-center justify-center shrink-0"
                          >
                            {isCreatingFavorite
                              ? "Adicionar a Refeição"
                              : submitLoading
                                ? "Salvando..."
                                : "Salvar"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "favorites" && !isCreatingFavorite && (
            <div className="animate-[fadeIn_.25s_ease] flex flex-col h-full">
              <button
                onClick={handleStartCreatingFavorite}
                className="w-full border border-dashed border-[#008F6F] text-[#00674F] font-semibold text-[20px] py-4 rounded-2xl mb-6 hover:bg-[#008F6F]/10 transition cursor-pointer flex justify-center items-center gap-2 shadow-sm"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <span className="text-2xl leading-none mb-1">+</span> Criar Nova
                Refeição Pronta
              </button>

              {favoriteMeals.length === 0 ? (
                <div className="text-center text-[#002017] opacity-60 mt-10 text-[16px] font-normal bg-white p-6 rounded-2xl shadow-sm border border-[#F4F4F4]">
                  Você ainda não possui refeições salvas para o{" "}
                  {formattedSession}.
                </div>
              ) : (
                <ul className="space-y-4 pb-4">
                  {favoriteMeals.map((meal) => (
                    <li
                      key={meal._id}
                      className="bg-white border border-[#008F6F] rounded-2xl p-5 shadow-sm group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-[20px] text-[#002017]">
                            {meal.title}
                          </h3>
                          <p className="text-[16px] text-[#002017] opacity-70 font-normal mt-1">
                            {meal.foods.length} alimentos • Total:{" "}
                            {meal.foods
                              .reduce((acc, f) => acc + f.calories, 0)
                              .toFixed(0)}{" "}
                            kcal
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteFavorite(meal._id)}
                          className="text-[#C94A31] hover:text-red-700 text-[16px] font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>

                      <div className="rounded-xl p-3 mb-5 max-h-[100px] overflow-y-auto border border-gray-100" style={{ backgroundColor: "var(--bg-input)" }}>
                        <ul className="text-[16px] text-[#002017] space-y-1.5 font-normal">
                          {meal.foods.map((f, i) => (
                            <li key={i}>
                              • {f.quantity}
                              {f.unit} - {f.name}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleApplyFavoriteMeal(meal._id)}
                        disabled={submitLoading}
                        className="w-full bg-[#00674F] text-[#FAFEFC] py-3 rounded-lg font-normal text-[16px] hover:bg-[#004f3d] transition shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {submitLoading
                          ? "A adicionar..."
                          : "Adicionar Refeição"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {isCreatingFavorite && (
          <div className="flex-none px-8 py-5 border-t border-gray-200 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.04)] z-20">
            <div className="flex justify-between items-end mb-4 border-b border-[#F4F4F4] pb-3 gap-4">
              <h3 className="text-[20px] font-semibold text-[#000000] shrink-0 pb-1">
                Itens da Refeição
              </h3>

              <div className="flex flex-1 max-w-[280px] items-center gap-2">
                <label className="text-[15px] font-semibold text-[#002017] whitespace-nowrap">
                  Nome:
                </label>
                <input
                  type="text"
                  value={newFavoriteTitle}
                  onChange={(e) => setNewFavoriteTitle(e.target.value)}
                  placeholder="Nome da Refeição"
                  className="w-full border border-[#008F6F] rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#00B890] outline-none text-[#002017] font-semibold bg-[#FAFEFC] text-[15px]"
                />
              </div>
            </div>

            {draftFoods.length === 0 ? (
              <p className="text-[15px] text-[#002017] opacity-60 font-normal text-center pb-3">
                Pesquise e adicione alimentos na lista acima.
              </p>
            ) : (
              <div className="max-h-[130px] overflow-y-auto mb-4 pr-2">
                <ul className="space-y-2">
                  {draftFoods.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center text-[15px] font-normal text-[#002017] bg-[#F4F4F4] px-4 py-2 rounded-xl shadow-sm"
                    >
                      <span>
                        {item.quantity}
                        {item.unit} - {item.name}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-[#008F6F] font-bold">
                          {item.calories.toFixed(0)} kcal
                        </span>
                        <button
                          onClick={() =>
                            setDraftFoods(
                              draftFoods.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-[#C94A31] hover:text-red-700 font-bold text-lg leading-none pb-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setIsCreatingFavorite(false)}
                className="flex-1 py-2.5 text-[16px] text-[#002017] font-normal border border-[#008F6F] rounded-lg hover:bg-[#F4F4F4] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFavoriteMeal}
                disabled={
                  submitLoading ||
                  draftFoods.length === 0 ||
                  !newFavoriteTitle.trim()
                }
                className="flex-1 bg-[#00674F] text-[#FAFEFC] font-normal text-[16px] py-2.5 rounded-lg hover:bg-[#004f3d] transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {submitLoading ? "A guardar..." : "Salvar Refeição"}
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmDeleteMealId && (
        <ConfirmModal
          title="Excluir refeição"
          message="Deseja realmente excluir esta refeição salva?"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={() => doDeleteFavorite(confirmDeleteMealId)}
          onCancel={() => setConfirmDeleteMealId(null)}
        />
      )}
    </div>
  );
}
