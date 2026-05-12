import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../../common/theme';
import { AttributeSlider } from '../../common/components/AttributeSlider';
import { WizardHeader, FormField, ChipRow, LevelCard, SwitchRow, UFSelect, TimeSelect } from '../../common/components/form/FormElements';
import { registerApi } from '../services/registerApi';
import { useAuthStore } from '../useAuthStore';
import { RegisterFormData, FootballLevel, Gender,
  YearsPlaying, WeeklyFrequency, AvailabilitySlot,
} from '../registerTypes';

const TOTAL_STEPS = 4;

const POSITIONS: { value: string; label: string }[] = [
  { value: 'Goalkeeper', label: 'Goleiro' },
  { value: 'Defender',   label: 'Zagueiro' },
  { value: 'Midfielder', label: 'Meia' },
  { value: 'Forward',    label: 'Atacante' },
];

const LEVELS: { value: FootballLevel; label: string; desc: string; icon: string }[] = [
  { value: 'PROFESSIONAL', label: 'Profissional', desc: 'Jogou em clube ou competição oficial', icon: '🏆' },
  { value: 'AMATEUR',      label: 'Amador',       desc: 'Joga em várzea ou campeonatos locais', icon: '⚽' },
  { value: 'CASUAL',       label: 'Casual',       desc: 'Joga por lazer e diversão',            icon: '🎮' },
];

const YEARS: { value: YearsPlaying; label: string }[] = [
  { value: 'LESS_THAN_2',  label: '< 2 anos' },
  { value: '2_TO_5',       label: '2 a 5 anos' },
  { value: '6_TO_10',      label: '6 a 10 anos' },
  { value: 'MORE_THAN_10', label: '+ de 10 anos' },
];

const FREQUENCIES: { value: WeeklyFrequency; label: string }[] = [
  { value: 'RARELY',    label: 'Raramente' },
  { value: '1_TO_2',    label: '1 a 2x/semana' },
  { value: '3_OR_MORE', label: '3x ou mais' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

const ATTRIBUTES: { key: keyof Pick<RegisterFormData,
  'selfRatedPace'|'selfRatedShooting'|'selfRatedPassing'|
  'selfRatedDribbling'|'selfRatedDefense'|'selfRatedPhysical'>; label: string }[] = [
  { key: 'selfRatedPace',      label: 'Velocidade' },
  { key: 'selfRatedShooting',  label: 'Finalização' },
  { key: 'selfRatedPassing',   label: 'Passe' },
  { key: 'selfRatedDribbling', label: 'Drible' },
  { key: 'selfRatedDefense',   label: 'Defesa' },
  { key: 'selfRatedPhysical',  label: 'Físico' },
];

const INITIAL: RegisterFormData = {
  name: '', email: '', password: '', confirmPassword: '',
  cpf: '', phone: '', age: '', gender: '',
  cep: '', street: '', number: '', complement: '',
  neighborhood: '', city: '', state: '',
  preferredPosition: '', highestLevel: '',
  yearsPlaying: '', weeklyFrequency: '',
  playedProfessionally: false,
  selfRatedPace: 50, selfRatedShooting: 50, selfRatedPassing: 50,
  selfRatedDribbling: 50, selfRatedDefense: 50, selfRatedPhysical: 50,
  wantsAvailability: false,
  availabilitySlots: [],
};

function parseApiError(e: any): string {
  const status = e?.response?.status;
  const data = e?.response?.data;
  console.log('[RegisterScreen] API Error status:', status);
  console.log('[RegisterScreen] API Error data:', JSON.stringify(data));
  console.log('[RegisterScreen] API Error message:', e?.message);
  if (data?.errors?.length) return data.errors.map((x: any) => x.message).join('\n');
  if (data?.error) return data.error;
  if (e?.message) return e.message;
  return 'Não foi possível completar a operação.';
}

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterFormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { login, setAssessmentCompleted } = useAuthStore();

  const set = (field: keyof RegisterFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  function validateStep1() {
    if (!form.name.trim())                        return 'Informe seu nome.';
    if (!form.email.includes('@'))                return 'E-mail inválido.';
    if (form.cpf.replace(/\D/g, '').length !== 11) return 'CPF deve ter 11 dígitos.';
    if (form.password.length < 6)                 return 'Senha deve ter ao menos 6 caracteres.';
    if (form.password !== form.confirmPassword)   return 'As senhas não coincidem.';
    if (!form.phone.trim())                       return 'Informe seu telefone.';
    if (!form.age || isNaN(Number(form.age)))     return 'Informe sua idade.';
    if (!form.gender)                             return 'Selecione seu gênero.';
    if (!form.cep.trim())                         return 'Informe o CEP.';
    if (!form.street.trim())                      return 'Informe a rua.';
    if (!form.number || isNaN(Number(form.number))) return 'Informe o número.';
    if (!form.neighborhood.trim())                return 'Informe o bairro.';
    if (!form.city.trim())                        return 'Informe a cidade.';
    if (!form.state.trim())                       return 'Informe o estado (UF).';
    return null;
  }

  function validateStep2() {
    if (!form.preferredPosition) return 'Selecione sua posição.';
    if (!form.highestLevel)      return 'Selecione seu nível.';
    if (!form.yearsPlaying)      return 'Selecione há quantos anos joga.';
    if (!form.weeklyFrequency)   return 'Selecione sua frequência semanal.';
    return null;
  }

  function handleNext() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    if (err) { Alert.alert('Atenção', err); return; }
    Keyboard.dismiss();
    setStep((s) => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      // 1. Cadastro — sem token
      const registerPayload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, ''),
        age: Number(form.age),
        gender: form.gender,
        address: {
          cep: form.cep.trim(),
          street: form.street.trim(),
          number: Number(form.number),
          complement: form.complement.trim() || undefined,
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
        },
        password: form.password,
      };
      console.log('[RegisterScreen] STEP 1 — POST /athletes payload:', JSON.stringify(registerPayload));
      const athlete = await registerApi.register({
        ...registerPayload,
        gender: form.gender as Gender,
      });
      console.log('[RegisterScreen] STEP 1 — response athlete.id:', athlete.id);

      // 2. Login — obtém token antes do assessment
      console.log('[RegisterScreen] STEP 2 — POST /auth/login email:', form.email.trim().toLowerCase());
      await login(form.email.trim().toLowerCase(), form.password);
      console.log('[RegisterScreen] STEP 2 — login OK');

      // 3. Assessment
      const assessmentPayload = {
        playedProfessionally: form.playedProfessionally,
        highestLevel: form.highestLevel,
        yearsPlaying: form.yearsPlaying,
        weeklyFrequency: form.weeklyFrequency,
        selfRatedPace: form.selfRatedPace,
        selfRatedShooting: form.selfRatedShooting,
        selfRatedPassing: form.selfRatedPassing,
        selfRatedDribbling: form.selfRatedDribbling,
        selfRatedDefense: form.selfRatedDefense,
        selfRatedPhysical: form.selfRatedPhysical,
        preferredPosition: form.preferredPosition,
      };
      await registerApi.submitAssessment(athlete.id, {
        ...assessmentPayload,
        highestLevel: form.highestLevel as FootballLevel,
        yearsPlaying: form.yearsPlaying as YearsPlaying,
        weeklyFrequency: form.weeklyFrequency as WeeklyFrequency,
      });

      // 4. Disponibilidade (opcional)
      if (form.wantsAvailability && form.availabilitySlots.length > 0) {
        await registerApi.saveAvailability(athlete.id, form.availabilitySlots);
      }

      setAssessmentCompleted();
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erro', parseApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <WizardHeader
          step={step}
          totalSteps={TOTAL_STEPS}
          onBack={() => step > 1 ? setStep(p => p - 1) : router.back()}
        />

        <ScrollView ref={scrollRef} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && <Step2 form={form} set={set} />}
          {step === 3 && <Step3 form={form} set={set} />}
          {step === 4 && <Step4 form={form} set={set} />}

          <TouchableOpacity
            style={[s.btn, loading ? s.btnDisabled : null]}
            onPress={step < TOTAL_STEPS ? handleNext : handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={s.btnText}>{step < TOTAL_STEPS ? 'Continuar' : 'Criar conta'}</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Step 1: Dados Pessoais + Endereço ───────────────────────────────────────
function Step1({ form, set }: { form: RegisterFormData; set: (f: keyof RegisterFormData, v: any) => void }) {
  return (
    <View>
      <Text style={s.stepTitle}>Dados pessoais</Text>
      <Text style={s.stepSubtitle}>Informações básicas e endereço</Text>

      <FormField label="Nome completo">
        <TextInput style={s.input}
          value={form.name} onChangeText={(v) => set('name', v)} />
      </FormField>
      <FormField label="E-mail">
        <TextInput style={s.input} placeholder="seu@email.com" placeholderTextColor={Colors.n400}
          keyboardType="email-address" autoCapitalize="none"
          value={form.email} onChangeText={(v) => set('email', v)} />
      </FormField>
      <FormField label="CPF">
        <TextInput style={s.input} placeholder="000.000.000-00" placeholderTextColor={Colors.n400}
          keyboardType="numeric" value={form.cpf}
          onChangeText={(v) => {
            const digits = v.replace(/\D/g, '').slice(0, 11);
            const masked = digits
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            set('cpf', masked);
          }} />
      </FormField>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormField label="Senha">
            <TextInput style={s.input} placeholder="••••••" placeholderTextColor={Colors.n400}
              secureTextEntry value={form.password} onChangeText={(v) => set('password', v)} />
          </FormField>
        </View>
        <View style={{ flex: 1 }}>
          <FormField label="Confirmar senha">
            <TextInput style={s.input} placeholder="••••••" placeholderTextColor={Colors.n400}
              secureTextEntry value={form.confirmPassword} onChangeText={(v) => set('confirmPassword', v)} />
          </FormField>
        </View>
      </View>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormField label="Telefone">
            <TextInput style={s.input} placeholder="(51) 99999-9999" placeholderTextColor={Colors.n400}
              keyboardType="phone-pad" value={form.phone}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, '').slice(0, 11);
                const masked = digits
                  .replace(/(\d{2})(\d)/, '($1) $2')
                  .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
                set('phone', masked);
              }} />
          </FormField>
        </View>
        <View style={{ flex: 1 }}>
          <FormField label="Idade">
            <TextInput style={s.input}
              keyboardType="numeric" value={form.age} onChangeText={(v) => set('age', v)} />
          </FormField>
        </View>
      </View>

      <FormField label="Gênero">
        <ChipRow
          options={GENDERS}
          selectedValue={form.gender}
          onSelect={(val) => set('gender', val)}
        />
      </FormField>

      <View style={s.divider} />
      <Text style={s.sectionLabel}>Endereço</Text>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormField label="CEP">
            <TextInput style={s.input} placeholder="00000-000" placeholderTextColor={Colors.n400}
              keyboardType="numeric" value={form.cep}
              onChangeText={async (v) => {
                const digits = v.replace(/\D/g, '').slice(0, 8);
                const masked = digits.replace(/(\d{5})(\d{1,3})/, '$1-$2');
                set('cep', masked);
                if (digits.length === 8) {
                  try {
                    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                      set('street', data.logradouro ?? '');
                      set('neighborhood', data.bairro ?? '');
                      set('city', data.localidade ?? '');
                      set('state', data.uf ?? '');
                    }
                  } catch {}
                }
              }} />
          </FormField>
        </View>
        <View style={{ flex: 2 }}>
          <FormField label="Rua">
            <TextInput style={s.input}
              value={form.street} onChangeText={(v) => set('street', v)} />
          </FormField>
        </View>
      </View>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormField label="Número">
            <TextInput style={s.input} placeholder="123" placeholderTextColor={Colors.n400}
              keyboardType="numeric" value={form.number} onChangeText={(v) => set('number', v)} />
          </FormField>
        </View>
        <View style={{ flex: 2 }}>
          <FormField label="Complemento">
            <TextInput style={s.input} placeholder="Apto (opcional)" placeholderTextColor={Colors.n400}
              value={form.complement} onChangeText={(v) => set('complement', v)} />
          </FormField>
        </View>
      </View>

      <FormField label="Bairro">
        <TextInput style={s.input}
          value={form.neighborhood} onChangeText={(v) => set('neighborhood', v)} />
      </FormField>

      <View style={s.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <FormField label="Cidade">
            <TextInput style={s.input} placeholderTextColor={Colors.n400}
              value={form.city} onChangeText={(v) => set('city', v)} />
          </FormField>
        </View>
      </View>

      <FormField label="UF">
        <UFSelect value={form.state} onChange={(v) => set('state', v)} />
      </FormField>
    </View>
  );
}

// ─── Step 2: Questionário ─────────────────────────────────────────────────────
function Step2({ form, set }: { form: RegisterFormData; set: (f: keyof RegisterFormData, v: any) => void }) {
  return (
    <View>
      <Text style={s.stepTitle}>Perfil no futebol</Text>
      <Text style={s.stepSubtitle}>Essas informações calculam seu Overall inicial</Text>

      <Text style={s.sectionLabel}>Posição preferida</Text>
      <ChipRow
        options={POSITIONS}
        selectedValue={form.preferredPosition}
        onSelect={(val) => set('preferredPosition', val)}
      />

      <Text style={s.sectionLabel}>Nível mais alto que jogou</Text>
      {LEVELS.map((l) => (
        <LevelCard
          key={l.value}
          value={l.value}
          label={l.label}
          desc={l.desc}
          icon={l.icon}
          isSelected={form.highestLevel === l.value}
          onSelect={(val) => set('highestLevel', val)}
        />
      ))}

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Há quantos anos joga?</Text>
      <ChipRow
        options={YEARS}
        selectedValue={form.yearsPlaying}
        onSelect={(val) => set('yearsPlaying', val)}
      />

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Frequência semanal</Text>
      <ChipRow
        options={FREQUENCIES}
        selectedValue={form.weeklyFrequency}
        onSelect={(val) => set('weeklyFrequency', val)}
      />
    </View>
  );
}

// ─── Step 3: Autoavaliação ────────────────────────────────────────────────────
function Step3({ form, set }: { form: RegisterFormData; set: (f: keyof RegisterFormData, v: any) => void }) {
  const overall = Math.round(
    (form.selfRatedPace + form.selfRatedShooting + form.selfRatedPassing +
     form.selfRatedDribbling + form.selfRatedDefense + form.selfRatedPhysical) / 6
  );
  const overallColor = overall >= 70 ? Colors.success : overall >= 50 ? Colors.warning : Colors.error;

  return (
    <View>
      <Text style={s.stepTitle}>Autoavaliação</Text>
      <Text style={s.stepSubtitle}>Arraste para definir seus atributos técnicos</Text>

      <View style={[s.overallCard, { borderColor: overallColor }]}>
        <Text style={s.overallLabel}>Overall inicial estimado</Text>
        <Text style={[s.overallValue, { color: overallColor }]}>{overall}</Text>
      </View>

      {ATTRIBUTES.map((attr) => (
        <AttributeSlider
          key={attr.key}
          label={attr.label}
          value={form[attr.key] as number}
          onChange={(v) => set(attr.key, v)}
        />
      ))}
    </View>
  );
}

// ─── Step 4: Disponibilidade ─────────────────────────────────────────────────
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function Step4({ form, set }: { form: RegisterFormData; set: (f: keyof RegisterFormData, v: any) => void }) {
  function pad2(n: string | number) { return String(n).padStart(2, '0'); }
  function addOneHour(time: string) {
    const [h, m] = time.split(':').map(Number);
    let nh = (h + 1) % 24;
    return pad2(nh) + ':' + pad2(m);
  }

  function toggleDay(day: number) {
    const exists = form.availabilitySlots.some((s) => s.dayOfWeek === day);
    if (exists) {
      set('availabilitySlots', form.availabilitySlots.filter((s) => s.dayOfWeek !== day));
    } else {
      set('availabilitySlots', [...form.availabilitySlots, { dayOfWeek: day, startTime: '18:00', endTime: '20:00' }]);
    }
  }

  function handleStartTimeChange(idx: number, timeStr: string) {
    const endTime = addOneHour(timeStr);
    const updated = form.availabilitySlots.map((s, i) => i === idx ? { ...s, startTime: timeStr, endTime } : s);
    set('availabilitySlots', updated);
  }

  function handleEndTimeChange(idx: number, timeStr: string) {
    const updated = form.availabilitySlots.map((s, i) => i === idx ? { ...s, endTime: timeStr } : s);
    set('availabilitySlots', updated);
  }

  const sortedSlots = [...form.availabilitySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <View>
      <Text style={s.stepTitle}>Disponibilidade</Text>
      <Text style={s.stepSubtitle}>Informe quando você está disponível para partidas avulsas</Text>

      <SwitchRow
        label="Quero receber convites para partidas"
        desc="Você aparecerá para times buscando jogadores avulsos"
        value={form.wantsAvailability}
        onValueChange={(v) => {
          set('wantsAvailability', v);
          if (!v) set('availabilitySlots', []);
        }}
      />

      {form.wantsAvailability && (
        <>
          <Text style={s.sectionLabel}>Dias disponíveis</Text>
          <View style={s.daysRow}>
            {DAYS.map((label, day) => {
              const active = form.availabilitySlots.some((s) => s.dayOfWeek === day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[s.dayChip, active && s.dayChipActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[s.dayChipText, active && s.dayChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {sortedSlots.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={s.sectionLabel}>Defina os horários</Text>
              {sortedSlots.map((slot) => {
                const idx = form.availabilitySlots.findIndex((s) => s.dayOfWeek === slot.dayOfWeek);
                return (
                  <View key={slot.dayOfWeek} style={s.slotCard}>
                    <View style={s.slotCardHeader}>
                      <Text style={s.slotDayLabel}>{DAYS[slot.dayOfWeek]}</Text>
                      <TouchableOpacity onPress={() => toggleDay(slot.dayOfWeek)}>
                        <Text style={s.slotRemove}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={s.slotTimeRow}>
                      <View style={s.timeBlock}>
                        <Text style={s.timeLabel}>Início</Text>
                        <TimeSelect value={slot.startTime} onChange={(v) => handleStartTimeChange(idx, v)} />
                      </View>
                      <View style={s.timeDiv}>
                         <Text style={s.timeDivText}>até</Text>
                      </View>
                      <View style={s.timeBlock}>
                        <Text style={s.timeLabel}>Fim</Text>
                        <TimeSelect value={slot.endTime} onChange={(v) => handleEndTimeChange(idx, v)} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {sortedSlots.length === 0 && (
            <View style={s.emptySlots}>
              <Text style={s.emptySlotsText}>Selecione ao menos um dia acima</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.n50 },
  scroll:          { padding: Spacing.lg, paddingBottom: 40 },
  stepTitle:       { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle:    { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  input:           { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  row:             { flexDirection: 'row', alignItems: 'flex-start' },
  divider:         { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionLabel:    { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  overallCard:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 2, padding: 16, marginBottom: 24 },
  overallLabel:    { fontSize: 13, fontWeight: '600', color: Colors.n700 },
  overallValue:    { fontSize: 36, fontWeight: '800' },
  btn:             { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled:     { opacity: 0.7 },
  btnText:         { color: Colors.white, fontSize: 15, fontWeight: '700' },
  daysRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  dayChip:        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.n300, backgroundColor: Colors.white },
  dayChipActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayChipText:    { fontSize: 11, fontWeight: '600', color: Colors.n700 },
  dayChipTextActive: { color: Colors.primary },
  slotCard:       { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 16, marginBottom: 12 },
  slotCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  slotDayLabel:   { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  slotRemove:     { fontSize: 13, fontWeight: '600', color: Colors.error },
  slotTimeRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeBlock:      { flex: 1 },
  timeLabel:      { fontSize: 12, fontWeight: '600', color: Colors.n500, marginBottom: 6 },
  timeDiv:        { paddingHorizontal: 12, justifyContent: 'flex-end', paddingBottom: 10 },
  timeDivText:    { fontSize: 13, color: Colors.n500 },
  emptySlots:     { alignItems: 'center', paddingVertical: 16 },
  emptySlotsText: { fontSize: 13, color: Colors.n400 },
});
