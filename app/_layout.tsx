import '../src/lib/installErrorLogging';
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/features/auth/useAuthStore';
import { useRealtimeSubscriptions } from '../src/features/realtime/hooks';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}

function AuthGuard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const athleteId = useAuthStore((state) => state.athleteId);
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useRealtimeSubscriptions(athleteId, isAuthenticated && isHydrated);

  useEffect(() => {
    if (!isHydrated || !rootNavigationState?.key) return;

    // Se segments for vazio [], significa que estamos na rota raiz '/'
    const currentRoute = segments.length > 0 ? segments[0] : '';
    const inAuthRoute = currentRoute === 'login' || currentRoute === 'register';

    // Delay the navigation slightly to ensure Expo Router has fully mounted its internal navigation tree
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !inAuthRoute) {
        router.replace('/login');
      } else if (isAuthenticated && inAuthRoute) {
        router.replace('/'); // Redireciona para o Home/Dashboard se já estiver logado
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isHydrated, segments, rootNavigationState]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <Slot />
    </SafeAreaView>
  );
}
