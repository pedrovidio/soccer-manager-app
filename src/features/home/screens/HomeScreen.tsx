import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { financialBlockMessage, hasFinancialBlock } from '@features/athletes/utils/financialAccess';
import { SegmentedControl } from '@ui/primitives/SegmentedControl';
import { Arena, Colors } from '@ui/tokens/theme';
import { useAthleteLocationSync } from '@features/athletes/hooks/useAthleteLocationSync';
import { useAuthStore } from '@features/auth/useAuthStore';
import { useFavoriteGroup } from '@features/groups/hooks/useFavoriteGroup';
import { useFavoriteGroupDetails } from '@features/groups/hooks/useGroupQueries';
import { NotificationsSheet } from '@features/notifications/components/NotificationsSheet';
import { useNotificationActions } from '@features/notifications/hooks/useNotifications';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { MatchCard } from '../components/MatchCard';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useSponsorQuery } from '../hooks/useSponsorQuery';
import { SponsorBanner } from '@ui/composites/SponsorBanner';
import { styles } from '../HomeScreen.styles';

export default function HomeScreen() {
  const [matchTab, setMatchTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const { dashboard, notifications, confirmedMatches, isLoading, isError, refetch } =
    useHomeDashboard(athleteId);
  const { data: sponsor } = useSponsorQuery('HOME_FOOTER');
  useAthleteLocationSync(athleteId, !!athleteId);

  const {
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
    respondInvite,
    respondInvitePending,
    respondSpotApplication,
    respondSpotApplicationPending,
  } = useNotificationActions(athleteId, notifications);

  const { favoriteId, clear: clearFavoriteGroup } = useFavoriteGroup(athleteId);
  const { data: favoriteGroup } = useFavoriteGroupDetails(favoriteId, athleteId, clearFavoriteGroup);

  const blockedByDebt = hasFinancialBlock(dashboard);

  const upcoming = confirmedMatches.filter((match) => match.status === 'SCHEDULED' || match.status === 'IN_PROGRESS');
  const past = confirmedMatches.filter((match) => match.status === 'FINISHED' || match.status === 'CANCELLED');
  const matches = matchTab === 'upcoming' ? upcoming : past;

  if (isLoading && !dashboard) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Arena.neon} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <View style={styles.fieldGlow} pointerEvents="none" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="Logo Não Fico Sem Jogar"
              resizeMode="contain"
              source={require('../../../../assets/images/logo.png')}
              style={styles.appLogo}
            />
            <Text style={styles.appName}>NAO FICO SEM JOGAR</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.msgBtn} onPress={() => setShowNotifications(true)}>
              <Ionicons name="notifications-outline" size={24} color={Arena.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Arena.neon]} tintColor={Arena.neon} />}
      >
        {favoriteGroup && (
          <TouchableOpacity
            style={styles.favoriteCard}
            onPress={() => router.push({ pathname: '/groups/group-home', params: { groupId: favoriteGroup.id } } as any)}
            activeOpacity={0.7}
          >
            <View style={styles.favoriteCardLeft}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.favoriteCardLabel}>Seu grupo de confiança</Text>
            </View>
            <View style={styles.favoriteCardRight}>
              <Text style={styles.favoriteCardName} numberOfLines={1}>{favoriteGroup.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={Arena.textSubtle} />
            </View>
          </TouchableOpacity>
        )}

        {blockedByDebt && (
          <TouchableOpacity
            style={styles.debtCard}
            onPress={() => router.push('/financial' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed-outline" size={18} color={Colors.error} />
            <View style={{ flex: 1 }}>
              <Text style={styles.debtTitle}>Tem pendência segurando seu jogo</Text>
              <Text style={styles.debtText}>{financialBlockMessage(dashboard)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.error} />
          </TouchableOpacity>
        )}

        <QuickActionsCard
          notifications={notifications}
          onRespondInvite={respondInvite}
          respondInvitePending={respondInvitePending}
          onRespondSpotApplication={respondSpotApplication}
          respondSpotApplicationPending={respondSpotApplicationPending}
          blockMatchAccept={blockedByDebt}
          onViewAll={() => setShowNotifications(true)}
        />

        <View style={styles.section}>
          <SegmentedControl
            options={[
              { value: 'upcoming', label: 'Próximas' },
              { value: 'past', label: 'Histórico' },
            ]}
            value={matchTab}
            onChange={setMatchTab}
            style={{ marginBottom: 12 }}
          />

          <Text style={styles.sectionTitle}>
            {matchTab === 'upcoming' ? 'Partidas que vão sair do papel' : 'Histórias que já viraram placar'}
          </Text>

          {isError && (
            <View style={styles.emptyCard}>
              <Ionicons name="alert-circle-outline" size={36} color={Colors.error} />
              <Text style={[styles.emptyText, { color: Colors.error }]}>
                Não conseguimos buscar seus jogos agora.
              </Text>
            </View>
          )}

          {!isError && matches.length === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="football-outline" size={36} color={Arena.neon} />
              <Text style={styles.emptyText}>Nenhuma partida por aqui ainda. Chama o grupo e bota a bola pra rolar.</Text>
            </View>
          )}

          {matches.map((match) => (
            <MatchCard key={match.id} match={match} athleteId={athleteId} />
          ))}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16, backgroundColor: Arena.bg }}>
        <SponsorBanner sponsorData={sponsor} />
      </View>

      <NotificationsSheet
        visible={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteOne}
        onDeleteAll={deleteAll}
        onRespondInvite={respondInvite}
        respondInvitePending={respondInvitePending}
        onRespondSpotApplication={respondSpotApplication}
        respondSpotApplicationPending={respondSpotApplicationPending}
        blockMatchAccept={blockedByDebt}
      />
    </View>
  );
}
