import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

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

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/social', '/athletes'];

httpClient.interceptors.request.use(async (config) => {
  const path = config.url ?? '';
  const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((publicPath) => path === publicPath);
  if (!isPublicAuthRequest) {
    const token = _memoryToken ?? await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      _memoryToken = null;
      SecureStore.deleteItemAsync(TOKEN_KEY);
      _onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
