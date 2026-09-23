/**
 * API Client
 * Centralized HTTP client for API requests with error handling and auth
 */

import { buildApiUrl } from "@/config/api";

export interface ApiRequestOptions extends RequestInit {
  skipBaseUrl?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

/**
 * Make an API request with automatic URL building and error handling
 */
export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { skipBaseUrl = false, ...fetchOptions } = options;

  const url = skipBaseUrl ? path : buildApiUrl(path);

  const response = await fetch(url, fetchOptions);

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorData = null;

    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use default error message
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      data: errorData,
    };

    throw error;
  }

  // Handle empty responses
  if (response.status === 204) {
    return null as T;
  }

  // Parse and return JSON response
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text() as Promise<T>;
}

/**
 * GET request helper
 */
export function apiGet<T = any>(
  path: string,
  headers: Record<string, string> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    method: "GET",
    headers,
  });
}

/**
 * POST request helper
 */
export function apiPost<T = any>(
  path: string,
  body: any,
  headers: Record<string, string> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T = any>(
  path: string,
  headers: Record<string, string> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    method: "DELETE",
    headers,
  });
}

/**
 * Create authorization header with token
 */
export function getAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
