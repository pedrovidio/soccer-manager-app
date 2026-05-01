import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'auth_token';

let _memoryToken: string | null = null;
export function setMemoryToken(t: string | null) { _memoryToken = t; }
export function getMemoryToken() { return _memoryToken; }

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(async (config) => {
  const token = _memoryToken ?? await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`[httpClient] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, JSON.stringify(config.data));
  return config;
});

httpClient.interceptors.response.use(
  (res) => {
    console.log(`[httpClient] ${res.status} ${res.config.url}`, JSON.stringify(res.data));
    return res;
  },
  (error) => {
    const status = error.response?.status;
    console.log(`[httpClient] ERROR ${status} ${error.config?.url}`, JSON.stringify(error.response?.data));
    if (status === 401) {
      _memoryToken = null;
      SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);
