import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setMemoryToken, setUnauthorizedHandler } from '@lib/httpClient';
import { AthletePlan, AuthState } from './authTypes';
import { authApi } from './services/authApi';
import { queryClient } from '@lib/queryClient';
import { supabase } from '@lib/supabase';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setAssessmentCompleted: () => void;
  setPlan: (plan: AthletePlan, planExpiresAt: string | null) => void;
  isHydrated: boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  athleteId: null,
  name: null,
  plan: 'FREE',
  planExpiresAt: null,
  hasCompletedAssessment: false,
  isAuthenticated: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const [{ data }, name, assessment] = await Promise.all([
        supabase.auth.getSession(),
        SecureStore.getItemAsync('athlete_name'),
        SecureStore.getItemAsync('has_assessment'),
      ]);
      const token = data.session?.access_token ?? null;
      const athleteId = data.session?.user.id ?? null;
      if (!token) {
        set({ isHydrated: true });
        return;
      }
      setMemoryToken(token);
      set({
        token,
        athleteId,
        name: data.session?.user.user_metadata?.['name'] ?? name,
        plan: 'FREE',
        planExpiresAt: null,
        hasCompletedAssessment: assessment === 'true',
        isAuthenticated: true,
        isHydrated: true,
      });
    } catch (e) {
      set({ isHydrated: true });
    }
  },

  login: async (email, password) => {
    const { token, athleteId, name, plan, planExpiresAt } = await authApi.login({ email, password });
    setMemoryToken(token);
    await Promise.all([
      SecureStore.setItemAsync('athlete_id', athleteId),
      SecureStore.setItemAsync('athlete_name', name),
      SecureStore.setItemAsync('has_assessment', 'false'),
    ]);
    set({
      token,
      athleteId,
      name,
      plan,
      planExpiresAt,
      hasCompletedAssessment: false,
      isAuthenticated: true,
    });
  },

  setAssessmentCompleted: () => {
    SecureStore.setItemAsync('has_assessment', 'true');
    set({ hasCompletedAssessment: true });
  },

  setPlan: (plan, planExpiresAt) => {
    set({ plan, planExpiresAt });
  },

  logout: async () => {
    try {
      const { useThemeStore } = require('../../ui/tokens/theme');
      useThemeStore.getState().setTheme('dark');
    } catch (e) {
      // ignore
    }
    await authApi.logout();
    setMemoryToken(null);
    await Promise.all([
      SecureStore.deleteItemAsync('athlete_id'),
      SecureStore.deleteItemAsync('athlete_name'),
      SecureStore.deleteItemAsync('has_assessment'),
    ]);
    queryClient.clear();
    set({
      token: null,
      athleteId: null,
      name: null,
      plan: 'FREE',
      planExpiresAt: null,
      hasCompletedAssessment: false,
      isAuthenticated: false,
    });
  },
}));

setUnauthorizedHandler(() => {
  try {
    const { useThemeStore } = require('../../ui/tokens/theme');
    useThemeStore.getState().setTheme('dark');
  } catch (e) {
    // ignore
  }
  setMemoryToken(null);
  void supabase.auth.signOut();
  void Promise.all([
    SecureStore.deleteItemAsync('athlete_id'),
    SecureStore.deleteItemAsync('athlete_name'),
    SecureStore.deleteItemAsync('has_assessment'),
  ]);
  queryClient.clear();
  useAuthStore.setState({
    token: null,
    athleteId: null,
    name: null,
    plan: 'FREE',
    planExpiresAt: null,
    hasCompletedAssessment: false,
    isAuthenticated: false,
  });
});
