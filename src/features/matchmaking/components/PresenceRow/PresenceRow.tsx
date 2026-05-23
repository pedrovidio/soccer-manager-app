import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { MatchPresence, PresenceStatus } from '../../types';
import { posLabel } from '../../utils/formatters';
import { s } from '../MatchHomeScreen.styles';

const STATUS_CONFIG: Record<PresenceStatus, { label: string; bg: string; color: string; icon: string }> = {
  CONFIRMED: { label: 'Confirmado', bg: Colors.successLight, color: Colors.successDark, icon: 'checkmark-circle' },
  WAITLISTED: { label: 'Na fila de espera', bg: Colors.primaryLight, color: Colors.primary, icon: 'hourglass-outline' },
  DECLINED: { label: 'Recusou', bg: Colors.errorLight, color: Colors.errorDark, icon: 'close-circle' },
  PENDING: { label: 'Aguardando confirmacao', bg: Colors.warningLight, color: Colors.warningDark, icon: 'time-outline' },
};

export const PresenceRow = memo(function PresenceRow({ item }: { item: MatchPresence }) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <View style={s.presenceRow}>
      <View style={s.presenceAvatar}>
        <Text style={s.presenceAvatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.presenceNameRow}>
          <Text style={s.presenceName}>{item.name}</Text>
          {item.isGuest && (
            <View style={s.guestTag}><Text style={s.guestTagText}>Avulso</Text></View>
          )}
        </View>
        <Text style={s.presenceSub}>{posLabel(item.position)} - OVR {item.overall}</Text>
      </View>
      <View style={[s.presenceBadge, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
        <Text style={[s.presenceBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
});
