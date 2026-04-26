import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import { Card } from '../components/UI';

const venues = [
  { id: '1', name: 'Arena Show', type: 'Campo · Coberto', price: 300, rating: 4.8, distance: 1.2 },
  { id: '2', name: 'Society Prime', type: 'Society · Descoberto', price: 180, rating: 4.6, distance: 2.1 },
  { id: '3', name: 'Arena Paulista', type: 'Campo · Coberto', price: 350, rating: 4.7, distance: 3.5 },
];

const TABS = ['Quadras', 'Reservas', 'Favoritos'];

export default function VenuesScreen() {
  const [tab, setTab] = useState('Quadras');
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.gray600} style={{ marginRight: spacing.sm }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar quadras..."
          placeholderTextColor={colors.gray600}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
        {['Tipo', 'Cobertura', 'Preço', 'Mais filtros'].map((f) => (
          <TouchableOpacity key={f} style={styles.filterChip}>
            <Text style={[typography.caption, { color: colors.black }]}>{f}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.black} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {venues.map((v) => (
          <Card key={v.id} style={styles.venueCard}>
            <View style={styles.venueImage}>
              <Ionicons name="football" size={32} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.venueHeader}>
                <Text style={[typography.h3, { color: colors.black }]}>{v.name}</Text>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.gray600} />
                </TouchableOpacity>
              </View>
              <Text style={[typography.caption, { color: colors.gray600 }]}>{v.type}</Text>
              <Text style={[typography.body, { color: colors.black, fontWeight: '600', marginTop: 4 }]}>
                A partir de R$ {v.price},00
              </Text>
              <View style={styles.venueFooter}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color={colors.orange} />
                  <Text style={[typography.caption, { color: colors.black, marginLeft: 2 }]}>{v.rating}</Text>
                </View>
                <View style={styles.distanceRow}>
                  <Ionicons name="location" size={12} color={colors.gray600} />
                  <Text style={[typography.caption, { color: colors.gray600, marginLeft: 2 }]}>{v.distance}km</Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Ionicons
              name={t === 'Quadras' ? 'grid-outline' : t === 'Reservas' ? 'calendar-outline' : 'heart-outline'}
              size={20}
              color={tab === t ? colors.primary : colors.gray600}
            />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.black },
  filtersRow: { marginBottom: spacing.sm },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  venueCard: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  venueImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  venueFooter: { flexDirection: 'row', gap: spacing.md, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  distanceRow: { flexDirection: 'row', alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingBottom: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', paddingTop: spacing.sm, gap: 2 },
  tabActive: {},
  tabText: { fontSize: 10, color: colors.gray600 },
  tabTextActive: { color: colors.primary },
});
