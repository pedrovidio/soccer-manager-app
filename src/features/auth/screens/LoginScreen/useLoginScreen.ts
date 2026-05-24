import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@features/auth/useAuthStore';

export function useLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch {
      Alert.alert('Erro', 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [email, login, password, router]);

  const goToRegister = useCallback(() => {
    router.push('/register');
  }, [router]);

  const goToForgotPassword = useCallback(() => {
    router.push('/forgot-password');
  }, [router]);

  return {
    email,
    password,
    loading,
    setEmail,
    setPassword,
    handleLogin,
    goToRegister,
    goToForgotPassword,
  };
}
