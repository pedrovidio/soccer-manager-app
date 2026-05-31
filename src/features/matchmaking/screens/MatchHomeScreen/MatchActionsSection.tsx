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
  const {
    cancelPresenceMutation,
    confirmCancelPresence,
    confirmPresenceMutation,
    data,
    isAdmin,
    matchmakingMutation,
    summary,
  } = controller;

  if (!data || !summary) return null;

  const isFinished = data.status === 'FINISHED';
  const isCancelled = data.status === 'CANCELLED';
  if (isFinished || isCancelled) return null;

  const isParticipant = summary.currentPresence?.status === 'CONFIRMED';
  const showCheckIn = summary.phase !== 'TEAMS_DRAWN';
  const showDrawTeams = isAdmin && summary.canDrawTeams;

  if (!showCheckIn && !showDrawTeams) return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Acoes da partida</Text>
      <View style={s.matchActionsCard}>
        {showCheckIn && (
          isParticipant ? (
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
          ) : (
            <TouchableOpacity
              style={[s.secondaryActionBtn, s.secondaryActionDone]}
              onPress={() => confirmPresenceMutation.mutate()}
              disabled={confirmPresenceMutation.isPending}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
              <Text style={[s.secondaryActionText, { color: Colors.success }]}>
                {confirmPresenceMutation.isPending ? 'Confirmando...' : 'Confirmar check-in'}
              </Text>
            </TouchableOpacity>
          )
        )}

        {showDrawTeams && (
          <View style={s.inlineActionRow}>
            <TouchableOpacity
              style={[s.secondaryActionBtn, s.flex1]}
              onPress={() => matchmakingMutation.mutate()}
              disabled={matchmakingMutation.isPending}
              activeOpacity={0.7}
            >
              <Ionicons name="shuffle-outline" size={16} color={Colors.primary} />
              <Text style={s.secondaryActionText}>
                {matchmakingMutation.isPending ? 'Sorteando...' : 'Sortear times'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export const MatchActionsSection = memo(MatchActionsSectionComponent);
