import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import { Badge, Button, Card, Divider } from '../components/UI';

const members = [
  { id: '1', name: 'Pedro (Você)', role: 'Administrador', paymentStatus: 'paid' as const },
  { id: '2', name: 'Lucas Silva', role: 'Membro', paymentStatus: 'paid' as const },
  { id: '3', name: 'Rafael Souza', role: 'Membro', paymentStatus: 'paid' as const },
  { id: '4', name: 'Bruno Lima', role: 'Membro', paymentStatus: 'pending' as const },
  { id: '5', name: 'Carlos Eduardo', role: 'Membro', paymentStatus: 'overdue' as const },
];

const paymentBadge = {
  paid: { label: 'Pago', variant: 'success' as const },
  pending: { label: 'Pendente', variant: 'warning' as const },
  overdue: { label: 'Inadimplente', variant: 'danger' as const },
};

const TABS = ['Membros', 'Partidas', 'Financeiro', 'Configurações'];

export default function GroupDetailScreen() {
  const [tab, setTab] = useState('Membros');

  return (
    <View style={styles.container}>
      {/* Group Header */}
      <View style={styles.header}>
        <View style={styles.groupLogo}>
          <Ionicons name="shield" size={40} color={colors.white} />
        </View>
        <Text style={[typography.h2, { color: colors.white, marginTop: spacing.sm }]}>Resenha FC</Text>
        <Text style={[typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>Campo · São Paulo, SP</Text>
        <View style={styles.adminRow}>
          <Ionicons name="star" size={12} color={colors.orange} />
          <Text style={[typography.caption, { color: colors.orange, marginLeft: 4, fontWeight: '600' }]}>Administrador</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[{ label: 'Membros', value: '24' }, { label: 'Partidas', value: '—' }, { label: 'Financeiro', value: '—' }, { label: 'Configurações', value: '—' }].slice(0, 1).map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name="people" size={20} color={colors.white} />
              <Text style={[typography.h3, { color: colors.white }]}>{s.value}</Text>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.7)' }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {tab === 'Membros' && (
          <Card>
            <Text style={[typography.h3, { color: colors.black, marginBottom: spacing.sm }]}>Membros</Text>
            {members.map((m, i) => (
              <View key={m.id}>
                <View style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{m.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: colors.black, fontWeight: '600' }]}>{m.name}</Text>
                    <Text style={[typography.caption, { color: colors.gray600 }]}>{m.role}</Text>
                  </View>
                  <Badge label={paymentBadge[m.paymentStatus].label} variant={paymentBadge[m.paymentStatus].variant} />
                </View>
                {i < members.length - 1 && <Divider />}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button label="Convidar" variant="secondary" style={{ flex: 1 }} />
        <Button label="Criar partida" style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    padding: spacing.lg,
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  groupLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.xl },
  statItem: { alignItems: 'center', gap: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 12, color: colors.gray600 },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { fontWeight: '700', color: colors.gray600 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});
