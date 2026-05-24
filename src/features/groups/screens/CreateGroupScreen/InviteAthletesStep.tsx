import React, { memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { AthleteSearchResult } from '@features/groups/groupTypes';
import { AthleteResultRow } from './AthleteResultRow';
import { SelectedAthleteChip } from './SelectedAthleteChip';
import { styles } from './styles';

type Props = {
  query: string;
  results: AthleteSearchResult[];
  selected: AthleteSearchResult[];
  searching: boolean;
  submitting: boolean;
  onSearch: (text: string) => void;
  onToggle: (athlete: AthleteSearchResult) => void;
  onRemove: (id: string) => void;
  onSubmit: () => void;
};

function InviteAthletesStepComponent({
  query,
  results,
  selected,
  searching,
  submitting,
  onSearch,
  onToggle,
  onRemove,
  onSubmit,
}: Props) {
  const selectedIds = useMemo(() => new Set(selected.map((athlete) => athlete.id)), [selected]);
  const hasQuery = query.length >= 2;

  const renderChip = useCallback(({ item }: { item: AthleteSearchResult }) => (
    <SelectedAthleteChip athlete={item} onRemove={onRemove} />
  ), [onRemove]);

  const renderAthlete = useCallback(({ item }: { item: AthleteSearchResult }) => (
    <AthleteResultRow athlete={item} selected={selectedIds.has(item.id)} onToggle={onToggle} />
  ), [onToggle, selectedIds]);

  const emptyState = useMemo(() => {
    if (hasQuery && !searching) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons name="person-outline" size={36} color={Colors.n300} />
          <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
        </View>
      );
    }

    if (!hasQuery) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons name="people-outline" size={36} color={Colors.n300} />
          <Text style={styles.emptyText}>Digite o nome para buscar atletas</Text>
        </View>
      );
    }

    return null;
  }, [hasQuery, searching]);

  return (
    <View style={styles.inviteContainer}>
      {selected.length > 0 && (
        <View style={styles.chipsWrap}>
          <FlatList
            data={selected}
            keyExtractor={(item) => item.id}
            renderItem={renderChip}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.n400} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome..."
          placeholderTextColor={Colors.n400}
          value={query}
          onChangeText={onSearch}
          autoFocus
        />
        {searching && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderAthlete}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={results.length === 0 ? styles.emptyList : styles.resultsList}
        ListEmptyComponent={emptyState}
      />

      <View style={styles.actionBar}>
        <View style={styles.actionInfo}>
          <Text style={styles.actionCount}>
            {selected.length > 0 ? `${selected.length} selecionado(s)` : 'Nenhum selecionado'}
          </Text>
          <Text style={styles.actionHint}>Voce pode convidar mais depois</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, submitting ? styles.actionBtnDisabled : null]}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <Text style={styles.actionBtnText}>{selected.length > 0 ? 'Criar e convidar' : 'Criar grupo'}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const InviteAthletesStep = memo(InviteAthletesStepComponent);
