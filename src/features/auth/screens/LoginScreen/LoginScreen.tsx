import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { LoginForm } from './LoginForm';
import { styles } from './styles';
import { useLoginScreen } from './useLoginScreen';

export default function LoginScreen() {
  const loginScreen = useLoginScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>⚽</Text>
            </View>
            <Text style={styles.appName}>Soccer Manager</Text>
            <Text style={styles.subtitle}>Gerencie seus jogos e times</Text>
          </View>

          <LoginForm
            email={loginScreen.email}
            password={loginScreen.password}
            loading={loginScreen.loading}
            onEmailChange={loginScreen.setEmail}
            onPasswordChange={loginScreen.setPassword}
            onSubmit={loginScreen.handleLogin}
            onForgotPasswordPress={loginScreen.goToForgotPassword}
            onRegisterPress={loginScreen.goToRegister}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
