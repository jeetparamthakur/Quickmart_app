import * as SecureStore from 'expo-secure-store';
import { API_URL, USE_MOCK } from '@/constants/api';
import { normalizeError, type AppError } from './errors';

const TOKEN_KEY = 'auth-token';
const REFRESH_KEY = 'auth-refresh-token';

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
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

function logApi(level: 'log' | 'error', message: string, extra?: unknown) {
  if (!__DEV__) return;
  if (level === 'error') {
    console.error(message, extra ?? '');
    return;
  }
  console.log(message, extra ?? '');
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
    const json = (await res.json().catch(() => null)) as
      | { token?: string; refreshToken?: string; data?: { token?: string; refreshToken?: string } }
      | null;
    if (!res.ok) {
      logApi('error', `[API] refresh failed ${res.status}`, json);
      return null;
    }
    const data = json?.data ?? json;
    if (!data?.token) {
      logApi('error', '[API] refresh returned no token', json);
      return null;
    }
    await setStoredTokens(data.token, data.refreshToken);
    return data.token;
  } catch (error) {
    logApi('error', '[API] refresh token failed', error);
    return null;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
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
  const method = (rest.method ?? 'GET').toString().toUpperCase();
  const url = `${API_URL}${path}`;
  let token = skipAuth ? null : await getStoredToken();

  logApi('log', `[API] → ${method} ${url}`, body);

  const doFetch = async (authToken: string | null) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      return await fetch(url, {
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

  let response: Response;
  try {
    response = await doFetch(token);
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const appError = normalizeError(
      {
        errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'The request is taking longer than expected. Please try again.'
          : `Cannot reach API at ${url}. Is the backend running, and is the device using your computer's IP (not localhost)?`,
      },
      isTimeout ? 408 : 0,
    );
    const wrapped = new ApiClientError(appError);
    logApi('error', `[API] ✗ ${method} ${url} network failure`, error);
    throw wrapped;
  }

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      try {
        response = await doFetch(newToken);
      } catch (error) {
        logApi('error', `[API] ✗ ${method} ${url} retry after refresh failed`, error);
        throw new ApiClientError(normalizeError({ errorCode: 'NETWORK_ERROR' }, 0));
      }
    } else {
      onUnauthorized?.();
      const expired = new ApiClientError(
        normalizeError({ errorCode: 'SESSION_EXPIRED', message: 'Session expired' }, 401),
      );
      logApi('error', `[API] ✗ ${method} ${url} 401 session expired`, expired);
      throw expired;
    }
  }

  if (!response.ok) {
    let errorBody: { message?: string; errorCode?: string } = {};
    try {
      errorBody = await response.json();
    } catch {
      // ignore
    }
    const appError = normalizeError(errorBody, response.status);
    const wrapped = new ApiClientError(appError);
    logApi(
      'error',
      `[API] ✗ ${method} ${url} ${response.status} ${appError.code}: ${appError.message}`,
      errorBody,
    );
    throw wrapped;
  }

  if (response.status === 204) {
    logApi('log', `[API] ← ${method} ${url} 204`);
    return undefined as T;
  }
  const data = (await response.json()) as T;
  logApi('log', `[API] ← ${method} ${url} ${response.status}`, data);
  return data;
}
