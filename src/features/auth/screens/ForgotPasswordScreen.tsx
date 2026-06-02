import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthBrandLogo } from '@features/auth/components/AuthBrandLogo';
import { Button, FormField, Input } from '@ui/primitives';
import { Arena } from '@ui/tokens/theme';
import { useAuthMutations } from '../hooks/useAuthMutations';
import { passwordRecoveryStyles as styles } from './PasswordRecovery.styles';
import { getResetRequestErrorMessage } from './passwordRecoveryErrors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { requestPasswordReset, requestPasswordResetState } = useAuthMutations();

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setValidationError(null);
    requestPasswordResetState.reset();
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setValidationError('Informe um e-mail válido.');
      return;
    }

    try {
      await requestPasswordReset({ email: normalizedEmail });
      router.push({ pathname: '/reset-password', params: { email: normalizedEmail } });
    } catch {
      // Error state is rendered below the form.
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.panel}>
            <AuthBrandLogo compact nameColor={Arena.text} style={styles.brand} />
            <Text style={styles.title}>Recuperar senha</Text>
            <Text style={styles.description}>
              Digite seu e-mail para receber um código de recuperação com seis dígitos.
            </Text>

            <View style={styles.form}>
              <FormField label="E-mail">
                <Input
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={handleEmailChange}
                />
              </FormField>

              {validationError ? <Text style={[styles.feedback, styles.error]}>{validationError}</Text> : null}
              {requestPasswordResetState.isError ? (
                <Text style={[styles.feedback, styles.error]}>
                  {getResetRequestErrorMessage(requestPasswordResetState.error)}
                </Text>
              ) : null}

              <Button
                style={styles.action}
                title="Enviar código"
                loading={requestPasswordResetState.isLoading}
                onPress={handleSubmit}
              />
              <Button title="Voltar ao login" variant="text" onPress={() => router.back()} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
