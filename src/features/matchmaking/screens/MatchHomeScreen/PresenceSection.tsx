import React, { memo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { PresenceRow } from '@features/matchmaking/components/PresenceRow';
import { s } from '../MatchHomeScreen.styles';
import { PRESENCE_FILTER_LABEL } from './options';
import { MatchHomeController } from './types';

type PresenceSectionProps = {
  controller: MatchHomeController;
};

function PresenceSectionComponent({ controller }: PresenceSectionProps) {
  const { data, presenceFilter, summary } = controller;
  if (!data || !summary || data.status === 'FINISHED') return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>
        {presenceFilter === 'ALL' ? 'Lista de presenca' : PRESENCE_FILTER_LABEL[presenceFilter]}
      </Text>
      {summary.filteredPresence.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyText}>Nenhum atleta encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={summary.filteredPresence}
          keyExtractor={(item) => item.athleteId}
          scrollEnabled={false}
          renderItem={({ item }) => <PresenceRow item={item} />}
        />
      )}
    </View>
  );
}

export const PresenceSection = memo(PresenceSectionComponent);
