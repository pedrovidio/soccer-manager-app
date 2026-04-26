import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { athleteApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { AthleteDashboard } from '../types';
import { colors, typography, spacing, radius } from '../theme';
import { Card, SectionTitle, StatBar } from '../components/UI';

const levelLabel: Record<string, string> = {
  PROFESSIONAL: 'Profissional',
  AMATEUR: 'Amador',
  CASUAL: 'Casual',
};

export default function ProfileScreen({ navigation }: any) {
  const { athlete, logout, refreshAthlete } = useAuth();

  const { data: dashboard, loading, refetch } = useFetch<AthleteDashboard>(
    () => athleteApi.dashboard(athlete!.id),
    [athlete?.id],
  );

  const onRefresh = useCallback(() => { refetch(); refreshAthlete(); }, [refetch, refreshAthlete]);

  const initials = athlete?.name
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '?';

  const stats = [
    { label: 'Velocidade',  value: athlete?.statsPace      ?? 0 },
    { label: 'Finalização', value: athlete?.statsShooting  ?? 0 },
    { label: 'Passe',       value: athlete?.statsPassing   ?? 0 },
    { label: 'Drible',      value: athlete?.statsDribbling ?? 0 },
    { label: 'Marcação',    value: athlete?.statsDefense   ?? 0 },
    { label: 'Físico',      value: athlete?.statsPhysical  ?? 0 },
  ];

  const overall = dashboard?.averageStats?.overall ?? 0;
  const overallColor = overall >= 80 ? colors.green : overall >= 70 ? colors.orange : colors.red;

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroInfo}>
          <Text style={[typography.h2, { color: colors.white }]} numberOfLines={1}>
            {athlete?.name ?? '—'}
          </Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.8)' }]}>
            {athlete?.position} · {athlete?.age} anos
          </Text>
          <Text style={[typography.caption, { color: 'rgba(255,255,255,0.6)' }]}>
            {levelLabel[athlete?.footballLevel ?? ''] ?? '—'}
          </Text>
        </View>

        <View style={[styles.overallCircle, { backgroundColor: overallColor }]}>
          <Text style={styles.overallLabel}>Overall</Text>
          <Text style={styles.overallValue}>{overall}</Text>
        </View>
      </View>

      {/* Inadimplência */}
      {(athlete?.financialDebt ?? 0) > 0 && (
        <View style={styles.debtBanner}>
          <Ionicons name="warning" size={16} color={colors.red} />
          <Text style={[typography.caption, { color: colors.red, marginLeft: spacing.xs, flex: 1 }]}>
            Pendência financeira: R$ {athlete!.financialDebt.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      )}

      {/* Career Stats */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
      ) : (
        <View style={styles.careerRow}>
          {[
            { label: 'Jogos',   value: dashboard?.totalMatches ?? 0 },
            { label: 'Overall', value: dashboard?.averageStats?.overall ?? 0 },
            { label: 'Recentes', value: dashboard?.recentMatches?.length ?? 0 },
          ].map((s) => (
            <View key={s.label} style={styles.careerItem}>
              <Text style={[typography.h2, { color: colors.black }]}>{s.value}</Text>
              <Text style={[typography.caption, { color: colors.gray600 }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Attributes */}
      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
        <SectionTitle title="Atributos" />
        <Card>
          {stats.map((s) => <StatBar key={s.label} label={s.label} value={s.value} />)}
        </Card>
      </View>

      {/* Menu */}
      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
        <Card>
          {[
            { icon: 'shield-checkmark-outline', label: 'Autoavaliação',  onPress: () => navigation.navigate('Assessment'),    show: true },
            { icon: 'notifications-outline',    label: 'Notificações',   onPress: () => navigation.navigate('Notifications'), show: true },
            { icon: 'grid-outline',             label: 'Quadras',        onPress: () => navigation.navigate('Venues'),        show: true },
            { icon: 'log-out-outline',          label: 'Sair',           onPress: handleLogout, danger: true, show: true },
          ].filter((i) => i.show).map((item, idx, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, idx > 0 && styles.menuItemBorder]}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon as any} size={20} color={(item as any).danger ? colors.red : colors.gray600} />
              <Text style={[typography.body, { color: (item as any).danger ? colors.red : colors.black, flex: 1, marginLeft: spacing.sm }]}>
                {item.label}
              </Text>
              {!(item as any).danger && <Ionicons name="chevron-forward" size={16} color={colors.gray600} />}
            </TouchableOpacity>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primaryDark, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '700' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.primary, borderRadius: radius.full,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  heroInfo: { flex: 1 },
  overallCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  overallLabel: { color: colors.white, fontSize: 9, fontWeight: '600' },
  overallValue: { color: colors.white, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  debtBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEE2E2', padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  careerRow: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray200,
  },
  careerItem: { flex: 1, alignItems: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: colors.gray200 },
});
