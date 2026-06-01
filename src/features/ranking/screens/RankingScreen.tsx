import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { getFullImageUrl } from '@lib/imageUrl';
import { useAuthStore } from '@features/auth/useAuthStore';
import { RankingAthlete } from '../services/rankingApi';
import { useRanking } from '../hooks/useRanking';
import { styles } from './styles';

interface RankingRowProps {
  athlete: RankingAthlete;
  position: number;
  isCurrentAthlete: boolean;
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const RankingRow = memo(function RankingRow({
  athlete,
  position,
  isCurrentAthlete,
}: RankingRowProps) {
  const imageUrl = getFullImageUrl(athlete.photoUrl);

  return (
    <View style={[styles.card, isCurrentAthlete && styles.currentCard]}>
      <View style={styles.positionBox}>
        <Text style={[styles.position, position <= 3 && styles.podiumPosition]}>
          #{position}
        </Text>
      </View>

      <View style={styles.avatar}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initialsFor(athlete.name) || 'NF'}</Text>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{athlete.name}</Text>
          {isCurrentAthlete && <Text style={styles.youBadge}>Voce</Text>}
        </View>
        <Text style={styles.meta}>
          V {athlete.wins}  E {athlete.draws}  D {athlete.losses}  Gols {athlete.goals}
        </Text>
      </View>

      <View style={styles.pointsBox}>
        <Text style={styles.points}>{athlete.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
});

export default function RankingScreen() {
  const athleteId = useAuthStore((state) => state.athleteId);
  const ranking = useRanking();

  const loadMore = useCallback(() => {
    if (!ranking.isFetchingNextPage && ranking.hasNextPage) {
      ranking.fetchNextPage();
    }
  }, [ranking]);

  const renderItem = useCallback(({ item, index }: { item: RankingAthlete; index: number }) => (
    <RankingRow
      athlete={item}
      position={index + 1}
      isCurrentAthlete={item.athleteId === athleteId}
    />
  ), [athleteId]);

  const footer = ranking.isFetchingNextPage ? (
    <View style={styles.footerLoader}>
      <ActivityIndicator color={Arena.neon} />
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Temporada geral</Text>
          <Text style={styles.title}>Ranking</Text>
        </View>
        <View style={styles.totalPill}>
          <Ionicons name="trophy-outline" size={16} color={Arena.neon} />
          <Text style={styles.totalText}>{ranking.total}</Text>
        </View>
      </View>

      {ranking.isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color={Arena.neon} />
          <Text style={styles.stateText}>Carregando ranking...</Text>
        </View>
      ) : ranking.isError ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={28} color={Arena.error} />
          <Text style={styles.stateTitle}>Nao foi possivel carregar</Text>
          <Text style={styles.stateText}>Puxe para atualizar e tente novamente.</Text>
        </View>
      ) : (
        <FlatList
          data={ranking.athletes}
          keyExtractor={(item) => item.athleteId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={footer}
          ListEmptyComponent={(
            <View style={styles.state}>
              <Ionicons name="podium-outline" size={30} color={Arena.textSubtle} />
              <Text style={styles.stateTitle}>Ranking vazio</Text>
              <Text style={styles.stateText}>Os atletas aparecem aqui quando houver dados consolidados.</Text>
            </View>
          )}
          refreshControl={(
            <RefreshControl
              refreshing={ranking.isRefetching && !ranking.isFetchingNextPage}
              onRefresh={ranking.refetch}
              tintColor={Arena.neon}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
