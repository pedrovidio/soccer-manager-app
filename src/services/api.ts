import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginInput,
  AuthResponse,
  RegisterAthleteInput,
  Athlete,
  SubmitAssessmentInput,
  Match,
  MatchListItem,
  CreateMatchInput,
  MatchTeam,
  Group,
  CreateGroupInput,
  GroupBalance,
  GroupInvite,
  Notification,
  AthleteDashboard,
  RegisterRatingInput,
  AvailableCourt,
  MatchType,
} from '../types';

const TOKEN_KEY = '@soccer_manager:token';

export const api = axios.create({
  baseURL: 'http://192.168.1.23:3333',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: injeta o token JWT ──────────────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: trata erros globais ───────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string; errors?: { field: string; message: string }[] }>) => {
    const data = error.response?.data;
    const message =
      data?.error ??
      data?.errors?.map((e) => e.message).join(', ') ??
      'Erro inesperado. Tente novamente.';
    return Promise.reject(new Error(message));
  },
);

// ─── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  save: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  remove: () => AsyncStorage.removeItem(TOKEN_KEY),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  socialLogin: (data: { provider: string; token: string }) =>
    api.post<AuthResponse>('/auth/social', data).then((r) => r.data),
};

// ─── Athlete ──────────────────────────────────────────────────────────────────
export const athleteApi = {
  register: (data: RegisterAthleteInput) =>
    api.post<Athlete>('/athletes', data).then((r) => r.data),

  updateLocation: (athleteId: string, latitude: number, longitude: number) =>
    api.patch(`/athletes/${athleteId}/location`, { latitude, longitude }).then((r) => r.data),

  uploadPhoto: (athleteId: string, formData: FormData) =>
    api.patch<{ photoUrl: string }>(`/athletes/${athleteId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  dashboard: (athleteId: string) =>
    api.get<AthleteDashboard>(`/athletes/${athleteId}/dashboard`).then((r) => r.data),

  history: (athleteId: string, params?: { page?: number; pageSize?: number; status?: string; type?: MatchType }) =>
    api.get(`/athletes/${athleteId}/history`, { params }).then((r) => r.data),

  invites: (athleteId: string) =>
    api.get<GroupInvite[]>(`/athletes/${athleteId}/invites`).then((r) => r.data),

  notifications: (athleteId: string) =>
    api.get<{ notifications: Notification[]; unreadCount: number }>(`/athletes/${athleteId}/notifications`).then((r) => r.data.notifications),
};

// ─── Assessment ───────────────────────────────────────────────────────────────
export const assessmentApi = {
  submit: (athleteId: string, data: SubmitAssessmentInput) =>
    api.post(`/athletes/${athleteId}/assessment`, data).then((r) => r.data),
};

// ─── Match ────────────────────────────────────────────────────────────────────
export const matchApi = {
  create: (data: CreateMatchInput) =>
    api.post<Match>('/matches', data).then((r) => r.data),

  listByGroup: (groupId: string) =>
    api.get<MatchListItem[]>(`/groups/${groupId}/matches`).then((r) => r.data),

  respondInvite: (inviteId: string, athleteId: string, accept: boolean) =>
    api.patch(`/match-invites/${inviteId}/respond`, { athleteId, accept }).then((r) => r.data),

  openVacancies: (matchId: string, adminId: string) =>
    api.post(`/matches/${matchId}/open-vacancies`, { adminId }).then((r) => r.data),

  confirmPresence: (matchId: string, athleteId: string) =>
    api.post(`/matches/${matchId}/confirm-presence`, { athleteId }).then((r) => r.data),

  checkIn: (matchId: string, athleteId: string) =>
    api.post(`/matches/${matchId}/check-in`, { athleteId }).then((r) => r.data),

  registerRating: (matchId: string, data: RegisterRatingInput) =>
    api.post(`/matches/${matchId}/ratings`, data).then((r) => r.data),

  matchmaking: (matchId: string, teamsCount: number) =>
    api.post<{ teams: MatchTeam[] }>(`/matches/${matchId}/matchmaking`, { teamsCount }).then((r) => r.data),

  cancel: (matchId: string, adminId: string, reason?: string) =>
    api.patch(`/matches/${matchId}/cancel`, { adminId, reason }).then((r) => r.data),

  registerScore: (matchId: string, registeredBy: string, scores: { teamName: string; goals: number }[]) =>
    api.post(`/matches/${matchId}/score`, { registeredBy, scores }).then((r) => r.data),

  groupHistory: (groupId: string, requesterId: string, params?: { page?: number; pageSize?: number }) =>
    api.get(`/groups/${groupId}/history`, { params: { requesterId, ...params } }).then((r) => r.data),
};

// ─── Group ────────────────────────────────────────────────────────────────────
export const groupApi = {
  create: (data: CreateGroupInput) =>
    api.post<Group>('/groups', data).then((r) => r.data),

  searchAthletes: (params: { name?: string; cpf?: string; email?: string }) =>
    api.get<Athlete[]>('/groups/athletes/search', { params }).then((r) => r.data),

  invite: (groupId: string, adminId: string, athleteId: string) =>
    api.post(`/groups/${groupId}/invites`, { adminId, athleteId }).then((r) => r.data),

  respondInvite: (inviteId: string, athleteId: string, accept: boolean) =>
    api.patch(`/invites/${inviteId}/respond`, { athleteId, accept }).then((r) => r.data),

  balance: (groupId: string, requesterId: string) =>
    api.get<GroupBalance>(`/groups/${groupId}/balance`, { params: { requesterId } }).then((r) => r.data),

  uploadPhoto: (groupId: string, adminId: string, formData: FormData) =>
    api.patch<{ photoUrl: string }>(`/groups/${groupId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  delegateAdmin: (groupId: string, requesterId: string, delegatedTo: string, isPermanent: boolean, matchesLimit?: number) =>
    api.post(`/groups/${groupId}/admin/delegate`, { requesterId, delegatedTo, isPermanent, matchesLimit }).then((r) => r.data),

  revokeAdmin: (groupId: string, requesterId: string, delegatedTo: string) =>
    api.delete(`/groups/${groupId}/admin/delegate`, { data: { requesterId, delegatedTo } }).then((r) => r.data),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  markAsRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`).then((r) => r.data),
};

// ─── Courts ───────────────────────────────────────────────────────────────────
export const courtApi = {
  listAvailable: (date: string, type?: MatchType) =>
    api.get<AvailableCourt[]>('/courts/available', { params: { date, type } }).then((r) => r.data),
};
