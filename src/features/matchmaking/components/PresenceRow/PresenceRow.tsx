import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { MatchPresence, PresenceStatus } from '@features/matchmaking/types';
import { posLabel } from '@features/matchmaking/utils/formatters';
import { s } from '@features/matchmaking/screens/MatchHomeScreen.styles';

const STATUS_CONFIG: Record<PresenceStatus, { label: string; bg: string; color: string; icon: string }> = {
  get CONFIRMED() { return { label: 'Confirmado', bg: Arena.successBg, color: Arena.success, icon: 'checkmark-circle' }; },
  get WAITLISTED() { return { label: 'Na fila de espera', bg: Arena.neonSoft, color: Arena.neon, icon: 'hourglass-outline' }; },
  get DECLINED() { return { label: 'Recusou', bg: Arena.errorBg, color: Arena.error, icon: 'close-circle' }; },
  get PENDING() { return { label: 'Aguardando confirmacao', bg: Arena.warningBg, color: Arena.warning, icon: 'time-outline' }; },
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
