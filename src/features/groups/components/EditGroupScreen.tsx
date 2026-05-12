import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Radius, Spacing } from '../../common/theme';
import { maskCurrency } from '../../common/masks';
import { groupApi } from '../services/groupApi';
import { useAuthStore } from '../../auth/useAuthStore';
import { CreateGroupFormData, GroupResponse } from '../groupTypes';
import { BackButton } from '../../common/components/BackButton';

function parseApiError(e: any): string {
  const data = e?.response?.data;
  if (data?.errors?.length) return data.errors.map((x: any) => x.message).join('\n');
  if (data?.error) return data.error;
  if (e?.message) return e.message;
  return 'Não foi possível salvar as alterações.';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function EditGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((st) => st.athleteId) ?? '';

  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [form, setForm] = useState<CreateGroupFormData>({
    name: '', description: '', pixKey: '', monthlyFee: '', spotFee: '', teamNames: ['Time 1', 'Time 2'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const set = (field: keyof CreateGroupFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Load group data
  useEffect(() => {
    if (!groupId) return;
    groupApi.findById(groupId)
      .then((g) => {
        setGroup(g);
        setIsAdmin(g.adminIds.includes(athleteId));
        setForm({
          name:        g.name,
          description: g.description ?? '',
          pixKey:      g.pixKey ?? '',
          monthlyFee:  g.monthlyFee > 0 ? maskCurrency(g.monthlyFee.toFixed(2).replace('.', '')) : '',
          spotFee:     g.spotFee > 0 ? maskCurrency(g.spotFee.toFixed(2).replace('.', '')) : '',
          teamNames:   [...(g.teamNames ?? ['Time 1', 'Time 2']), 'Time 2'].slice(0, 2),
        });
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar o grupo.', [
        { text: 'OK', onPress: () => router.back() },
      ]))
      .finally(() => setLoading(false));
  }, [groupId]);

  function validate(): string | null {
    if (!form.name.trim())           return 'Informe o nome do grupo.';
    if (form.name.trim().length < 3) return 'O nome deve ter ao menos 3 caracteres.';
    if (form.monthlyFee && !form.monthlyFee.replace(/\D/g, '')) {
      return 'Mensalidade deve ser um valor numérico.';
    }
    if (form.spotFee && !form.spotFee.replace(/\D/g, '')) {
      return 'Valor do avulso deve ser um valor numérico.';
    }
    const teamNames = form.teamNames.map((name) => name.trim()).filter(Boolean);
    if (teamNames.length < 2) return 'Informe pelo menos dois nomes de times.';
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { Alert.alert('Atenção', err); return; }

    setSaving(true);
    try {
      await groupApi.update(groupId!, {
        requesterId: athleteId,
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        pixKey:      form.pixKey.trim()       || undefined,
        monthlyFee:  form.monthlyFee ? Number(form.monthlyFee.replace(/\D/g, '')) / 100 : 0,
        spotFee:     form.spotFee ? Number(form.spotFee.replace(/\D/g, '')) / 100 : 0,
        teamNames:   form.teamNames.map((name) => name.trim()).filter(Boolean),
      });
      Alert.alert('Salvo!', 'As alterações foram salvas com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', parseApiError(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <BackButton />
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Editar grupo</Text>
            <Text style={s.headerSub} numberOfLines={1}>{group?.name}</Text>
          </View>
          {!isAdmin && (
            <View style={s.readOnlyBadge}>
              <Text style={s.readOnlyText}>Somente leitura</Text>
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── IDENTIFICAÇÃO ── */}
          <Text style={s.sectionLabel}>Identificação</Text>

          <Field label="Nome do grupo *">
            <TextInput
              style={[s.input, !isAdmin ? s.inputDisabled : null]}
              placeholder="Ex: Pelada da Sexta"
              placeholderTextColor={Colors.n400}
              value={form.name}
              onChangeText={(v) => set('name', v)}
              maxLength={60}
              editable={isAdmin}
            />
          </Field>

          <Field label="Descrição">
            <TextInput
              style={[s.input, s.inputMultiline, !isAdmin ? s.inputDisabled : null]}
              placeholder="Conte um pouco sobre o grupo (opcional)"
              placeholderTextColor={Colors.n400}
              value={form.description}
              onChangeText={(v) => set('description', v)}
              multiline
              numberOfLines={3}
              maxLength={200}
              editable={isAdmin}
            />
          </Field>

          {/* ── FINANCEIRO ── */}
          <View style={s.divider} />
          <Text style={s.sectionLabel}>Financeiro</Text>

          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Valor Mensal">
                <TextInput
                  style={[s.input, !isAdmin ? s.inputDisabled : null]}
                  placeholder="0,00"
                  placeholderTextColor={Colors.n400}
                  keyboardType="decimal-pad"
                  value={form.monthlyFee}
                  onChangeText={(v) => set('monthlyFee', maskCurrency(v))}
                  editable={isAdmin}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Valor Avulso">
                <TextInput
                  style={[s.input, !isAdmin ? s.inputDisabled : null]}
                  placeholder="0,00"
                  placeholderTextColor={Colors.n400}
                  keyboardType="decimal-pad"
                  value={form.spotFee}
                  onChangeText={(v) => set('spotFee', maskCurrency(v))}
                  editable={isAdmin}
                />
              </Field>
            </View>
          </View>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Field label="Chave PIX">
                <TextInput
                  style={[s.input, !isAdmin ? s.inputDisabled : null]}
                  placeholder="CPF, e-mail ou tel."
                  placeholderTextColor={Colors.n400}
                  autoCapitalize="none"
                  value={form.pixKey}
                  onChangeText={(v) => set('pixKey', v)}
                  editable={isAdmin}
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
                style={[s.input, !isAdmin ? s.inputDisabled : null]}
                placeholder={`Time ${index + 1}`}
                placeholderTextColor={Colors.n400}
                value={form.teamNames[index] ?? ''}
                onChangeText={(value) => {
                  const next = [...form.teamNames];
                  next[index] = value;
                  set('teamNames', next);
                }}
                maxLength={40}
                editable={isAdmin}
              />
            </Field>
          ))}

          {/* ── INFO MEMBROS ── */}
          {group && (
            <>
              <View style={s.divider} />
              <Text style={s.sectionLabel}>Membros</Text>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Administradores</Text>
                <Text style={s.infoValue}>{group.adminIds.length}</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Mensalistas</Text>
                <Text style={s.infoValue}>{group.memberIds.length}</Text>
              </View>
            </>
          )}

          {/* ── SAVE BUTTON ── */}
          {isAdmin && (
            <TouchableOpacity
              style={[s.btn, saving ? s.btnDisabled : null]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={s.btnText}>Salvar alterações</Text>
              }
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.n50 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  backIcon:         { fontSize: 18, color: Colors.n900 },
  headerTitle:      { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  headerSub:        { fontSize: 11, color: Colors.n500 },
  readOnlyBadge:    { backgroundColor: Colors.warningLight, borderRadius: Radius.r8, paddingHorizontal: 8, paddingVertical: 4 },
  readOnlyText:     { fontSize: 11, fontWeight: '600', color: Colors.warningDark },
  scroll:           { padding: Spacing.lg, paddingBottom: 40 },
  sectionLabel:     { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 4 },
  divider:          { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionDesc:      { fontSize: 12, color: Colors.n500, marginBottom: 12 },
  field:            { marginBottom: 12 },
  fieldLabel:       { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 5 },
  input:            { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  inputMultiline:   { minHeight: 80, textAlignVertical: 'top' },
  inputDisabled:    { backgroundColor: Colors.n100, color: Colors.n500 },
  row:              { flexDirection: 'row', alignItems: 'flex-start' },
  infoRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.n100 },
  infoLabel:        { fontSize: 13, color: Colors.n700 },
  infoValue:        { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  btn:              { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  btnDisabled:      { opacity: 0.7 },
  btnText:          { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
