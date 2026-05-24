import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { ErrorScreen } from '@ui/composites/ErrorScreen';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
