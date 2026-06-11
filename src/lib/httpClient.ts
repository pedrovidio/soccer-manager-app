import axios from 'axios';
import { getSupabaseAccessToken } from './supabase';
import { appLogger } from './logger';

export const TOKEN_KEY = 'auth_token';

let _memoryToken: string | null = null;
let _onUnauthorized: (() => void) | null = null;
export function setMemoryToken(t: string | null) { _memoryToken = t; }
export function getMemoryToken() { return _memoryToken; }
export function setUnauthorizedHandler(handler: (() => void) | null) { _onUnauthorized = handler; }

function isCurrentAthleteMissing(error: any): boolean {
  const status = error.response?.status;
  const code = error.response?.data?.code;
  const url = String(error.config?.url ?? '');
  return status === 404 && code === 'ENTITY_NOT_FOUND' && /^\/athletes\/[^/]+(?:\/|$)/.test(url);
}

function redactSensitiveValues(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redactSensitiveValues);

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      /password|token|secret|authorization|key/i.test(key) ? '[REDACTED]' : redactSensitiveValues(nestedValue),
    ]),
  );
}

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 30_000,
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
    data: redactSensitiveValues(config.data),
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
    const logData = {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status,
      durationMs,
      requestId: error.response?.headers?.['x-request-id'],
      response: error.response?.data,
    };
    if (status === 401) {
      appLogger.warn('[HTTP] <- unauthorized', logData);
    } else if (typeof status === 'number' && status < 500) {
      appLogger.warn('[HTTP] <- rejected', logData);
    } else {
      appLogger.error('[HTTP] <- error', error, logData);
    }
    if (status === 401 || isCurrentAthleteMissing(error)) {
      _memoryToken = null;
      _onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
