import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../auth/useAuthStore';
import { useHomeDashboard } from '../../home/hooks/useHomeDashboard';
import { BottomNav, NavTab } from '../../common/components/BottomNav';
import { Colors, Radius, Spacing } from '../../common/theme';
import { getFullImageUrl } from '../../../lib/imageUrl';

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'Goleiro',
  Defender:   'Zagueiro',
  Midfielder: 'Meia',
  Forward:    'Atacante',
};

const ATTRS: { key: string; label: string }[] = [
  { key: 'pace',      label: 'Velocidade' },
  { key: 'shooting',  label: 'Finalização' },
  { key: 'passing',   label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defense',   label: 'Defesa' },
  { key: 'physical',  label: 'Físico' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  'Ativo':        { bg: Colors.successLight, color: Colors.successDark },
  'Lesionado':    { bg: Colors.warningLight, color: Colors.warningDark },
  'Inadimplente': { bg: Colors.errorLight,   color: Colors.errorDark },
};

export default function ProfileScreen() {
  const router    = useRouter();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const authName  = useAuthStore((s) => s.name);
  const logout    = useAuthStore((s) => s.logout);

  const { dashboard, isLoading } = useHomeDashboard(athleteId);

  const name     = dashboard?.name     ?? authName ?? '—';
  const overall  = dashboard?.overall  ?? 0;
  const position = dashboard?.position ?? '';
  const status   = dashboard?.status   ?? 'Ativo';
  const stats    = dashboard?.averageStats;

  const initials     = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const overallColor = overall >= 70 ? Colors.success : overall >= 50 ? Colors.warning : Colors.error;
  const statusStyle  = STATUS_STYLE[status] ?? STATUS_STYLE['Ativo'];
  const photoUrl     = getFullImageUrl(dashboard?.photoUrl);

  function confirmLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/login'); },
      },
    ]);
  }

  if (isLoading && !dashboard) {
    return (
      <View style={[s.safe, s.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* HERO */}
        <View style={s.heroCard}>
          {/* botão editar */}
          <TouchableOpacity style={s.editBtn} onPress={() => router.push('/edit-profile' as any)}>
            <Ionicons name="create-outline" size={18} color={Colors.n700} />
          </TouchableOpacity>

          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={s.avatar} />
          ) : (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
          )}
          <Text style={s.name}>{name}</Text>
          <Text style={s.positionText}>{POSITION_LABEL[position] ?? position}</Text>
          <View style={s.heroRow}>
            <View style={[s.ovrBadge, { backgroundColor: overallColor }]}>
              <Text style={s.ovrNum}>{overall}</Text>
              <Text style={s.ovrLbl}>OVR</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[s.statusText, { color: statusStyle.color }]}>{status}</Text>
            </View>
          </View>
        </View>

        {/* ATRIBUTOS */}
        {stats && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Atributos técnicos</Text>
            {ATTRS.map(({ key, label }) => {
              const val = (stats as any)[key] ?? 0;
              const barColor = val >= 70 ? Colors.success : val >= 50 ? Colors.warning : Colors.error;
              return (
                <View key={key} style={s.attrRow}>
                  <Text style={s.attrLabel}>{label}</Text>
                  <View style={s.attrBarBg}>
                    <View style={[s.attrBarFill, { width: `${Math.min(val, 100)}%` as any, backgroundColor: barColor }]} />
                  </View>
                  <Text style={s.attrVal}>{val}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* AÇÕES */}
        <View style={s.card}>
          <TouchableOpacity style={s.actionRow} onPress={() => router.push('/groups' as any)}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <Text style={s.actionLabel}>Meus grupos</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.n400} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.actionRow} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={[s.actionLabel, { color: Colors.error }]}>Sair</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <BottomNav active={'profile' as NavTab} />
    </View>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.n50 },
  center:       { justifyContent: 'center', alignItems: 'center' },
  scroll:       { padding: Spacing.lg, paddingBottom: 32, gap: 12 },

  heroCard:     { backgroundColor: Colors.white, borderRadius: Radius.r16, borderWidth: 0.5, borderColor: Colors.n200, alignItems: 'center', paddingVertical: 28, paddingHorizontal: Spacing.lg, gap: 6 },
  editBtn:      { position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  avatar:       { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText:   { fontSize: 26, fontWeight: '800', color: Colors.primary },
  name:         { fontSize: 20, fontWeight: '800', color: Colors.n900 },
  positionText: { fontSize: 13, color: Colors.n500 },
  heroRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  ovrBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.r999, paddingHorizontal: 14, paddingVertical: 6 },
  ovrNum:       { fontSize: 18, fontWeight: '800', color: Colors.white },
  ovrLbl:       { fontSize: 11, fontWeight: '600', color: Colors.white },
  statusBadge:  { borderRadius: Radius.r999, paddingHorizontal: 12, paddingVertical: 6 },
  statusText:   { fontSize: 12, fontWeight: '700' },

  card:         { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 0.5, borderColor: Colors.n200, padding: Spacing.lg },
  cardTitle:    { fontSize: 13, fontWeight: '800', color: Colors.n900, marginBottom: 14 },

  attrRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  attrLabel:    { fontSize: 12, color: Colors.n500, width: 80 },
  attrBarBg:    { flex: 1, height: 6, backgroundColor: Colors.n200, borderRadius: Radius.r999, overflow: 'hidden' },
  attrBarFill:  { height: 6, borderRadius: Radius.r999 },
  attrVal:      { fontSize: 12, fontWeight: '700', color: Colors.n900, width: 26, textAlign: 'right' },

  actionRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  actionLabel:  { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.n800 },
  divider:      { height: 0.5, backgroundColor: Colors.n200, marginVertical: 12 },
});
