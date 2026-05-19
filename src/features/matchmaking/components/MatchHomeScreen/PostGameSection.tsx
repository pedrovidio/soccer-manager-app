import React, { memo } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { posLabel } from '../../utils/formatters';
import { AthleteRatingRow } from '../AthleteRatingRow';
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
  } = controller;

  if (!data || !summary || data.status !== 'FINISHED' || summary.currentPresence?.status !== 'CONFIRMED') return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Pos-jogo</Text>
      <View style={s.matchActionsCard}>
        <Text style={s.filterLabel}>{summary.hasRegisteredScore ? 'Placar registrado' : 'Registrar placar'}</Text>
        <View style={s.inlineActionRow}>
          <TextInput style={[s.filterInput, s.flex1]} value={scoreA} onChangeText={setScoreA} keyboardType="numeric" placeholder="Time 1" editable={!summary.hasRegisteredScore} />
          <TextInput style={[s.filterInput, s.flex1]} value={scoreB} onChangeText={setScoreB} keyboardType="numeric" placeholder="Time 2" editable={!summary.hasRegisteredScore} />
          <TouchableOpacity style={[s.smallPrimaryBtn, (summary.hasRegisteredScore || scoreMutation.isPending) && s.inviteBtnDisabled]} onPress={() => scoreMutation.mutate()} disabled={summary.hasRegisteredScore || scoreMutation.isPending}>
            <Text style={s.smallPrimaryText}>{summary.hasRegisteredScore ? 'Salvo' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>

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
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="star" size={16} color={Colors.white} />
              <Text style={s.inviteBtnText}>
                {pendingRatingsCount === 0 ? 'Notas salvas' : `Salvar notas (${pendingRatingsCount})`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const PostGameSection = memo(PostGameSectionComponent);
