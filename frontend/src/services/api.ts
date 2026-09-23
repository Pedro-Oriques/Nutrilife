interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  secretQuestion: string;
  secretAnswer: string;
  role?: string;
}

interface RecoveryEmailData {
  email: string;
}

interface ResetPasswordData {
  email: string;
  secretAnswer: string;
  newPassword: string;
  confirmNewPassword: string;
}

const DEFAULT_API_URL = "https://api-bridgerton.qacoders.dev.br/api/";

function handleUnauthorized(status: number) {
  if (status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/";
  }
}

function buildApiUrl(path: string): string {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não definida");
  }

  baseUrl = baseUrl.replace(/\/+$/, "");

  if (!baseUrl.includes("/api")) {
    baseUrl = `${baseUrl}/api`;
  }

  return `${baseUrl}${path}`;
}

export async function loginRequest(data: LoginData) {
  const url = buildApiUrl("/auth/login");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao fazer o login");
  }

  return response.json();
}

export async function registerRequest(data: RegisterData) {
  const url = buildApiUrl("/user/register");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao realizar o cadastro");
  }

  return response.json();
}

export async function recoverEmailRequest(data: RecoveryEmailData) {
  const url = buildApiUrl("/recovery/checkEmail");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(responseData?.message || "Erro ao verificar e-mail");
  }
  return responseData;
}

export async function resetPasswordRequest(data: ResetPasswordData) {
  const url = buildApiUrl("/recovery/resetPassword");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData?.message || "Erro ao redefinir senha");
  }

  return responseData;
}

export interface ProfileData {
  birthDate: string;
  height: number;
  weight: number;
  gender: string;
  physicalActivity: string;
  goal: string;
  foodRestrictions: string[];
  otherFoods: string[];
  lgpdConsent: boolean;
}

export async function createProfileRequest(data: ProfileData, token: string) {
  const url = buildApiUrl("/profile/form");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao salvar o questionário");
  }

  return response.json();
}

export async function updateProfileRequest(data: ProfileData, token: string) {
  const url = buildApiUrl("/profile/form");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao atualizar o perfil");
  }

  return response.json();
}

export interface DailyTrackingResponse {
  date: string;
  totalCalories: number;
  dailyCalorieGoal: number;
  availableCalories: number;
  meals: Record<string, any[]>;
}

export async function getDailyTrackingRequest(
  token: string,
  date?: string,
): Promise<DailyTrackingResponse> {
  let url = buildApiUrl("/daily-tracking");

  if (date) {
    url += `?date=${date}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao buscar o diário de calorias");
  }

  return response.json();
}

export interface FoodItem {
  _id: string;
  name: string;
  caloriesPer100g: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface AddFoodEntryData {
  foodId: string;
  quantity: number;
  unit: string;
  mealSession: string;
  date: string;
}

export async function searchFoodRequest(
  query: string,
  token: string,
): Promise<FoodItem[]> {
  const url = buildApiUrl(`/food/search?query=${encodeURIComponent(query)}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao buscar alimentos.");
  }

  return response.json();
}

export async function addFoodEntryRequest(
  data: AddFoodEntryData,
  token: string,
) {
  const url = buildApiUrl("/daily-tracking");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao adicionar alimento.");
  }

  return response.json();
}

export async function getProfileRequest(token: string) {
  const url = buildApiUrl("/profile/formList");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404 || response.status === 204) {
    return null;
  }

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao verificar o perfil do usuário.");
  }

  const textResponse = await response.text();

  if (!textResponse) {
    return null;
  }

  try {
    return JSON.parse(textResponse);
  } catch (e) {
    return null;
  }
}

export async function removeFoodEntryRequest(entryId: string, token: string) {
  const url = buildApiUrl(`/daily-tracking/${entryId}`);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao remover alimento.");
  }

  return true;
}

export async function getRecommendedFoodsRequest(token: string) {
  const url = buildApiUrl("/food");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Erro ao carregar a lista de alimentos.",
    );
  }
  return response.json();
}

export async function getAllowedFoodsRequest(token: string) {
  const url = buildApiUrl("/food/allowed");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Erro ao carregar a lista de alimentos permitidos.",
    );
  }
  return response.json();
}

// Adicionar consumo de água
export const addWaterRequest = async (
  payload: { date: string; amountMl: number },
  token: string,
) => {
  const url = buildApiUrl("/water");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao registrar água.");
  }
  return response.json();
};

// Buscar água do dia
export const getWaterRequest = async (token: string, date: string) => {
  const url = buildApiUrl(`/water/${date}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null; // Se não achar o registro, retorna nulo sem quebrar
  }
  return response.json();
};
export async function getReportRequest(
  token: string,
  startDate: string,
  endDate: string,
  page: number,
  limit: number,
) {
  const query = new URLSearchParams({
    startDate,
    endDate,
    page: page.toString(),
    limit: limit.toString(),
  }).toString();

  const url = buildApiUrl(`/report?${query}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar o relatório.");
  }

  return response.json();
}
// --- REFEIÇÕES FAVORITAS ---

export async function getFavoriteMealsRequest(
  token: string,
  mealSession?: string,
) {
  const url = mealSession
    ? buildApiUrl(`/favorite-meals?mealSession=${mealSession}`)
    : buildApiUrl("/favorite-meals");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar refeições favoritas.");
  }

  return response.json();
}

export async function createFavoriteMealRequest(data: any, token: string) {
  const response = await fetch(buildApiUrl("/favorite-meals"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao criar refeição favorita.");
  }

  return response.json();
}

export async function applyFavoriteMealRequest(
  mealId: string,
  date: string,
  token: string,
) {
  const response = await fetch(buildApiUrl(`/favorite-meals/${mealId}/apply`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date }),
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao aplicar refeição favorita.");
  }

  return response.json();
}

export async function deleteFavoriteMealRequest(mealId: string, token: string) {
  const response = await fetch(buildApiUrl(`/favorite-meals/${mealId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao excluir refeição favorita.");
  }

  return true;
}

// --- PESO / WEIGHT TRACKING ---

export interface WeightEntry {
  _id: string;
  userId: string;
  weight: number;
  recordedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createWeightEntry(
  data: { weight: number },
  token: string,
): Promise<WeightEntry> {
  const url = buildApiUrl("/weight");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao registrar peso.");
  }

  return response.json();
}

export async function getWeightEntries(token: string): Promise<WeightEntry[]> {
  const url = buildApiUrl("/weight");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar registros de peso.");
  }

  return response.json();
}

export async function deleteWeightEntry(
  id: string,
  token: string,
): Promise<void> {
  const url = buildApiUrl(`/weight/${id}`);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao excluir registro de peso.");
  }
}

// --- GAMIFICAÇÃO ---

export interface GamificationSummary {
  rankingPosition: number | null;
  totalPoints: number;
  mealsCount: number;
  waterLiters: number;
}

export interface CalendarDay {
  date: string;
  points: number;
}

export interface RankingEntry {
  userId: string;
  fullName: string;
  totalPoints: number;
  position: number;
}

export interface RankingResponse {
  data: RankingEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface GamificationPointsRecord {
  _id: string;
  actionType: string;
  points: number;
  date: string;
}

export interface PointsPageResponse {
  data: GamificationPointsRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface ScoringRule {
  actionType: string;
  points: number;
  label: string;
  limitType: string;
}

export async function getGamificationSummary(token: string): Promise<GamificationSummary> {
  const url = buildApiUrl("/gamification/summary");
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao buscar resumo de gamificação.");
  }
  return response.json();
}

export async function getGamificationCalendar(token: string): Promise<CalendarDay[]> {
  const url = buildApiUrl("/gamification/calendar");
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao buscar calendário de gamificação.");
  }
  return response.json();
}

export async function getGamificationRanking(
  token: string,
  period: string,
  page: number,
  limit: number,
): Promise<RankingResponse> {
  const query = new URLSearchParams({
    period,
    page: page.toString(),
    limit: limit.toString(),
  }).toString();
  const url = buildApiUrl(`/gamification/ranking?${query}`);
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao buscar ranking.");
  }
  return response.json();
}

export async function getGamificationPoints(
  token: string,
  page: number,
  limit: number,
): Promise<PointsPageResponse> {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  }).toString();
  const url = buildApiUrl(`/gamification/points?${query}`);
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao buscar histórico de pontos.");
  }
  return response.json();
}

export async function getScoringRules(token: string): Promise<ScoringRule[]> {
  const url = buildApiUrl("/gamification/scoring-rules");
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao buscar regras de pontuação.");
  }
  return response.json();
}
