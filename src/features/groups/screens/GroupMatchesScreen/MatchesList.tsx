import React, { memo, useCallback } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { GroupUpcomingMatch } from '../../groupTypes';
import { EmptyMatches } from './EmptyMatches';
import { MatchRow } from './MatchRow';
import { styles } from './styles';

type Props = {
  matches: GroupUpcomingMatch[];
  isAdmin: boolean;
  onCreateMatch: () => void;
  onOpenMatch: (matchId: string) => void;
  refreshing: boolean;
  onRefresh: () => void;
};

function MatchesListComponent({ matches, isAdmin, onCreateMatch, onOpenMatch, refreshing, onRefresh }: Props) {
  const renderMatch = useCallback(({ item }: { item: GroupUpcomingMatch }) => (
    <MatchRow match={item} onPress={onOpenMatch} />
  ), [onOpenMatch]);

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={renderMatch}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      ItemSeparatorComponent={ListSeparator}
      ListEmptyComponent={<EmptyMatches isAdmin={isAdmin} onCreateMatch={onCreateMatch} />}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

export const MatchesList = memo(MatchesListComponent);
