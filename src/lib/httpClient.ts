import axios from 'axios';
import { getSupabaseAccessToken } from './supabase';
import { appLogger } from './logger';

export const TOKEN_KEY = 'auth_token';

let _memoryToken: string | null = null;
let _onUnauthorized: (() => void) | null = null;
export function setMemoryToken(t: string | null) { _memoryToken = t; }
export function getMemoryToken() { return _memoryToken; }
export function setUnauthorizedHandler(handler: (() => void) | null) { _onUnauthorized = handler; }

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(async (config) => {
  (config as any).metadata = { startedAt: Date.now() };
  const token = _memoryToken ?? await getSupabaseAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  appLogger.debug('[HTTP] -> request', {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
    params: config.params,
    data: config.data,
    hasAuth: !!token,
  });
  return config;
});

httpClient.interceptors.response.use(
  (res) => {
    const startedAt = (res.config as any).metadata?.startedAt;
    const durationMs = typeof startedAt === 'number' ? Date.now() - startedAt : undefined;
    appLogger.debug('[HTTP] <- response', {
      method: res.config.method?.toUpperCase(),
      url: res.config.url,
      status: res.status,
      durationMs,
      requestId: res.headers?.['x-request-id'],
    });
    return res;
  },
  (error) => {
    const status = error.response?.status;
    const startedAt = (error.config as any)?.metadata?.startedAt;
    const durationMs = typeof startedAt === 'number' ? Date.now() - startedAt : undefined;
    appLogger.error('[HTTP] <- error', error, {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status,
      durationMs,
      requestId: error.response?.headers?.['x-request-id'],
      response: error.response?.data,
    });
    if (status === 401) {
      _memoryToken = null;
      _onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
