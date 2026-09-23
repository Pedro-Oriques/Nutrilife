/**
 * API Configuration
 * Central place for API endpoints and configuration
 */

export const API_CONFIG = {
  // Base URL from environment variable or default (NEXT_PUBLIC_* é definida em tempo de build no Docker)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ,

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/user/register",
      RECOVERY_EMAIL: "/recovery/checkEmail",
      RESET_PASSWORD: "/recovery/resetPassword",
    },
    PROFILE: {
      CREATE: "/profile/form",
      GET: "/profile/formList",
    },
    DAILY_TRACKING: {
      GET: "/daily-tracking",
      ADD_FOOD: "/daily-tracking",
      REMOVE_FOOD: (entryId: string) => `/daily-tracking/${entryId}`,
    },
    FOOD: {
      SEARCH: (query: string) => `/food/search?query=${encodeURIComponent(query)}`,
      GET_RECOMMENDED: "/food",
      GET_ALLOWED: "/food/allowed",
    },
  },

  // Default headers
  HEADERS: {
    "Content-Type": "application/json",
  },
};

/**
 * Build full API URL from path
 */
export function buildApiUrl(path: string): string {
  let baseUrl = API_CONFIG.BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não definida");
  }

  baseUrl = baseUrl.replace(/\/+$/, "");

  if (!baseUrl.includes("/api")) {
    baseUrl = `${baseUrl}/api`;
  }

  return `${baseUrl}${path}`;
}
