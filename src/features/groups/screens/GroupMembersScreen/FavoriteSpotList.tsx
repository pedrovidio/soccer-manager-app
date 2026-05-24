import React, { memo, useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { FavoriteSpotAthlete } from '@features/groups/groupTypes';
import { FavoriteSpotAthleteRow } from './FavoriteSpotAthleteRow';
import { styles } from './styles';

type Props = {
  items: FavoriteSpotAthlete[];
  disabled: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onRemove: (athleteId: string) => void;
};

function FavoriteSpotListComponent({ items, disabled, refreshing, onRefresh, onRemove }: Props) {
  const renderItem = useCallback(({ item }: { item: FavoriteSpotAthlete }) => (
    <FavoriteSpotAthleteRow item={item} disabled={disabled} onRemove={onRemove} />
  ), [disabled, onRemove]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.athleteId}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      ListEmptyComponent={<EmptySpotList />}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={9}
      removeClippedSubviews
    />
  );
}

function EmptySpotList() {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="star-outline" size={34} color={Colors.n300} />
      <Text style={styles.emptyText}>Nenhum avulso favorito ainda</Text>
    </View>
  );
}

export const FavoriteSpotList = memo(FavoriteSpotListComponent);
