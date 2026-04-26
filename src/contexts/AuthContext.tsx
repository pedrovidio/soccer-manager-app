import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, athleteApi, tokenStorage } from '../services/api';
import { Athlete, LoginInput, RegisterAthleteInput } from '../types';

interface AuthState {
  athlete: Athlete | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextData extends AuthState {
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterAthleteInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshAthlete: () => Promise<void>;
}

const ATHLETE_KEY = '@soccer_manager:athlete';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Monta um Athlete mínimo a partir do retorno do login (token + athleteId + name)
// Os dados completos são buscados via dashboard logo após
function buildMinimalAthlete(athleteId: string, name: string): Athlete {
  return {
    id: athleteId,
    name,
    email: '',
    phone: '',
    age: 0,
    gender: 'M',
    position: '',
    footballLevel: 'AMATEUR',
    statsPace: 0,
    statsShooting: 0,
    statsPassing: 0,
    statsDribbling: 0,
    statsDefense: 0,
    statsPhysical: 0,
    isGoalkeeperForHire: false,
    isInjured: false,
    financialDebt: 0,
    hasCompletedAssessment: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    athlete: null,
    token: null,
    isLoading: true,
  });

  // Restaura sessão ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const [token, athleteJson] = await Promise.all([
          tokenStorage.get(),
          AsyncStorage.getItem(ATHLETE_KEY),
        ]);
        if (token && athleteJson) {
          setState({ token, athlete: JSON.parse(athleteJson), isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const persistSession = useCallback(async (token: string, athlete: Athlete) => {
    await Promise.all([
      tokenStorage.save(token),
      AsyncStorage.setItem(ATHLETE_KEY, JSON.stringify(athlete)),
    ]);
    setState({ token, athlete, isLoading: false });
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    // 1. Autentica e recebe { token, athleteId, name }
    const { token, athleteId, name } = await authApi.login(data);

    // 2. Salva token imediatamente para que o interceptor já o use
    await tokenStorage.save(token);

    // 3. Busca dashboard para enriquecer o objeto do atleta
    let athlete = buildMinimalAthlete(athleteId, name);
    try {
      const dashboard = await athleteApi.dashboard(athleteId);
      athlete = { ...athlete, ...dashboard };
    } catch {
      // dashboard pode falhar se não houver partidas ainda — usa dados mínimos
    }

    await persistSession(token, athlete);
  }, [persistSession]);

  const register = useCallback(async (data: RegisterAthleteInput) => {
    // Cria o atleta e em seguida faz login
    await athleteApi.register(data);
    await login({ email: data.email, password: data.password });
  }, [login]);

  const logout = useCallback(async () => {
    await Promise.all([tokenStorage.remove(), AsyncStorage.removeItem(ATHLETE_KEY)]);
    setState({ athlete: null, token: null, isLoading: false });
  }, []);

  const refreshAthlete = useCallback(async () => {
    if (!state.athlete) return;
    try {
      const dashboard = await athleteApi.dashboard(state.athlete.id);
      const updated = { ...state.athlete, ...dashboard };
      await AsyncStorage.setItem(ATHLETE_KEY, JSON.stringify(updated));
      setState((s) => ({ ...s, athlete: updated }));
    } catch {
      // silently fail — dados em cache continuam válidos
    }
  }, [state.athlete]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshAthlete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
