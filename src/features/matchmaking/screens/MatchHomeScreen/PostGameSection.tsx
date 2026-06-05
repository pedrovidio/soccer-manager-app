import React, { memo } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { posLabel } from '@features/matchmaking/utils/formatters';
import { AthleteRatingRow } from '@features/matchmaking/components/AthleteRatingRow';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type PostGameSectionProps = {
  controller: MatchHomeController;
};

function PostGameSectionComponent({ controller }: PostGameSectionProps) {
  const {
    data,
    pendingRatingsCount,
    ratingMutation,
    ratingStars,
    savedRatingStars,
    scoreA,
    scoreB,
    scoreMutation,
    setAthleteRating,
    setScoreA,
    setScoreB,
    summary,
    isAdmin,
  } = controller;

  if (!data || !summary || data.status !== 'FINISHED') return null;

  const isConfirmedParticipant = summary.currentPresence?.status === 'CONFIRMED';
  if (!isAdmin && !isConfirmedParticipant) return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Pos-jogo</Text>
      <View style={s.matchActionsCard}>
        <Text style={s.filterLabel}>{summary.hasRegisteredScore ? 'Placar registrado' : 'Registrar placar'}</Text>
        {isAdmin ? (
          <>
            <View style={s.inlineActionRow}>
              <View style={s.flex1}>
                <Text style={s.filterLabel}>{data.homeTeamName}</Text>
                <TextInput style={s.filterInput} value={scoreA} onChangeText={setScoreA} keyboardType="numeric" placeholder="0" />
              </View>
              <View style={s.flex1}>
                <Text style={s.filterLabel}>{data.awayTeamName}</Text>
                <TextInput style={s.filterInput} value={scoreB} onChangeText={setScoreB} keyboardType="numeric" placeholder="0" />
              </View>
            </View>
            <TouchableOpacity style={[s.smallPrimaryBtn, scoreMutation.isPending && s.inviteBtnDisabled]} onPress={() => scoreMutation.mutate()} disabled={scoreMutation.isPending}>
              <Text style={s.smallPrimaryText}>{summary.hasRegisteredScore ? 'Atualizar placar' : 'Salvar placar'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={s.recordedScoreText}>
            {summary.hasRegisteredScore
              ? `${data.homeTeamName} ${scoreA} x ${scoreB} ${data.awayTeamName}`
              : 'Aguardando o administrador registrar o placar.'}
          </Text>
        )}

        {isConfirmedParticipant && (
          <>
            <Text style={[s.filterLabel, { marginTop: 12 }]}>Avaliar atletas</Text>
            <FlatList
              data={summary.ratableAthletes}
              keyExtractor={(athlete) => athlete.athleteId}
              scrollEnabled={false}
              renderItem={({ item: athlete }) => (
                <AthleteRatingRow
                  name={athlete.name}
                  position={posLabel(athlete.position)}
                  overall={athlete.overall}
                  value={ratingStars[athlete.athleteId]}
                  disabled={savedRatingStars[athlete.athleteId] !== undefined}
                  isSubmitting={ratingMutation.isPending}
                  onRate={(stars) => setAthleteRating(athlete.athleteId, stars)}
                />
              )}
            />

            <TouchableOpacity
              style={[s.inviteBtn, (pendingRatingsCount === 0 || ratingMutation.isPending) && s.inviteBtnDisabled]}
              onPress={() => ratingMutation.mutate()}
              disabled={pendingRatingsCount === 0 || ratingMutation.isPending}
              activeOpacity={0.8}
            >
              {ratingMutation.isPending ? (
                <ActivityIndicator color={Arena.buttonLabelPrimary} size="small" />
              ) : (
                <>
                  <Ionicons name="star" size={16} color={Arena.buttonLabelPrimary} />
                  <Text style={s.inviteBtnText}>
                    {pendingRatingsCount === 0 ? 'Notas salvas' : `Salvar notas (${pendingRatingsCount})`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export const PostGameSection = memo(PostGameSectionComponent);
