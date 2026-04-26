import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import { Badge, Button, Card, OverallBadge } from '../components/UI';

const teamA = [
  { name: 'Pedro (Você)', position: 'Meia', overall: 82 },
  { name: 'Lucas Silva', position: 'Atacante', overall: 80 },
  { name: 'Rafael Souza', position: 'Zagueiro', overall: 76 },
  { name: 'Gabriel Lima', position: 'Lateral', overall: 75 },
  { name: 'Diego Costa', position: 'Volante', overall: 74 },
];

const teamB = [
  { name: 'Marcos Vini', position: 'Atacante', overall: 79 },
  { name: 'Felipe Neto', position: 'Meia', overall: 77 },
  { name: 'André Luiz', position: 'Zagueiro', overall: 75 },
  { name: 'Carlos Edu', position: 'Lateral', overall: 73 },
  { name: 'Bruno Lima', position: 'Goleiro', overall: 72 },
];

const TABS = ['Detalhes', 'Times', 'Financeiro', 'Chat'];

export default function MatchDetailScreen() {
  const [tab, setTab] = useState('Times');

  return (
    <View style={styles.container}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.black} />
            <Text style={[typography.body, { color: colors.black }]}>Sáb, 25 Mai · 16:00</Text>
          </TouchableOpacity>
          <Badge label="Confirmado" variant="success" />
        </View>
        <Text style={[typography.body, { color: colors.gray600 }]}>Campo Arena Show · Rua das Flores, 123 – SP</Text>

        <View style={styles.vsRow}>
          <View style={styles.teamBlock}>
            <View style={styles.teamIcon}><Ionicons name="shield" size={28} color={colors.primary} /></View>
            <Text style={[typography.caption, { color: colors.black, marginTop: 4 }]}>Resenha FC</Text>
          </View>
          <Text style={[typography.h2, { color: colors.gray600 }]}>VS</Text>
          <View style={styles.teamBlock}>
            <View style={[styles.teamIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="shield-outline" size={28} color={colors.orange} />
            </View>
            <Text style={[typography.caption, { color: colors.black, marginTop: 4 }]}>Amigos FC</Text>
          </View>
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

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {tab === 'Times' && (
          <>
            <TeamSection title="Time Azul" avgOverall={78} players={teamA} color={colors.primary} />
            <TeamSection title="Time Branco" avgOverall={77} players={teamB} color={colors.gray600} />
          </>
        )}
        {tab === 'Detalhes' && (
          <Card>
            <Text style={[typography.h3, { color: colors.black, marginBottom: spacing.sm }]}>Informações da Partida</Text>
            {[
              { label: 'Data', value: 'Sábado, 25 Mai · 16:00' },
              { label: 'Local', value: 'Campo Arena Show' },
              { label: 'Tipo', value: 'Campo' },
              { label: 'Vagas', value: '14 / 16' },
              { label: 'Overall mínimo', value: '70' },
            ].map((item) => (
              <View key={item.label} style={styles.detailRow}>
                <Text style={[typography.body, { color: colors.gray600 }]}>{item.label}</Text>
                <Text style={[typography.body, { color: colors.black, fontWeight: '600' }]}>{item.value}</Text>
              </View>
            ))}
          </Card>
        )}
        {tab === 'Financeiro' && (
          <Card>
            <Text style={[typography.h3, { color: colors.black, marginBottom: spacing.sm }]}>Financeiro</Text>
            <Text style={[typography.body, { color: colors.gray600 }]}>Valor da partida: R$ 20,00</Text>
            <Badge label="Pendente" variant="warning" style={{ marginTop: spacing.sm }} />
          </Card>
        )}
        {tab === 'Chat' && (
          <Card>
            <Text style={[typography.body, { color: colors.gray600, textAlign: 'center' }]}>Chat da partida em breve...</Text>
          </Card>
        )}
      </ScrollView>

      {/* Check-in CTA */}
      <View style={styles.footer}>
        <Button label="Fazer Check-in" fullWidth />
        <Text style={[typography.caption, { color: colors.gray600, textAlign: 'center', marginTop: spacing.xs }]}>
          Check-in disponível até 15:30
        </Text>
      </View>
    </View>
  );
}

function TeamSection({ title, avgOverall, players, color }: { title: string; avgOverall: number; players: typeof teamA; color: string }) {
  return (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={styles.teamHeader}>
        <Text style={[typography.h3, { color }]}>{title}</Text>
        <Text style={[typography.caption, { color: colors.gray600 }]}>Overall médio {avgOverall}</Text>
      </View>
      {players.map((p) => (
        <View key={p.name} style={styles.playerRow}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerAvatarText}>{p.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.body, { color: colors.black, fontWeight: '600' }]}>{p.name}</Text>
            <Text style={[typography.caption, { color: colors.gray600 }]}>{p.position}</Text>
          </View>
          <OverallBadge value={p.overall} />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  matchHeader: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: spacing.md,
  },
  teamBlock: { alignItems: 'center' },
  teamIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  teamHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: { fontWeight: '700', color: colors.gray600 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});
