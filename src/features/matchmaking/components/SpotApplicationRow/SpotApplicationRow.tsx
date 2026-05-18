import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { SpotApplication } from '../../types';
import { posLabel } from '../../utils/formatters';
import { s } from '../MatchHomeScreen.styles';

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
        <Text style={s.guestName} numberOfLines={1}>{item.athleteName}</Text>
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
          <Ionicons name="close" size={14} color={Colors.errorDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.applicationBtn, s.applicationAccept, (!item.isEligibleNow || isPending) && s.inviteBtnDisabled]}
          onPress={onAccept}
          disabled={!item.isEligibleNow || isPending}
        >
          {isPending
            ? <ActivityIndicator color={Colors.successDark} size="small" />
            : <Ionicons name="checkmark" size={14} color={Colors.successDark} />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
});
