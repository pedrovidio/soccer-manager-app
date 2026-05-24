import React, { memo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { posLabel } from '../../utils/formatters';
import { s } from '../MatchHomeScreen.styles';
import { teamNameFallback } from './options';
import { MatchHomeController } from './types';

type TeamsSectionProps = {
  controller: MatchHomeController;
};

function TeamsSectionComponent({ controller }: TeamsSectionProps) {
  const { athleteId, summary } = controller;
  if (!summary?.hasVisibleMatchmakingResult) return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Escalacoes</Text>
      <FlatList
        data={summary.visibleMatchmakingResult.teams}
        keyExtractor={(team) => String(team.teamNumber)}
        scrollEnabled={false}
        contentContainerStyle={s.teamsWrap}
        renderItem={({ item: team }) => {
          const isMyTeam = team.athletes.some((athlete) => athlete.id === athleteId);

          return (
            <View style={[s.teamBox, isMyTeam && s.myTeamBox]}>
              <Text style={[s.teamTitle, isMyTeam && s.myTeamTitle]}>
                {team.name ?? teamNameFallback(team.teamNumber)} - OVR {team.averageOverall}{isMyTeam ? ' - seu time' : ''}
              </Text>
              <FlatList
                data={team.athletes}
                keyExtractor={(athlete) => athlete.id}
                scrollEnabled={false}
                renderItem={({ item: athlete }) => (
                  <Text style={[s.teamAthlete, athlete.id === athleteId && s.myTeamTitle]}>
                    {athlete.name}{athlete.id === athleteId ? ' (voce)' : ''} - {posLabel(athlete.position)} - {athlete.overall}
                  </Text>
                )}
              />
            </View>
          );
        }}
      />
    </View>
  );
}

export const TeamsSection = memo(TeamsSectionComponent);
