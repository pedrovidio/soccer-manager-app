import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../common/theme';
import { maskCurrency, parseCurrency } from '../../common/masks';
import { groupApi } from '../services/groupApi';
import { useAuthStore } from '../../auth/useAuthStore';
import { CreateGroupFormData, AthleteSearchResult } from '../groupTypes';

// ─── Constants ───────────────────────────────────────────────────────────────


const INITIAL: CreateGroupFormData = {
  name: '', description: '', pixKey: '', monthlyFee: '', spotFee: '', teamNames: ['Time 1', 'Time 2'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseApiError(e: any): string {
  const data = e?.response?.data;
  if (data?.errors?.length) return data.errors.map((x: any) => x.message).join('\n');
  if (data?.error) return data.error;
  if (e?.message) return e.message;
  return 'Não foi possível completar a operação.';
}

function positionLabel(pos: string) {
  const map: Record<string, string> = {
    Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Forward: 'ATA',
  };
  return map[pos] ?? pos.slice(0, 3).toUpperCase();
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateGroupScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<CreateGroupFormData>(INITIAL);
  const [selected, setSelected] = useState<AthleteSearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AthleteSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const athleteId = useAuthStore((st) => st.athleteId) ?? '';
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (field: keyof CreateGroupFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Step 1 validation ──
  function validateStep1(): string | null {
    if (!form.name.trim())           return 'Informe o nome do grupo.';
    if (form.name.trim().length < 3) return 'O nome deve ter ao menos 3 caracteres.';
    if (form.monthlyFee && parseCurrency(form.monthlyFee) === undefined) {
      return 'Mensalidade deve ser um valor numérico.';
    }
    if (form.spotFee && parseCurrency(form.spotFee) === undefined) {
      return 'Valor do avulso deve ser um valor numérico.';
    }
    const teamNames = form.teamNames.map((name) => name.trim()).filter(Boolean);
    if (teamNames.length < 2) return 'Informe pelo menos dois nomes de times.';
    return null;
  }

  // ── Athlete search with debounce ──
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.trim().length < 2) { setResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await groupApi.searchAthletes(text.trim());
        // exclude self and already selected
        setResults(data.filter(
          (a) => a.id !== athleteId && !selected.some((s) => s.id === a.id)
        ));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [athleteId, selected]);

  function toggleAthlete(athlete: AthleteSearchResult) {
    setSelected((prev) =>
      prev.some((a) => a.id === athlete.id)
        ? prev.filter((a) => a.id !== athlete.id)
        : [...prev, athlete]
    );
    // remove from results list once selected
    setResults((prev) => prev.filter((a) => a.id !== athlete.id));
  }

  function removeSelected(id: string) {
    setSelected((prev) => prev.filter((a) => a.id !== id));
  }

  // ── Final submit ──
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const monthlyFeeNum = parseCurrency(form.monthlyFee);
      const spotFeeNum = parseCurrency(form.spotFee);
      const teamNames = form.teamNames.map((name) => name.trim()).filter(Boolean);

      const group = await groupApi.create({
        adminId:               athleteId,
        name:                  form.name.trim(),
        description:           form.description.trim() || undefined,
        pixKey:                form.pixKey.trim()       || undefined,
        monthlyFee:            monthlyFeeNum,
        spotFee:               spotFeeNum,
        teamNames,
      });

      // Send invites in parallel — ignore individual failures
      if (selected.length > 0) {
        await Promise.allSettled(
          selected.map((a) => groupApi.inviteAthlete(group.id, athleteId, a.id))
        );
      }

      const inviteMsg = selected.length > 0
        ? ` ${selected.length} convite(s) enviado(s).`
        : '';

      Alert.alert('Grupo criado!', `"${group.name}" foi criado com sucesso.${inviteMsg}`, [
        { text: 'OK', onPress: () => router.replace('/groups' as any) },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', parseApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => step === 2 ? setStep(1) : router.back()}
          >
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>
              {step === 1 ? 'Criar grupo' : 'Adicionar participantes'}
            </Text>
            <Text style={s.headerSub}>
              {step === 1 ? 'Passo 1 de 2 — Configurações' : 'Passo 2 de 2 — Convites'}
            </Text>
          </View>
          {/* Progress dots */}
          <View style={s.dots}>
            <View style={[s.dot, step >= 1 ? s.dotActive : null]} />
            <View style={[s.dot, step >= 2 ? s.dotActive : null]} />
          </View>
        </View>

        {step === 1 ? (
          <Step1
            form={form}
            set={set}
            onNext={() => {
              const err = validateStep1();
              if (err) { Alert.alert('Atenção', err); return; }
              setStep(2);
            }}
          />
        ) : (
          <Step2
            query={query}
            results={results}
            selected={selected}
            searching={searching}
            submitting={submitting}
            onSearch={handleSearch}
            onToggle={toggleAthlete}
            onRemove={removeSelected}
            onSubmit={handleSubmit}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Step 1: Group Config ─────────────────────────────────────────────────────

function Step1({
  form, set, onNext,
}: {
  form: CreateGroupFormData;
  set: (f: keyof CreateGroupFormData, v: any) => void;
  onNext: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.stepTitle}>Configurações do grupo</Text>
      <Text style={s.stepSub}>Resumo das configurações do grupo</Text>

      {/* Identificação */}
      <Field label="Nome do grupo *">
        <TextInput
          style={s.input}
          placeholder="Ex: Pelada da Sexta"
          placeholderTextColor={Colors.n400}
          value={form.name}
          onChangeText={(v) => set('name', v)}
          maxLength={60}
        />
      </Field>

      <Field label="Descrição">
        <TextInput
          style={[s.input, s.inputMultiline]}
          placeholder="Conte um pouco sobre o grupo (opcional)"
          placeholderTextColor={Colors.n400}
          value={form.description}
          onChangeText={(v) => set('description', v)}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
      </Field>

      {/* Financeiro */}
      <View style={s.divider} />
      <Text style={s.sectionLabel}>Financeiro</Text>

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="Valor Mensal">
            <TextInput
              style={s.input}
              placeholder="0,00"
              placeholderTextColor={Colors.n400}
              keyboardType="decimal-pad"
              value={form.monthlyFee}
              onChangeText={(v) => set('monthlyFee', maskCurrency(v))}
            />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Valor Avulso">
            <TextInput
              style={s.input}
              placeholder="0,00"
              placeholderTextColor={Colors.n400}
              keyboardType="decimal-pad"
              value={form.spotFee}
              onChangeText={(v) => set('spotFee', maskCurrency(v))}
            />
          </Field>
        </View>
      </View>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Field label="Chave PIX">
            <TextInput
              style={s.input}
              placeholder="CPF, e-mail ou tel."
              placeholderTextColor={Colors.n400}
              autoCapitalize="none"
              value={form.pixKey}
              onChangeText={(v) => set('pixKey', v)}
            />
          </Field>
        </View>
      </View>

      <View style={s.divider} />
      <Text style={s.sectionLabel}>Times</Text>
      <Text style={s.sectionDesc}>Nomes usados automaticamente no sorteio</Text>
      {[0, 1].map((index) => (
        <Field key={index} label={`Time ${index + 1} *`}>
          <TextInput
            style={s.input}
            placeholder={`Time ${index + 1}`}
            placeholderTextColor={Colors.n400}
            value={form.teamNames[index] ?? ''}
            onChangeText={(value) => {
              const next = [...form.teamNames];
              next[index] = value;
              set('teamNames', next);
            }}
            maxLength={40}
          />
        </Field>
      ))}

      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Continuar</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Step 2: Invite Athletes ──────────────────────────────────────────────────

function Step2({
  query, results, selected, searching, submitting,
  onSearch, onToggle, onRemove, onSubmit,
}: {
  query: string;
  results: AthleteSearchResult[];
  selected: AthleteSearchResult[];
  searching: boolean;
  submitting: boolean;
  onSearch: (text: string) => void;
  onToggle: (a: AthleteSearchResult) => void;
  onRemove: (id: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>

      {/* ── Selected chips ── */}
      {selected.length > 0 && (
        <View style={s.chipsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsScroll}>
            {selected.map((a) => (
              <View key={a.id} style={s.chip}>
                <View style={s.chipAvatar}>
                  <Text style={s.chipAvatarText}>{a.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={s.chipName} numberOfLines={1}>{a.name.split(' ')[0]}</Text>
                <TouchableOpacity onPress={() => onRemove(a.id)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                  <Ionicons name="close-circle" size={16} color={Colors.n400} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Search bar ── */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.n400} style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nome..."
          placeholderTextColor={Colors.n400}
          value={query}
          onChangeText={onSearch}
          autoFocus
        />
        {searching && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {/* ── Results list ── */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={results.length === 0 ? s.emptyList : { paddingBottom: 100 }}
        ListEmptyComponent={
          query.length >= 2 && !searching ? (
            <View style={s.emptyWrap}>
              <Ionicons name="person-outline" size={36} color={Colors.n300} />
              <Text style={s.emptyText}>Nenhum atleta encontrado</Text>
            </View>
          ) : query.length < 2 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="people-outline" size={36} color={Colors.n300} />
              <Text style={s.emptyText}>Digite o nome para buscar atletas</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isSelected = selected.some((a) => a.id === item.id);
          return (
            <TouchableOpacity
              style={[s.athleteRow, isSelected ? s.athleteRowSelected : null]}
              onPress={() => onToggle(item)}
              activeOpacity={0.7}
            >
              <View style={s.athleteAvatar}>
                <Text style={s.athleteAvatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.athleteName}>{item.name}</Text>
                <View style={s.athleteMeta}>
                  <View style={s.posTag}>
                    <Text style={s.posTagText}>{positionLabel(item.position)}</Text>
                  </View>
                  <Text style={s.athleteOverall}>OVR {item.overall}</Text>
                </View>
              </View>
              <View style={[s.checkCircle, isSelected ? s.checkCircleActive : null]}>
                {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Bottom action bar ── */}
      <View style={s.actionBar}>
        <View style={s.actionInfo}>
          <Text style={s.actionCount}>
            {selected.length > 0 ? `${selected.length} selecionado(s)` : 'Nenhum selecionado'}
          </Text>
          <Text style={s.actionHint}>Você pode convidar mais depois</Text>
        </View>
        <TouchableOpacity
          style={[s.actionBtn, submitting ? s.actionBtnDisabled : null]}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <Text style={s.actionBtnText}>
                {selected.length > 0 ? 'Criar e convidar' : 'Criar grupo'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.n50 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  backIcon:         { fontSize: 18, color: Colors.n900 },
  headerTitle:      { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  headerSub:        { fontSize: 11, color: Colors.n500 },
  dots:             { flexDirection: 'row', gap: 5 },
  dot:              { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.n200 },
  dotActive:        { backgroundColor: Colors.primary },

  // Step 1
  scroll:           { padding: Spacing.lg, paddingBottom: 40 },
  stepTitle:        { fontSize: 18, fontWeight: '800', color: Colors.n900, marginBottom: 2 },
  stepSub:          { fontSize: 12, color: Colors.n500, marginBottom: 20 },
  field:            { marginBottom: 12 },
  fieldLabel:       { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 5 },
  input:            { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  inputMultiline:   { minHeight: 80, textAlignVertical: 'top' },
  row:              { flexDirection: 'row', alignItems: 'flex-start' },
  divider:          { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionLabel:     { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 4 },
  sectionDesc:      { fontSize: 12, color: Colors.n500, marginBottom: 12 },
  modeCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1.5, borderColor: Colors.n200, padding: 14, marginBottom: 8, gap: 12 },
  modeCardActive:   { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  modeIcon:         { fontSize: 22 },
  modeLabel:        { fontSize: 14, fontWeight: '700', color: Colors.n900 },
  modeLabelActive:  { color: Colors.primary },
  modeDesc:         { fontSize: 11, color: Colors.n500, marginTop: 2 },
  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.n300, alignItems: 'center', justifyContent: 'center' },
  radioActive:      { borderColor: Colors.primary },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  btn:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 15, marginTop: 16 },
  btnText:          { color: Colors.white, fontSize: 15, fontWeight: '700' },

  // Step 2 — chips
  chipsWrap:        { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, paddingVertical: 10 },
  chipsScroll:      { paddingHorizontal: Spacing.lg, gap: 8 },
  chip:             { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.r999, paddingVertical: 6, paddingLeft: 6, paddingRight: 10, gap: 6, maxWidth: 130 },
  chipAvatar:       { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  chipAvatarText:   { fontSize: 9, fontWeight: '800', color: Colors.white },
  chipName:         { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.primary },

  // Step 2 — search
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, paddingHorizontal: Spacing.lg, paddingVertical: 10 },
  searchInput:      { flex: 1, fontSize: 15, color: Colors.n900 },

  // Step 2 — results
  emptyList:        { flex: 1 },
  emptyWrap:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 8 },
  emptyText:        { fontSize: 13, color: Colors.n500 },
  athleteRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.n100, gap: 12, backgroundColor: Colors.white },
  athleteRowSelected: { backgroundColor: Colors.primaryLight },
  athleteAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.n200, alignItems: 'center', justifyContent: 'center' },
  athleteAvatarText:{ fontSize: 14, fontWeight: '800', color: Colors.n700 },
  athleteName:      { fontSize: 14, fontWeight: '600', color: Colors.n900 },
  athleteMeta:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  posTag:           { backgroundColor: Colors.n100, borderRadius: Radius.r4, paddingHorizontal: 6, paddingVertical: 2 },
  posTagText:       { fontSize: 10, fontWeight: '700', color: Colors.n700 },
  athleteOverall:   { fontSize: 11, color: Colors.n500 },
  checkCircle:      { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.n300, alignItems: 'center', justifyContent: 'center' },
  checkCircleActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },

  // Step 2 — action bar
  actionBar:        { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.n200, paddingHorizontal: Spacing.lg, paddingVertical: 12, gap: 12 },
  actionInfo:       { flex: 1 },
  actionCount:      { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  actionHint:       { fontSize: 11, color: Colors.n500 },
  actionBtn:        { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingHorizontal: 20, paddingVertical: 12 },
  actionBtnDisabled:{ opacity: 0.7 },
  actionBtnText:    { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
