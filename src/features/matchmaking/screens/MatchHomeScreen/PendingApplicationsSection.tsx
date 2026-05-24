import React, { memo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SpotApplicationRow } from '../../components/SpotApplicationRow';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type PendingApplicationsSectionProps = {
  controller: MatchHomeController;
};

function PendingApplicationsSectionComponent({ controller }: PendingApplicationsSectionProps) {
  const { data, isAdmin, respondSpotApplicationMutation, summary } = controller;
  if (!data || !summary || data.status === 'FINISHED' || !isAdmin || summary.pendingSpotApplications.length === 0) return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Candidaturas pendentes</Text>
      <FlatList
        data={summary.pendingSpotApplications}
        keyExtractor={(application) => application.id}
        scrollEnabled={false}
        renderItem={({ item: application }) => (
          <SpotApplicationRow
            item={application}
            isPending={respondSpotApplicationMutation.isPending && respondSpotApplicationMutation.variables?.applicationId === application.id}
            onAccept={() => respondSpotApplicationMutation.mutate({ applicationId: application.id, accept: true })}
            onDecline={() => respondSpotApplicationMutation.mutate({ applicationId: application.id, accept: false })}
          />
        )}
      />
    </View>
  );
}

export const PendingApplicationsSection = memo(PendingApplicationsSectionComponent);
