import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureAccess } from '@features/app-config/hooks/useFeatureAccess';
import { useAuthStore } from '@features/auth/useAuthStore';
import { BackButton } from '@ui/composites/BackButton';
import { SponsorBanner } from '@ui/composites/SponsorBanner';
import { Button } from '@ui/primitives';
import { Arena } from '@ui/tokens/theme';
import { useLiveMatchController } from '../hooks/useLiveMatchController';
import type { LiveMatchData, LiveMatchTeam } from '../types';
import {
  LiveMatchHeader,
  LiveScoreCard,
  LiveSponsorCard,
  LiveTeamColumn,
  LiveTimeline,
  styles,
} from './LiveMatchScreen/index';

type Props = {
  matchId: string;
};

export function LiveMatchScreen({ matchId }: Props) {
  const access = useFeatureAccess('LIVE_MATCH_SCORE');

  if (access.isLoading) return null;

  return <LiveMatchDataScreen matchId={matchId} showLiveScore={access.hasAccess} />;
}

function LiveMatchDataScreen({ matchId, showLiveScore }: Props & { showLiveScore: boolean }) {
  const controller = useLiveMatchController(matchId);

  if (controller.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <View style={styles.loadingHeader}>
          <BackButton />
        </View>
        <ActivityIndicator size="large" color={Arena.neon} />
      </SafeAreaView>
    );
  }

  if (controller.isError || !controller.match) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <View style={styles.loadingHeader}>
          <BackButton />
        </View>
        <Text style={styles.emptyText}>Não foi possível carregar a transmissão.</Text>
        <Button title="Tentar novamente" onPress={() => controller.refetch()} />
      </SafeAreaView>
    );
  }

  if (!showLiveScore) {
    return <FinalResultContent match={controller.match} />;
  }

  return (
    <LiveMatchContent
      match={controller.match}
      isSubmitting={controller.isSubmitting}
      onAddGoal={controller.addGoal}
      onAddOwnGoal={controller.addOwnGoal}
      onDeleteGoal={controller.deleteGoal}
      onFinishMatch={controller.finishMatch}
      onStartMatch={controller.startMatch}
    />
  );
}

function FinalResultContent({ match }: { match: LiveMatchData }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LiveMatchHeader title="Resultado da partida" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.finalResultCard}>
          <Text style={styles.finalResultLabel}>Resultado da partida</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.teamName}>{match.homeTeamName}</Text>
            <Text style={styles.score}>{match.homeScore} x {match.awayScore}</Text>
            <Text style={styles.teamName}>{match.awayTeamName}</Text>
          </View>
          <Text style={styles.finalResultMeta}>
            {match.status === 'FINISHED' ? 'Partida encerrada' : 'Placar ao vivo indisponivel'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ContentProps = {
  match: LiveMatchData;
  isSubmitting: boolean;
  onAddGoal: (athleteId: string, team: LiveMatchTeam) => void;
  onAddOwnGoal: (athleteId: string, team: LiveMatchTeam) => void;
  onDeleteGoal: (eventId: string) => void;
  onFinishMatch: () => void;
  onStartMatch: () => void;
};

function LiveMatchContent({ match, isSubmitting, onAddGoal, onAddOwnGoal, onDeleteGoal, onFinishMatch, onStartMatch }: ContentProps) {
  const athleteId = useAuthStore((state) => state.athleteId);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (match.status !== 'IN_PROGRESS' || !match.startedAt) return;

    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [match.startedAt, match.status]);

  const isScorekeeper = !!athleteId && athleteId === match.scorekeeperId;
  const canRegisterGoal = isScorekeeper && match.status === 'IN_PROGRESS' && !isSubmitting;
  const canDeleteGoal = isScorekeeper && match.status === 'IN_PROGRESS' && !isSubmitting;
  const goalEvents = useMemo(
    () =>
      match.events
        .filter((event) => event.type === 'GOAL' || event.type === 'OWN_GOAL')
        .sort((first, second) => first.minute - second.minute || first.createdAt.localeCompare(second.createdAt)),
    [match.events],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiveMatchHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LiveScoreCard match={match} now={now} />

        <SponsorBanner sponsorData={match.sponsorData} />

        <View style={styles.lineup}>
          <LiveTeamColumn
            players={match.homePlayers}
            teamName={match.homeTeamName}
            teamType="HOME"
            canRegisterGoal={canRegisterGoal}
            isSubmitting={isSubmitting}
            onAddGoal={onAddGoal}
            onAddOwnGoal={onAddOwnGoal}
          />
          <LiveTeamColumn
            players={match.awayPlayers}
            teamName={match.awayTeamName}
            teamType="AWAY"
            canRegisterGoal={canRegisterGoal}
            isSubmitting={isSubmitting}
            onAddGoal={onAddGoal}
            onAddOwnGoal={onAddOwnGoal}
          />
        </View>

        {!!match.sponsor?.name.trim() && <LiveSponsorCard sponsor={match.sponsor} />}

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

        <LiveTimeline
          match={match}
          goalEvents={goalEvents}
          canDeleteGoal={canDeleteGoal}
          onDeleteGoal={(eventId) => confirmDeleteGoal(eventId, onDeleteGoal)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function confirmDeleteGoal(eventId: string, onDeleteGoal: (eventId: string) => void) {
  Alert.alert('Anular gol?', 'O gol sera removido da linha do tempo e o placar sera ajustado.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Anular', style: 'destructive', onPress: () => onDeleteGoal(eventId) },
  ]);
}
