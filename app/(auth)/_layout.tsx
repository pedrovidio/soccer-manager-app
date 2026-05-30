import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { ErrorScreen } from '@ui/composites/ErrorScreen';
import { Arena } from '@ui/tokens/theme';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: Arena.bg },
      }}
    />
  );
}
