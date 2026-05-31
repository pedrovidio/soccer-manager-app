import { Redirect, Stack, type ErrorBoundaryProps } from 'expo-router';
import { useAuthStore } from '@features/auth/useAuthStore';
import { ErrorScreen } from '@ui/composites/ErrorScreen';
import { LoadingScreen } from '@ui/composites/LoadingScreen';
import { Arena } from '@ui/tokens/theme';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) return <LoadingScreen label="Preparando sua conta..." />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Arena.bg },
      }}
    >
      <Stack.Screen name="groups/group-home" options={{ animation: 'none' }} />
      <Stack.Screen name="groups/group-members" options={{ animation: 'none' }} />
      <Stack.Screen name="groups/group-matches" options={{ animation: 'none' }} />
      <Stack.Screen name="groups/group-finance" options={{ animation: 'none' }} />
    </Stack>
  );
}
