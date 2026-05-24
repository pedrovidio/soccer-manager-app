import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type MatchActionsSectionProps = {
  controller: MatchHomeController;
};

function MatchActionsSectionComponent({ controller }: MatchActionsSectionProps) {
  const { cancelPresenceMutation, confirmCancelPresence, data, isAdmin, matchmakingMutation, summary } = controller;
  if (!data || !summary) return null;

  const isFinished = data.status === 'FINISHED';
  const isParticipant = summary.currentPresence?.status === 'CONFIRMED';
  if (isFinished || (!isParticipant && !isAdmin)) return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Acoes da partida</Text>
      <View style={s.matchActionsCard}>
        {isParticipant && data.status !== 'CANCELLED' && (
          <TouchableOpacity
            style={[s.secondaryActionBtn, s.secondaryActionDanger]}
            onPress={confirmCancelPresence}
            disabled={cancelPresenceMutation.isPending}
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={16} color={Colors.errorDark} />
            <Text style={[s.secondaryActionText, { color: Colors.errorDark }]}>
              {cancelPresenceMutation.isPending ? 'Cancelando...' : 'Cancelar check-in'}
            </Text>
          </TouchableOpacity>
        )}

        {isAdmin && data.status !== 'CANCELLED' && (
          <View style={s.inlineActionRow}>
            <TouchableOpacity
              style={[s.secondaryActionBtn, s.flex1]}
              onPress={() => matchmakingMutation.mutate()}
              disabled={!summary.canDrawTeams || matchmakingMutation.isPending}
              activeOpacity={0.7}
            >
              <Ionicons name="shuffle-outline" size={16} color={Colors.primary} />
              <Text style={s.secondaryActionText}>{summary.canDrawTeams ? 'Sortear times' : 'Aguardando minimo'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export const MatchActionsSection = memo(MatchActionsSectionComponent);
