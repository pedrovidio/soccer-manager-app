import React, { memo, useCallback, useMemo } from 'react';
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
import { Redirect } from 'expo-router';
import { useFeatureAccess } from '@features/app-config/hooks/useFeatureAccess';
import { Arena } from '@ui/tokens/theme';
import { getFullImageUrl } from '@lib/imageUrl';
import { useAuthStore } from '@features/auth/useAuthStore';
import { RankingAthlete } from '../services/rankingApi';
import { useRanking } from '../hooks/useRanking';
import { styles } from './styles';
import { useSponsorQuery } from '@features/home/hooks/useSponsorQuery';
import { SponsorBanner } from '@ui/composites/SponsorBanner';

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
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark" size={13} color={Arena.neon} />
            <Text style={styles.statValue}>{athlete.wins}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIconText}>=</Text>
            <Text style={styles.statValue}>{athlete.draws}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="close" size={14} color={Arena.error} />
            <Text style={styles.statValue}>{athlete.losses}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="football-outline" size={13} color={Arena.textSubtle} />
            <Text style={styles.statValue}>{athlete.goals}</Text>
          </View>
        </View>
      </View>

      <View style={styles.pointsBox}>
        <Text style={styles.points}>{athlete.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
});

export default function RankingScreen() {
  const access = useFeatureAccess('RANKING_ACCESS');
  if (access.isLoading) return null;
  if (!access.hasAccess) {
    return <Redirect href="/" />;
  }

  return <RankingContent />;
}

function RankingContent() {
  const athleteId = useAuthStore((state) => state.athleteId);
  const ranking = useRanking();
  const { data: rankingSponsor } = useSponsorQuery('RANKING_FEED');

  const loadMore = useCallback(() => {
    if (!ranking.isFetchingNextPage && ranking.hasNextPage) {
      ranking.fetchNextPage();
    }
  }, [ranking]);

  const listData = useMemo(() => {
    if (!ranking.athletes || ranking.athletes.length === 0) return [];
    const data = [...ranking.athletes];
    if (data.length >= 3) {
      data.splice(3, 0, { athleteId: 'ranking-ad-item', isAd: true } as any);
    }
    return data;
  }, [ranking.athletes]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (item.isAd) {
      return <SponsorBanner sponsorData={rankingSponsor} />;
    }

    const displayPosition = index >= 3 ? index : index + 1;

    return (
      <RankingRow
        athlete={item}
        position={displayPosition}
        isCurrentAthlete={item.athleteId === athleteId}
      />
    );
  }, [athleteId, rankingSponsor]);

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
          data={listData}
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
