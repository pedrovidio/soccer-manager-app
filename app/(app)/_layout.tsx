import { Redirect, Stack, type ErrorBoundaryProps } from 'expo-router';
import { useAuthStore } from '@features/auth/useAuthStore';
import { ErrorScreen } from '@ui/composites/ErrorScreen';
import { LoadingScreen } from '@ui/composites/LoadingScreen';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) return <LoadingScreen label="Preparando sua conta..." />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
