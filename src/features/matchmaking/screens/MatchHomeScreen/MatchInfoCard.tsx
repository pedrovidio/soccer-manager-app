import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeatureAccess } from '@features/app-config/hooks/useFeatureAccess';
import { Arena } from '@ui/tokens/theme';
import { phaseLabel } from '@features/matchmaking/utils/matchPhase';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type MatchInfoCardProps = {
  controller: MatchHomeController;
};

function MatchInfoCardComponent({ controller }: MatchInfoCardProps) {
  const liveMatchAccess = useFeatureAccess('LIVE_MATCH_SCORE');
  const { data, finishMatchMutation, goToLiveMatch, isAdmin, setFinishModalVisible, summary } = controller;
  if (!data || !summary) return null;

  const isFinished = data.status === 'FINISHED';
  const canOpenLiveMatch = data.status === 'IN_PROGRESS';
  const waiting = summary.phase === 'WAITING_CONFIRMATION';

  return (
    <View style={s.infoCard}>
      <View style={s.infoRow}>
        <View style={s.infoItem}>
          <Ionicons name="time-outline" size={18} color={Arena.neon} />
          <Text style={s.infoValue}>{summary.time}</Text>
          <Text style={s.infoLabel}>Horario</Text>
        </View>
        <View style={s.infoDivider} />
        <View style={s.infoItem}>
          <Ionicons name="football-outline" size={18} color={Arena.neon} />
          <Text style={s.infoValue}>{data.type}</Text>
          <Text style={s.infoLabel}>Modalidade</Text>
        </View>
        <View style={s.infoDivider} />
        <View style={s.infoItem}>
          <Ionicons name="people-outline" size={18} color={Arena.neon} />
          <Text style={s.infoValue}>{data.totalVacancies}</Text>
          <Text style={s.infoLabel}>Vagas</Text>
        </View>
      </View>

      <View style={[s.statusBadge, { backgroundColor: waiting ? Arena.warningBg : Arena.neonSoft }]}>
        <Text style={[s.statusBadgeText, { color: waiting ? Arena.warning : Arena.neon }]}>
          {phaseLabel(summary.phase)}
        </Text>
      </View>

      {canOpenLiveMatch && liveMatchAccess.hasAccess && (
        <TouchableOpacity style={s.liveMatchBtn} onPress={goToLiveMatch} activeOpacity={0.8}>
          <Ionicons name="radio-outline" size={18} color={Arena.buttonLabelPrimary} />
          <Text style={s.liveMatchBtnText}>Transmissao ao Vivo</Text>
        </TouchableOpacity>
      )}

      {isAdmin && data.status === 'IN_PROGRESS' && (
        <View style={s.adminActionsRow}>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnFinish]}
            onPress={() => setFinishModalVisible(true)}
            disabled={finishMatchMutation.isPending}
            activeOpacity={0.7}
          >
            {finishMatchMutation.isPending ? (
              <ActivityIndicator color={Arena.success} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color={Arena.success} />
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
