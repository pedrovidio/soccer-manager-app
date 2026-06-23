import '@lib/installErrorLogging';
import React, { useEffect } from 'react';
import { Slot, type ErrorBoundaryProps } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Arena, useThemeStore } from '@ui/tokens/theme';
import { queryClient } from '@lib/queryClient';
import { useAuthStore } from '@features/auth/useAuthStore';
import { useRealtimeSubscriptions } from '@features/realtime/hooks';
import { ErrorScreen } from '@ui/composites/ErrorScreen';
import { registerForPushNotificationsAsync } from '@features/notifications/services/pushNotifications';
import { athleteApi } from '@features/athletes/services/athleteApi';


export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();

    // expo-notifications: push remotos removidos do Expo Go no SDK 53+.
    // Carregamos o módulo dinamicamente para evitar o erro na importação.
    if (Constants.appOwnership !== 'expo') {
      const Notifications = require('expo-notifications');
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }

    // Inicialização dinâmica do AdMob para evitar crash em Expo Go
    try {
      const mobileAds = require('react-native-google-mobile-ads').default;
      void mobileAds()
        .initialize()
        .catch((err: any) => console.warn('Erro ao inicializar AdMob SDK:', err));
    } catch (e) {
      console.warn('Google Mobile Ads native module not available for initialization.');
    }
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

  useEffect(() => {
    if (isAuthenticated && isHydrated && athleteId) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          athleteApi.updatePushToken(athleteId, token).catch((err) => {
            console.error('[PushNotifications] Failed to sync push token to server:', err);
          });
        }
      });
    }
  }, [isAuthenticated, isHydrated, athleteId]);

  return (
    <SafeAreaView key={theme} style={{ flex: 1, backgroundColor: Arena.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Slot />
    </SafeAreaView>
  );
}
