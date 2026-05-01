import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/features/auth/useAuthStore';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCompletedAssessment = useAuthStore((s) => s.hasCompletedAssessment);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    hydrate().finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const inAuth = segments[0] === 'login' || segments[0] === 'register';
    if (!isAuthenticated && !inAuth) { router.replace('/login'); return; }
    // Só redireciona de volta para home se já completou o assessment
    if (isAuthenticated && hasCompletedAssessment && inAuth) router.replace('/');
  }, [hydrated, isAuthenticated, hasCompletedAssessment, segments]);

  if (!hydrated) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RouteGuard>
          <Stack screenOptions={{ headerShown: false }} />
        </RouteGuard>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
