import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase env vars are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
}

const supabaseProjectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : 'missing';
export const SUPABASE_AUTH_STORAGE_KEY = `sb-${supabaseProjectRef}-auth-token`;
const LEGACY_SUPABASE_AUTH_STORAGE_KEY = 'supabase.auth.token';

export const supabase = createClient(
  supabaseUrl ?? 'https://missing-supabase-url.supabase.co',
  supabasePublishableKey ?? 'missing-publishable-key',
  {
    auth: {
      storage: AsyncStorage,
      storageKey: SUPABASE_AUTH_STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Escuta mudanças de autenticação para limpar o storage caso o token esteja inválido/expirado
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
    try {
      const stored = await AsyncStorage.getItem(SUPABASE_AUTH_STORAGE_KEY);
      if (stored) {
        const keys = await AsyncStorage.getAllKeys();
        const authKeys = keys.filter((key) => /^sb-.+-auth-token$/.test(key) || key === LEGACY_SUPABASE_AUTH_STORAGE_KEY);
        await AsyncStorage.multiRemove(Array.from(new Set([SUPABASE_AUTH_STORAGE_KEY, ...authKeys])));
      }
    } catch (e) {
      // ignore
    }
  }
});


function isInvalidRefreshTokenError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /invalid refresh token|refresh token not found/i.test(message);
}

export async function clearSupabaseAuthSession(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const authKeys = keys.filter((key) => /^sb-.+-auth-token$/.test(key) || key === LEGACY_SUPABASE_AUTH_STORAGE_KEY);
  await AsyncStorage.multiRemove(Array.from(new Set([SUPABASE_AUTH_STORAGE_KEY, ...authKeys])));
  await supabase.auth.signOut({ scope: 'local' }).catch(() => null);
}

export async function getSupabaseSessionSafe() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearSupabaseAuthSession();
        return null;
      }
      throw error;
    }

    return data.session ?? null;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearSupabaseAuthSession();
      return null;
    }
    throw error;
  }
}

export async function getSupabaseAccessToken(): Promise<string | null> {
  try {
    const session = await getSupabaseSessionSafe();
    return session?.access_token ?? null;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearSupabaseAuthSession();
      return null;
    }
    throw error;
  }
}
