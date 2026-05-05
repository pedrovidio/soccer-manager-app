import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Switch, Keyboard, Modal, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../../common/theme';
import { AttributeSlider } from '../../common/components/AttributeSlider';
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

const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
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
  isGoalkeeperForHire: false,
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
        isGoalkeeperForHire: form.isGoalkeeperForHire,
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
        <View style={s.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(p => p - 1) : router.back()} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={s.stepInfo}>
            <Text style={s.stepLabel}>Passo {step} de {TOTAL_STEPS}</Text>
            <View style={s.progressBar}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View key={String(i)} style={[s.progressDot, i < step ? s.progressDotActive : null]} />
              ))}
            </View>
          </View>
        </View>

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

      <Field label="Nome completo">
        <TextInput style={s.input}
          value={form.name} onChangeText={(v) => set('name', v)} />
      </Field>
      <Field label="E-mail">
        <TextInput style={s.input} placeholder="seu@email.com" placeholderTextColor={Colors.n400}
          keyboardType="email-address" autoCapitalize="none"
          value={form.email} onChangeText={(v) => set('email', v)} />
      </Field>
      <Field label="CPF">
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
      </Field>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="Senha">
            <TextInput style={s.input} placeholder="••••••" placeholderTextColor={Colors.n400}
              secureTextEntry value={form.password} onChangeText={(v) => set('password', v)} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Confirmar senha">
            <TextInput style={s.input} placeholder="••••••" placeholderTextColor={Colors.n400}
              secureTextEntry value={form.confirmPassword} onChangeText={(v) => set('confirmPassword', v)} />
          </Field>
        </View>
      </View>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="Telefone">
            <TextInput style={s.input} placeholder="(51) 99999-9999" placeholderTextColor={Colors.n400}
              keyboardType="phone-pad" value={form.phone}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, '').slice(0, 11);
                const masked = digits
                  .replace(/(\d{2})(\d)/, '($1) $2')
                  .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
                set('phone', masked);
              }} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Idade">
            <TextInput style={s.input}
              keyboardType="numeric" value={form.age} onChangeText={(v) => set('age', v)} />
          </Field>
        </View>
      </View>

      <Field label="Gênero">
        <View style={s.chipRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity key={g.value} style={[s.chip, form.gender === g.value ? s.chipActive : null]}
              onPress={() => set('gender', g.value)}>
              <Text style={[s.chipText, form.gender === g.value ? s.chipTextActive : null]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <View style={s.divider} />
      <Text style={s.sectionLabel}>Endereço</Text>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="CEP">
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
          </Field>
        </View>
        <View style={{ flex: 2 }}>
          <Field label="Rua">
            <TextInput style={s.input}
              value={form.street} onChangeText={(v) => set('street', v)} />
          </Field>
        </View>
      </View>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="Número">
            <TextInput style={s.input} placeholder="123" placeholderTextColor={Colors.n400}
              keyboardType="numeric" value={form.number} onChangeText={(v) => set('number', v)} />
          </Field>
        </View>
        <View style={{ flex: 2 }}>
          <Field label="Complemento">
            <TextInput style={s.input} placeholder="Apto (opcional)" placeholderTextColor={Colors.n400}
              value={form.complement} onChangeText={(v) => set('complement', v)} />
          </Field>
        </View>
      </View>

      <Field label="Bairro">
        <TextInput style={s.input}
          value={form.neighborhood} onChangeText={(v) => set('neighborhood', v)} />
      </Field>

      <View style={s.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Field label="Cidade">
            <TextInput style={s.input} placeholderTextColor={Colors.n400}
              value={form.city} onChangeText={(v) => set('city', v)} />
          </Field>
        </View>
      </View>

      <Field label="UF">
        <UFSelect value={form.state} onChange={(v) => set('state', v)} />
      </Field>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.switchLabel}>Disponível como goleiro de aluguel?</Text>
          <Text style={s.switchDesc}>Você poderá ser contratado para partidas</Text>
        </View>
        <Switch
          value={form.isGoalkeeperForHire}
          onValueChange={(v) => set('isGoalkeeperForHire', v)}
          trackColor={{ false: Colors.n300, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>
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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {POSITIONS.map((p) => (
          <TouchableOpacity key={p.value} style={[s.chip, form.preferredPosition === p.value ? s.chipActive : null]}
            onPress={() => set('preferredPosition', p.value)}>
            <Text style={[s.chipText, form.preferredPosition === p.value ? s.chipTextActive : null]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionLabel}>Nível mais alto que jogou</Text>
      {LEVELS.map((l) => (
        <TouchableOpacity key={l.value}
          style={[s.levelCard, form.highestLevel === l.value ? s.levelCardActive : null]}
          onPress={() => set('highestLevel', l.value)}>
          <Text style={s.levelIcon}>{l.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.levelLabel, form.highestLevel === l.value ? s.levelLabelActive : null]}>{l.label}</Text>
            <Text style={s.levelDesc}>{l.desc}</Text>
          </View>
          <View style={[s.radio, form.highestLevel === l.value ? s.radioActive : null]}>
            {form.highestLevel === l.value && <View style={s.radioDot} />}
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Há quantos anos joga?</Text>
      <View style={s.chipRow}>
        {YEARS.map((y) => (
          <TouchableOpacity key={y.value} style={[s.chip, form.yearsPlaying === y.value ? s.chipActive : null]}
            onPress={() => set('yearsPlaying', y.value)}>
            <Text style={[s.chipText, form.yearsPlaying === y.value ? s.chipTextActive : null]}>{y.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Frequência semanal</Text>
      <View style={s.chipRow}>
        {FREQUENCIES.map((f) => (
          <TouchableOpacity key={f.value} style={[s.chip, form.weeklyFrequency === f.value ? s.chipActive : null]}
            onPress={() => set('weeklyFrequency', f.value)}>
            <Text style={[s.chipText, form.weeklyFrequency === f.value ? s.chipTextActive : null]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
const TIME_OPTIONS = Array.from({ length: 29 }, (_, i) => {
  const h = Math.floor(i / 2) + 6; // 06:00 até 20:00
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function Step4({ form, set }: { form: RegisterFormData; set: (f: keyof RegisterFormData, v: any) => void }) {
  const [pickerTarget, setPickerTarget] = useState<{ idx: number; field: 'startTime' | 'endTime' } | null>(null);

  function toggleDay(day: number) {
    const exists = form.availabilitySlots.some((s) => s.dayOfWeek === day);
    if (exists) {
      set('availabilitySlots', form.availabilitySlots.filter((s) => s.dayOfWeek !== day));
    } else {
      set('availabilitySlots', [...form.availabilitySlots, { dayOfWeek: day, startTime: '08:00', endTime: '10:00' }]);
    }
  }

  function updateSlot(idx: number, field: 'startTime' | 'endTime', value: string) {
    const updated = form.availabilitySlots.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    set('availabilitySlots', updated);
  }

  const sortedSlots = [...form.availabilitySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <View>
      <Text style={s.stepTitle}>Disponibilidade</Text>
      <Text style={s.stepSubtitle}>Informe quando você está disponível para partidas avulsas</Text>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.switchLabel}>Quero receber convites para partidas avulsas</Text>
          <Text style={s.switchDesc}>Você aparecerá para admins buscando jogadores</Text>
        </View>
        <Switch
          value={form.wantsAvailability}
          onValueChange={(v) => {
            set('wantsAvailability', v);
            if (!v) set('availabilitySlots', []);
          }}
          trackColor={{ false: Colors.n300, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

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
            <>
              <Text style={[s.sectionLabel, { marginTop: 16 }]}>Horários por dia</Text>
              {sortedSlots.map((slot) => {
                const idx = form.availabilitySlots.findIndex((s) => s.dayOfWeek === slot.dayOfWeek);
                return (
                  <View key={slot.dayOfWeek} style={s.slotRow}>
                    <Text style={s.slotDay}>{DAYS[slot.dayOfWeek]}</Text>
                    <TouchableOpacity
                      style={s.timeBtn}
                      onPress={() => setPickerTarget({ idx, field: 'startTime' })}
                    >
                      <Text style={s.timeBtnText}>{slot.startTime}</Text>
                    </TouchableOpacity>
                    <Text style={s.slotSep}>até</Text>
                    <TouchableOpacity
                      style={s.timeBtn}
                      onPress={() => setPickerTarget({ idx, field: 'endTime' })}
                    >
                      <Text style={s.timeBtnText}>{slot.endTime}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          )}

          {sortedSlots.length === 0 && (
            <View style={s.emptySlots}>
              <Text style={s.emptySlotsText}>Selecione ao menos um dia acima</Text>
            </View>
          )}
        </>
      )}

      {/* Time picker modal */}
      <Modal visible={!!pickerTarget} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setPickerTarget(null)} />
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>
              {pickerTarget?.field === 'startTime' ? 'Horário de início' : 'Horário de término'}
            </Text>
            <TouchableOpacity onPress={() => setPickerTarget(null)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={TIME_OPTIONS}
            keyExtractor={(t) => t}
            renderItem={({ item }) => {
              const current = pickerTarget ? form.availabilitySlots[pickerTarget.idx]?.[pickerTarget.field] : '';
              return (
                <TouchableOpacity
                  style={[s.modalItem, current === item && s.modalItemActive]}
                  onPress={() => {
                    if (pickerTarget) updateSlot(pickerTarget.idx, pickerTarget.field, item);
                    setPickerTarget(null);
                  }}
                >
                  <Text style={[s.modalItemText, current === item && s.modalItemTextActive]}>{item}</Text>
                  {current === item && <Text style={{ color: Colors.primary }}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

function UFSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={s.selectBtn} onPress={() => setOpen(true)}>
        <Text style={[s.selectBtnText, !value ? { color: Colors.n400 } : null]}>
          {value || 'Selecione o estado'}
        </Text>
        <Text style={s.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Selecione o estado</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={UF_LIST}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.modalItem, value === item ? s.modalItemActive : null]}
                onPress={() => { onChange(item); setOpen(false); }}
              >
                <Text style={[s.modalItemText, value === item ? s.modalItemTextActive : null]}>{item}</Text>
                {value === item && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.n50 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backIcon:        { fontSize: 18, color: Colors.n900 },
  stepInfo:        { flex: 1 },
  stepLabel:       { fontSize: 12, color: Colors.n500, marginBottom: 6 },
  progressBar:     { flexDirection: 'row', gap: 6 },
  progressDot:     { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.n200 },
  progressDotActive: { backgroundColor: Colors.primary },
  scroll:          { padding: Spacing.lg, paddingBottom: 40 },
  stepTitle:       { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle:    { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  field:           { marginBottom: 12 },
  fieldLabel:      { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 5 },
  input:           { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  row:             { flexDirection: 'row', alignItems: 'flex-start' },
  chipRow:         { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  chip:            { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.r8, borderWidth: 1.5, borderColor: Colors.n300, backgroundColor: Colors.white },
  chipActive:      { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipText:        { fontSize: 12, color: Colors.n700, fontWeight: '500' },
  chipTextActive:  { color: Colors.primary, fontWeight: '700' },
  divider:         { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionLabel:    { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  levelCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1.5, borderColor: Colors.n200, padding: 14, marginBottom: 8, gap: 12 },
  levelCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  levelIcon:       { fontSize: 22 },
  levelLabel:      { fontSize: 14, fontWeight: '700', color: Colors.n900 },
  levelLabelActive:{ color: Colors.primary },
  levelDesc:       { fontSize: 11, color: Colors.n500, marginTop: 2 },
  radio:           { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.n300, alignItems: 'center', justifyContent: 'center' },
  radioActive:     { borderColor: Colors.primary },
  radioDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  switchRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: Radius.r12, padding: 14, borderWidth: 1, borderColor: Colors.n200, marginBottom: 12 },
  switchLabel:     { fontSize: 13, fontWeight: '600', color: Colors.n800 },
  switchDesc:      { fontSize: 11, color: Colors.n500, marginTop: 2 },
  overallCard:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 2, padding: 16, marginBottom: 24 },
  overallLabel:    { fontSize: 13, fontWeight: '600', color: Colors.n700 },
  overallValue:    { fontSize: 36, fontWeight: '800' },
  btn:             { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled:     { opacity: 0.7 },
  btnText:         { color: Colors.white, fontSize: 15, fontWeight: '700' },
  ufChip:          { paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.r8, borderWidth: 1.5, borderColor: Colors.n300, backgroundColor: Colors.white },
  ufChipActive:    { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  ufChipText:      { fontSize: 12, fontWeight: '500', color: Colors.n700 },
  ufChipTextActive:{ color: Colors.primary, fontWeight: '700' },
  selectBtn:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10 },
  selectBtnText:   { fontSize: 14, color: Colors.n900 },
  selectArrow:     { fontSize: 12, color: Colors.n500 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:      { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r16, borderTopRightRadius: Radius.r16, maxHeight: '60%' },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  modalTitle:      { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  modalClose:      { fontSize: 18, color: Colors.n500 },
  modalItem:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.n100 },
  modalItemActive: { backgroundColor: Colors.primaryLight },
  modalItemText:   { fontSize: 14, color: Colors.n900 },
  modalItemTextActive: { color: Colors.primary, fontWeight: '700' },
  daysRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  dayChip:        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.n300, backgroundColor: Colors.white },
  dayChipActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayChipText:    { fontSize: 11, fontWeight: '600', color: Colors.n700 },
  dayChipTextActive: { color: Colors.primary },
  slotRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r8, borderWidth: 1, borderColor: Colors.n200, padding: 12, marginBottom: 8, gap: 8 },
  slotDay:        { fontSize: 13, fontWeight: '700', color: Colors.n900, width: 32 },
  slotSep:        { fontSize: 12, color: Colors.n500 },
  timeBtn:        { flex: 1, backgroundColor: Colors.n50, borderRadius: Radius.r8, borderWidth: 1, borderColor: Colors.n300, paddingVertical: 8, alignItems: 'center' },
  timeBtnText:    { fontSize: 14, fontWeight: '700', color: Colors.primary },
  emptySlots:     { alignItems: 'center', paddingVertical: 16 },
  emptySlotsText: { fontSize: 13, color: Colors.n400 },
});
