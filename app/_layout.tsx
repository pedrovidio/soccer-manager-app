import '@lib/installErrorLogging';
import React, { useEffect } from 'react';
import { Slot, type ErrorBoundaryProps } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Arena, useThemeStore } from '@ui/tokens/theme';
import { queryClient } from '@lib/queryClient';
import { useAuthStore } from '@features/auth/useAuthStore';
import { useRealtimeSubscriptions } from '@features/realtime/hooks';
import { ErrorScreen } from '@ui/composites/ErrorScreen';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const athleteId = useAuthStore((state) => state.athleteId);
  const theme = useThemeStore((state) => state.theme);

  useRealtimeSubscriptions(athleteId, isAuthenticated && isHydrated);

  return (
    <SafeAreaView key={theme} style={{ flex: 1, backgroundColor: Arena.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Slot />
    </SafeAreaView>
  );
}
