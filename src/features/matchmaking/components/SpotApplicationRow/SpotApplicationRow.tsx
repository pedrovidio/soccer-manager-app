import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { SpotApplication } from '@features/matchmaking/types';
import { posLabel } from '@features/matchmaking/utils/formatters';
import { s } from '@features/matchmaking/screens/MatchHomeScreen.styles';

interface SpotApplicationRowProps {
  item: SpotApplication;
  isPending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const SpotApplicationRow = memo(function SpotApplicationRow({
  item, isPending, onAccept, onDecline,
}: SpotApplicationRowProps) {
  return (
    <View style={s.applicationRow}>
      <View style={s.guestAvatar}>
        <Text style={s.guestAvatarText}>{item.athleteName.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={s.guestName} numberOfLines={1}>{item.athleteName}</Text>
          {item.isPremium && <Ionicons name="rocket" size={14} color={Arena.neon} />}
        </View>
        <Text style={s.guestSub}>
          {posLabel(item.position)} - OVR {item.overall} - {item.age} anos
        </Text>
        {!item.isEligibleNow && <Text style={s.applicationWarning}>Atleta indisponivel agora</Text>}
      </View>
      <View style={s.applicationActions}>
        <TouchableOpacity
          style={[s.applicationBtn, s.applicationDecline]}
          onPress={onDecline}
          disabled={isPending}
        >
          <Ionicons name="close" size={14} color={Arena.error} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.applicationBtn, s.applicationAccept, (!item.isEligibleNow || isPending) && s.inviteBtnDisabled]}
          onPress={onAccept}
          disabled={!item.isEligibleNow || isPending}
        >
          {isPending
            ? <ActivityIndicator color={Arena.success} size="small" />
            : <Ionicons name="checkmark" size={14} color={Arena.success} />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
});
