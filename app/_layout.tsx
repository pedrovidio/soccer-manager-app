import '../src/lib/installErrorLogging';
import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
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
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const athleteId = useAuthStore((state) => state.athleteId);

  useRealtimeSubscriptions(athleteId, isAuthenticated && isHydrated);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <Slot />
    </SafeAreaView>
  );
}
