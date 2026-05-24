import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, FormField, Input } from '@ui/primitives';
import { useAuthMutations } from '../hooks/useAuthMutations';
import { passwordRecoveryStyles as styles } from './PasswordRecovery.styles';
import { getResetPasswordErrorMessage } from './passwordRecoveryErrors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = Array.isArray(params.email) ? params.email[0] ?? '' : params.email ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resetPassword, resetPasswordState } = useAuthMutations();

  const clearError = () => {
    setValidationError(null);
    resetPasswordState.reset();
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setValidationError('Informe o e-mail que recebeu o código.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setValidationError('O código deve conter exatamente 6 dígitos.');
      return;
    }
    if (password.length < 6) {
      setValidationError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== passwordConfirmation) {
      setValidationError('As senhas não coincidem.');
      return;
    }

    try {
      await resetPassword({ email: normalizedEmail, tokenOrCode: code, newPassword: password });
      router.replace('/login');
    } catch {
      // Error state is rendered below the form.
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.panel}>
            <Text style={styles.title}>Criar nova senha</Text>
            <Text style={styles.description}>
              Insira o código enviado por e-mail e escolha sua nova senha.
            </Text>

            <View style={styles.form}>
              <FormField label="E-mail">
                <Input
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    clearError();
                  }}
                />
              </FormField>
              <FormField label="Código de 6 dígitos">
                <Input
                  accessibilityLabel="Código de recuperação"
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  style={styles.codeInput}
                  value={code}
                  onChangeText={(value) => {
                    setCode(value.replace(/\D/g, '').slice(0, 6));
                    clearError();
                  }}
                />
              </FormField>
              <FormField label="Nova senha">
                <Input
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  secureTextEntry
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearError();
                  }}
                />
              </FormField>
              <FormField label="Confirmar nova senha">
                <Input
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  secureTextEntry
                  value={passwordConfirmation}
                  onChangeText={(value) => {
                    setPasswordConfirmation(value);
                    clearError();
                  }}
                />
              </FormField>

              {validationError ? <Text style={[styles.feedback, styles.error]}>{validationError}</Text> : null}
              {resetPasswordState.isError ? (
                <Text style={[styles.feedback, styles.error]}>
                  {getResetPasswordErrorMessage(resetPasswordState.error)}
                </Text>
              ) : null}
              <Text style={[styles.feedback, styles.hint]}>O código expira em 15 minutos.</Text>

              <Button
                style={styles.action}
                title="Redefinir senha"
                loading={resetPasswordState.isLoading}
                onPress={handleSubmit}
              />
              <Button title="Solicitar novo código" variant="text" onPress={() => router.replace('/forgot-password')} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
