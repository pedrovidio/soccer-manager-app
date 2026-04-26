import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, spacing, radius } from '../theme';
import { Button } from '../components/UI';

type Step = 1 | 2 | 3;

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — Dados pessoais
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 — Endereço
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Step 3 — Perfil
  const [isGoalkeeperForHire, setIsGoalkeeperForHire] = useState(false);

  function validateStep1() {
    if (!name.trim()) return 'Informe seu nome.';
    if (!email.includes('@')) return 'E-mail inválido.';
    if (cpf.replace(/\D/g, '').length !== 11) return 'CPF deve ter 11 dígitos.';
    if (!phone.trim()) return 'Informe seu telefone.';
    if (!age || Number(age) < 16) return 'Idade mínima: 16 anos.';
    if (password.length < 6) return 'Senha mínima: 6 caracteres.';
    return null;
  }

  function validateStep2() {
    if (!cep.trim() || !street.trim() || !number.trim() || !neighborhood.trim() || !city.trim() || state.length !== 2)
      return 'Preencha todos os campos de endereço.';
    return null;
  }

  function handleNext() {
    if (step === 1) {
      const err = validateStep1();
      if (err) { Alert.alert('Atenção', err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { Alert.alert('Atenção', err); return; }
      setStep(3);
    }
  }

  async function handleRegister() {
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpf.replace(/\D/g, ''),
        phone: phone.replace(/\D/g, ''),
        age: Number(age),
        gender,
        address: {
          cep: cep.replace(/\D/g, ''),
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim() || undefined,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
        },
        isGoalkeeperForHire,
        password,
      });
    } catch (e: any) {
      Alert.alert('Erro no cadastro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <View style={styles.progressRow}>
          {([1, 2, 3] as Step[]).map((s) => (
            <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
          ))}
        </View>
        <Text style={[typography.h2, { color: colors.black, marginBottom: 4 }]}>
          {step === 1 ? 'Dados pessoais' : step === 2 ? 'Endereço' : 'Perfil'}
        </Text>
        <Text style={[typography.body, { color: colors.gray600, marginBottom: spacing.lg }]}>
          Passo {step} de 3
        </Text>

        <View style={styles.form}>
          {step === 1 && (
            <>
              <Field label="Nome completo" value={name} onChangeText={setName} placeholder="Pedro Henrique" />
              <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="pedro@email.com" keyboardType="email-address" autoCapitalize="none" />
              <Field label="CPF" value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" keyboardType="numeric" />
              <Field label="Telefone" value={phone} onChangeText={setPhone} placeholder="(11) 99999-9999" keyboardType="phone-pad" />
              <Field label="Idade" value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" />

              <Text style={styles.label}>Gênero</Text>
              <View style={styles.toggleRow}>
                {(['M', 'F'] as const).map((g) => (
                  <TouchableOpacity key={g} style={[styles.toggleBtn, gender === g && styles.toggleBtnActive]} onPress={() => setGender(g)}>
                    <Text style={[typography.body, { color: gender === g ? colors.white : colors.black, fontWeight: '600' }]}>
                      {g === 'M' ? 'Masculino' : 'Feminino'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: spacing.md }]}>Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.gray600}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray600} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="CEP" value={cep} onChangeText={setCep} placeholder="00000-000" keyboardType="numeric" />
              <Field label="Rua" value={street} onChangeText={setStreet} placeholder="Rua das Flores" />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}><Field label="Número" value={number} onChangeText={setNumber} placeholder="123" keyboardType="numeric" /></View>
                <View style={{ flex: 2 }}><Field label="Complemento" value={complement} onChangeText={setComplement} placeholder="Apto 4 (opcional)" /></View>
              </View>
              <Field label="Bairro" value={neighborhood} onChangeText={setNeighborhood} placeholder="Centro" />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 2 }}><Field label="Cidade" value={city} onChangeText={setCity} placeholder="São Paulo" /></View>
                <View style={{ flex: 1 }}><Field label="UF" value={state} onChangeText={setState} placeholder="SP" autoCapitalize="characters" maxLength={2} /></View>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={[typography.body, { color: colors.gray600, marginBottom: spacing.lg }]}>
                Você é goleiro disponível para ser contratado em partidas?
              </Text>
              <View style={styles.toggleRow}>
                {[true, false].map((v) => (
                  <TouchableOpacity key={String(v)} style={[styles.toggleBtn, isGoalkeeperForHire === v && styles.toggleBtnActive]} onPress={() => setIsGoalkeeperForHire(v)}>
                    <Text style={[typography.body, { color: isGoalkeeperForHire === v ? colors.white : colors.black, fontWeight: '600' }]}>
                      {v ? 'Sim' : 'Não'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[typography.caption, { color: colors.gray600, marginTop: spacing.md }]}>
                Você completará sua autoavaliação técnica após o cadastro.
              </Text>
            </>
          )}
        </View>

        <View style={styles.actions}>
          {step > 1 && (
            <Button label="Voltar" variant="secondary" onPress={() => setStep((s) => (s - 1) as Step)} style={{ flex: 1 }} />
          )}
          {step < 3 ? (
            <Button label="Próximo" onPress={handleNext} style={{ flex: 1 }} />
          ) : loading ? (
            <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
          ) : (
            <Button label="Criar conta" onPress={handleRegister} style={{ flex: 1 }} />
          )}
        </View>

        <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')}>
          <Text style={[typography.body, { color: colors.gray600 }]}>Já tem conta? </Text>
          <Text style={[typography.body, { color: colors.primary, fontWeight: '700' }]}>Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput style={fieldStyles.input} placeholderTextColor={colors.gray600} {...props} />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { ...typography.caption, color: colors.gray600, fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    ...typography.body,
    color: colors.black,
    backgroundColor: colors.background,
  },
});

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg },
  progressRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.gray200 },
  progressDotActive: { backgroundColor: colors.primary },
  form: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.lg,
  },
  label: { ...typography.caption, color: colors.gray600, fontWeight: '600', marginBottom: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.background,
  },
  input: { flex: 1, ...typography.body, color: colors.black },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
});
