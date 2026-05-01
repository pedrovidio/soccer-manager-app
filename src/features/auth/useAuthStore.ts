import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, setMemoryToken } from '../../lib/httpClient';
import { AuthState } from './authTypes';
import { authApi } from './services/authApi';
import { queryClient } from '../../lib/queryClient';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setAssessmentCompleted: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  athleteId: null,
  name: null,
  hasCompletedAssessment: false,
  isAuthenticated: false,

  hydrate: async () => {
    const [token, athleteId, name, assessment] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync('athlete_id'),
      SecureStore.getItemAsync('athlete_name'),
      SecureStore.getItemAsync('has_assessment'),
    ]);
    if (!token) return;
    setMemoryToken(token);
    set({
      token,
      athleteId,
      name,
      hasCompletedAssessment: assessment === 'true',
      isAuthenticated: true,
    });
  },

  login: async (email, password) => {
    const { token, athleteId, name } = await authApi.login({ email, password });
    setMemoryToken(token);
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync('athlete_id', athleteId),
      SecureStore.setItemAsync('athlete_name', name),
      SecureStore.setItemAsync('has_assessment', 'false'),
    ]);
    set({
      token,
      athleteId,
      name,
      hasCompletedAssessment: false,
      isAuthenticated: true,
    });
  },

  setAssessmentCompleted: () => {
    SecureStore.setItemAsync('has_assessment', 'true');
    set({ hasCompletedAssessment: true });
  },

  logout: async () => {
    await authApi.logout();
    setMemoryToken(null);
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync('athlete_id'),
      SecureStore.deleteItemAsync('athlete_name'),
      SecureStore.deleteItemAsync('has_assessment'),
    ]);
    queryClient.clear();
    set({ token: null, athleteId: null, name: null, hasCompletedAssessment: false, isAuthenticated: false });
  },
}));
