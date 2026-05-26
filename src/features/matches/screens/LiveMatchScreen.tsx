import React, { memo, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@features/auth/useAuthStore';
import { getFullImageUrl } from '@lib/imageUrl';
import { Avatar } from '@ui/composites/Avatar';
import { BackButton } from '@ui/composites/BackButton';
import { SponsorBanner } from '@ui/composites/SponsorBanner';
import { Button } from '@ui/primitives';
import { Colors, Radius, Spacing } from '@ui/tokens/theme';
import { useLiveMatchController } from '../hooks/useLiveMatchController';
import type { LiveMatchData, LiveMatchPlayer, LiveMatchSponsor, LiveMatchTeam } from '../types';

type Props = {
  matchId: string;
};

export function LiveMatchScreen({ matchId }: Props) {
  const controller = useLiveMatchController(matchId);

  if (controller.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <View style={styles.loadingHeader}>
          <BackButton />
        </View>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (controller.isError || !controller.match) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <View style={styles.loadingHeader}>
          <BackButton />
        </View>
        <Text style={styles.emptyText}>Nao foi possivel carregar a transmissao.</Text>
        <Button title="Tentar novamente" onPress={() => controller.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <LiveMatchContent
      match={controller.match}
      isSubmitting={controller.isSubmitting}
      onAddGoal={controller.addGoal}
      onFinishMatch={controller.finishMatch}
      onStartMatch={controller.startMatch}
    />
  );
}

type ContentProps = {
  match: LiveMatchData;
  isSubmitting: boolean;
  onAddGoal: (athleteId: string, team: LiveMatchTeam) => void;
  onFinishMatch: () => void;
  onStartMatch: () => void;
};

function LiveMatchContent({ match, isSubmitting, onAddGoal, onFinishMatch, onStartMatch }: ContentProps) {
  const athleteId = useAuthStore((state) => state.athleteId);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (match.status !== 'IN_PROGRESS' || !match.startedAt) return;

    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [match.startedAt, match.status]);

  const isScorekeeper = !!athleteId && athleteId === match.scorekeeperId;
  const canRegisterGoal = isScorekeeper && match.status === 'IN_PROGRESS' && !isSubmitting;
  const goalEvents = useMemo(
    () =>
      match.events
        .filter((event) => event.type === 'GOAL' || event.type === 'OWN_GOAL')
        .sort((first, second) => first.minute - second.minute || first.createdAt.localeCompare(second.createdAt)),
    [match.events],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Transmissao ao Vivo</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <Text style={styles.liveLabel}>{match.status === 'IN_PROGRESS' ? 'AO VIVO' : 'PARTIDA'}</Text>
          <Text style={styles.clock}>{formatClock(match, now)}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.teamName}>{match.homeTeamName}</Text>
            <Text style={styles.score}>{match.homeScore} x {match.awayScore}</Text>
            <Text style={styles.teamName}>{match.awayTeamName}</Text>
          </View>
        </View>

        <SponsorBanner sponsorData={match.sponsorData} />

        <View style={styles.lineup}>
          <TeamColumn
            players={match.homePlayers}
            teamName={match.homeTeamName}
            teamType="HOME"
            canRegisterGoal={canRegisterGoal}
            isSubmitting={isSubmitting}
            onAddGoal={onAddGoal}
          />
          <TeamColumn
            players={match.awayPlayers}
            teamName={match.awayTeamName}
            teamType="AWAY"
            canRegisterGoal={canRegisterGoal}
            isSubmitting={isSubmitting}
            onAddGoal={onAddGoal}
          />
        </View>

        {!!match.sponsor?.name.trim() && <SponsorCard sponsor={match.sponsor} />}

        {match.canStartMatch && match.status === 'SCHEDULED' && (
          <View style={styles.actions}>
            <Text style={styles.sectionTitle}>Controle da partida</Text>
            <Button
              title="Iniciar Partida"
              loading={isSubmitting}
              onPress={onStartMatch}
            />
          </View>
        )}

        {isScorekeeper && match.status === 'IN_PROGRESS' && (
          <View style={styles.actions}>
            <Text style={styles.sectionTitle}>Controle da partida</Text>
            <Button
              title="Encerrar Partida"
              variant="secondary"
              loading={isSubmitting}
              onPress={onFinishMatch}
            />
          </View>
        )}

        <View style={styles.timeline}>
          <Text style={styles.sectionTitle}>Linha do tempo</Text>
          {goalEvents.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyText}>Nenhum gol registrado ainda.</Text>
            </View>
          ) : (
            goalEvents.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.minuteBadge}>
                  <Text style={styles.minuteText}>{event.minute}'</Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>
                    {event.type === 'OWN_GOAL' ? 'Gol contra' : 'Gol'} - {teamNameFor(match, event.teamType)}
                  </Text>
                  <Text style={styles.eventSubtitle}>{event.athleteName ?? 'Jogador nao informado'}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type TeamColumnProps = {
  players: LiveMatchPlayer[];
  teamName: string;
  teamType: LiveMatchTeam;
  canRegisterGoal: boolean;
  isSubmitting: boolean;
  onAddGoal: (athleteId: string, team: LiveMatchTeam) => void;
};

const TeamColumn = memo(function TeamColumn({
  players,
  teamName,
  teamType,
  canRegisterGoal,
  isSubmitting,
  onAddGoal,
}: TeamColumnProps) {
  return (
    <View style={styles.teamColumn}>
      <View style={[styles.teamHeading, teamType === 'HOME' ? styles.homeHeading : styles.awayHeading]}>
        <Text
          style={[styles.teamHeadingText, teamType === 'AWAY' ? styles.awayHeadingText : null]}
          numberOfLines={1}
        >
          {teamName}
        </Text>
      </View>
      {players.length === 0 ? (
        <View style={styles.emptyLineup}>
          <Text style={styles.emptyLineupText}>Sem jogadores</Text>
        </View>
      ) : players.map((player) => (
        <LivePlayerCard
          key={player.id}
          player={player}
          enabled={canRegisterGoal}
          disabled={isSubmitting}
          teamType={teamType}
          onAddGoal={onAddGoal}
        />
      ))}
    </View>
  );
});

type LivePlayerCardProps = {
  player: LiveMatchPlayer;
  enabled: boolean;
  disabled: boolean;
  teamType: LiveMatchTeam;
  onAddGoal: (athleteId: string, team: LiveMatchTeam) => void;
};

const LivePlayerCard = memo(function LivePlayerCard({
  player,
  enabled,
  disabled,
  teamType,
  onAddGoal,
}: LivePlayerCardProps) {
  const photoUrl = getFullImageUrl(player.photoUrl);
  const content = (
    <>
      {photoUrl ? (
        <Image
          accessibilityLabel={`Foto de ${player.name}`}
          source={{ uri: photoUrl }}
          style={styles.playerAvatar}
        />
      ) : (
        <Avatar
          color={teamType === 'HOME' ? 'amber' : 'blue'}
          initials={initialsFor(player.name)}
          size="sm"
        />
      )}
      <Text numberOfLines={2} style={styles.playerName}>{player.name}</Text>
    </>
  );

  if (!enabled) {
    return <View style={styles.playerCard}>{content}</View>;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      disabled={disabled}
      onPress={() => onAddGoal(player.id, teamType)}
      style={[styles.playerCard, styles.playerCardInteractive, disabled ? styles.playerCardDisabled : null]}
    >
      {content}
    </TouchableOpacity>
  );
});

const SponsorCard = memo(function SponsorCard({ sponsor }: { sponsor: LiveMatchSponsor }) {
  return (
    <View style={styles.sponsorCard}>
      <Text style={styles.sponsorCaption}>Patrocinador da partida</Text>
      <View style={styles.sponsorContent}>
        {sponsor.logoUri ? (
          <Image
            accessibilityLabel={`Logo de ${sponsor.name}`}
            resizeMode="contain"
            source={{ uri: sponsor.logoUri }}
            style={styles.sponsorLogo}
          />
        ) : (
          <View style={styles.sponsorLogo} />
        )}
        <Text style={styles.sponsorName}>{sponsor.name}</Text>
      </View>
    </View>
  );
});

function teamNameFor(match: LiveMatchData, team: LiveMatchTeam) {
  return team === 'HOME' ? match.homeTeamName : match.awayTeamName;
}

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

function formatClock(match: LiveMatchData, now: number) {
  if (!match.startedAt) return '00:00';

  const endTime = match.endedAt ? new Date(match.endedAt).getTime() : now;
  const elapsedSeconds = Math.max(0, Math.floor((endTime - new Date(match.startedAt).getTime()) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.n50,
  },
  center: {
    alignItems: 'center',
    gap: Spacing.md,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingHeader: {
    left: Spacing.lg,
    position: 'absolute',
    top: Spacing.md,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomColor: Colors.n200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    color: Colors.n900,
    fontSize: 16,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r16,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  liveLabel: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  clock: {
    color: Colors.n600,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  teamName: {
    color: Colors.n800,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  score: {
    color: Colors.n900,
    fontSize: 32,
    fontWeight: '800',
  },
  sponsorCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r12,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sponsorCaption: {
    color: Colors.n500,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  sponsorContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sponsorLogo: {
    backgroundColor: Colors.n50,
    borderRadius: Radius.r8,
    height: 52,
    width: 72,
  },
  sponsorName: {
    color: Colors.n900,
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  lineup: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  teamColumn: {
    flex: 1,
    gap: Spacing.xs,
  },
  teamHeading: {
    alignItems: 'center',
    borderRadius: Radius.r8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  homeHeading: {
    backgroundColor: Colors.warningLight,
  },
  awayHeading: {
    backgroundColor: Colors.n800,
  },
  teamHeadingText: {
    color: Colors.n900,
    fontSize: 13,
    fontWeight: '800',
  },
  awayHeadingText: {
    color: Colors.white,
  },
  emptyLineup: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r12,
    borderWidth: 1,
    paddingVertical: Spacing.lg,
  },
  emptyLineupText: {
    color: Colors.n500,
    fontSize: 12,
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  playerCardInteractive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  playerCardDisabled: {
    opacity: 0.55,
  },
  playerName: {
    color: Colors.n900,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  playerAvatar: {
    backgroundColor: Colors.n100,
    borderRadius: Radius.r999,
    height: 32,
    width: 32,
  },
  actions: {
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r12,
    borderWidth: 1,
    gap: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    color: Colors.n900,
    fontSize: 16,
    fontWeight: '800',
  },
  timeline: {
    gap: Spacing.sm,
  },
  emptyTimeline: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r12,
    borderWidth: 1,
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: Colors.n500,
    fontSize: 13,
  },
  eventRow: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  minuteBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.r999,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  minuteText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    color: Colors.n900,
    fontSize: 14,
    fontWeight: '700',
  },
  eventSubtitle: {
    color: Colors.n500,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
