import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { phaseLabel } from '../../utils/matchPhase';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type MatchInfoCardProps = {
  controller: MatchHomeController;
};

function MatchInfoCardComponent({ controller }: MatchInfoCardProps) {
  const { data, finishMatchMutation, isAdmin, setFinishModalVisible, summary } = controller;
  if (!data || !summary) return null;

  const isFinished = data.status === 'FINISHED';
  const waiting = summary.phase === 'WAITING_CONFIRMATION';

  return (
    <View style={s.infoCard}>
      <View style={s.infoRow}>
        <View style={s.infoItem}>
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <Text style={s.infoValue}>{summary.time}</Text>
          <Text style={s.infoLabel}>Horario</Text>
        </View>
        <View style={s.infoDivider} />
        <View style={s.infoItem}>
          <Ionicons name="football-outline" size={18} color={Colors.primary} />
          <Text style={s.infoValue}>{data.type}</Text>
          <Text style={s.infoLabel}>Modalidade</Text>
        </View>
        <View style={s.infoDivider} />
        <View style={s.infoItem}>
          <Ionicons name="people-outline" size={18} color={Colors.primary} />
          <Text style={s.infoValue}>{data.totalVacancies}</Text>
          <Text style={s.infoLabel}>Vagas</Text>
        </View>
      </View>

      <View style={[s.statusBadge, { backgroundColor: waiting ? Colors.warningLight : Colors.primaryLight }]}>
        <Text style={[s.statusBadgeText, { color: waiting ? Colors.warningDark : Colors.primary }]}>
          {phaseLabel(summary.phase)}
        </Text>
      </View>

      {isAdmin && !isFinished && data.status !== 'CANCELLED' && (
        <View style={s.adminActionsRow}>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnFinish]}
            onPress={() => setFinishModalVisible(true)}
            disabled={finishMatchMutation.isPending}
            activeOpacity={0.7}
          >
            {finishMatchMutation.isPending ? (
              <ActivityIndicator color={Colors.successDark} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color={Colors.successDark} />
                <Text style={s.actionBtnTextFinish}>Finalizar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export const MatchInfoCard = memo(MatchInfoCardComponent);
