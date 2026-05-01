import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../useAuthStore';
import { Colors, Radius, Spacing } from '../../common/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) {
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
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.logoWrap}>
          <View style={s.logoCircle}>
            <Text style={s.logoIcon}>⚽</Text>
          </View>
          <Text style={s.appName}>Soccer Manager</Text>
          <Text style={s.subtitle}>Gerencie seus jogos e times</Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input}
            placeholder="seu@email.com"
            placeholderTextColor={Colors.n400}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={s.label}>Senha</Text>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.n400}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[s.btn, loading ? s.btnDisabled : null]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={s.btnText}>Entrar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')} style={s.registerLink}>
            <Text style={s.registerLinkText}>Não tem conta? <Text style={{ color: Colors.primary, fontWeight: '700' }}>Criar conta</Text></Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.n50 },
  container:  { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 40 },
  logoWrap:   { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoIcon:   { fontSize: 32 },
  appName:    { fontSize: 24, fontWeight: '800', color: Colors.n900 },
  subtitle:   { fontSize: 13, color: Colors.n500, marginTop: 4 },
  form:       { gap: Spacing.sm },
  label:      { fontSize: 12, fontWeight: '600', color: Colors.n700 },
  input:      { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  btn:        { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm },
  btnDisabled:{ opacity: 0.7 },
  btnText:    { color: Colors.white, fontSize: 15, fontWeight: '700' },
  registerLink: { alignItems: 'center', marginTop: 16 },
  registerLinkText: { fontSize: 13, color: Colors.n500 },
});
