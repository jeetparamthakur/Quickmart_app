import * as SecureStore from 'expo-secure-store';
import { API_URL, USE_MOCK } from '@/constants/api';
import { normalizeError, type AppError } from './errors';

const TOKEN_KEY = 'auth-token';
const REFRESH_KEY = 'auth-refresh-token';

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredTokens(token: string, refreshToken?: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  if (refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearStoredTokens() {
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {});
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token: string; refreshToken: string };
    await setStoredTokens(data.token, data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  body?: unknown;
}

export class ApiClientError extends Error {
  appError: AppError;
  constructor(appError: AppError) {
    super(appError.message);
    this.appError = appError;
    this.name = 'ApiClientError';
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (USE_MOCK) {
    throw new Error('Mock mode: use service layer mock fallback');
  }

  const { skipAuth, body, headers, ...rest } = options;
  let token = skipAuth ? null : await getStoredToken();

  const doFetch = async (authToken: string | null) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      return await fetch(`${API_URL}${path}`, {
        ...rest,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  let response = await doFetch(token);

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      response = await doFetch(newToken);
    } else {
      onUnauthorized?.();
      throw new ApiClientError(
        normalizeError({ errorCode: 'SESSION_EXPIRED', message: 'Session expired' }, 401),
      );
    }
  }

  if (!response.ok) {
    let errorBody: { message?: string; errorCode?: string } = {};
    try {
      errorBody = await response.json();
    } catch {
      // ignore
    }
    throw new ApiClientError(normalizeError(errorBody, response.status));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
