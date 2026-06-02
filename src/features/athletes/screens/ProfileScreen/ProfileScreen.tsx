import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { PremiumOnly } from '@ui/components/PremiumOnly';
import { AttributesCard } from './AttributesCard';
import { ProfileActions } from './ProfileActions';
import { ProfileHero } from './ProfileHero';
import { styles } from './styles';
import { useProfileScreen } from './useProfileScreen';

export function ProfileScreen() {
  const controller = useProfileScreen();
  const { profile } = controller;

  if (controller.isLoading && !profile.dashboard) {
    return (
      <View style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={Arena.neon} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ProfileHero
          name={profile.name}
          initials={profile.initials}
          overall={profile.overall}
          overallColor={profile.overallColor}
          photoUrl={profile.photoUrl}
          plan={profile.plan}
          position={profile.position}
          status={profile.status}
          statusStyle={profile.statusStyle}
          onEdit={controller.goEditProfile}
        />
        <RankingBadge
          rankGlobal={controller.rankingSummary.rankGlobal}
          points={controller.rankingSummary.points}
          goals={controller.rankingSummary.goals}
          isLoading={controller.isRankingLoading}
        />
        <PremiumOnly>
          <AttributesCard stats={profile.stats} />
        </PremiumOnly>
        <ProfileActions onGroups={controller.goGroups} onLogout={controller.confirmLogout} />
      </ScrollView>
    </View>
  );
}

function RankingBadge({
  rankGlobal,
  points,
  goals,
  isLoading,
}: {
  rankGlobal: number;
  points: number;
  goals: number;
  isLoading: boolean;
}) {
  const rankLabel = rankGlobal > 0 ? `Top #${rankGlobal}` : 'Sem ranking';

  return (
    <View style={styles.rankingCard}>
      <View style={styles.rankingIcon}>
        <Ionicons name="trophy" size={22} color={Arena.buttonLabelPrimary} />
      </View>
      <View style={styles.rankingInfo}>
        <Text style={styles.rankingTitle}>{isLoading ? 'Atualizando...' : rankLabel}</Text>
        <Text style={styles.rankingMeta}>
          {points} Pontos | {goals} Gols
        </Text>
      </View>
      <View style={styles.rankingGlow}>
        <Ionicons name="stats-chart" size={18} color={Arena.neon} />
      </View>
    </View>
  );
}
