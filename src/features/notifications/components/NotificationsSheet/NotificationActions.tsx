import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type InviteActionsProps = {
  isAcceptBlocked?: boolean;
  isPending?: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

function InviteActionsComponent({ isAcceptBlocked, isPending, onAccept, onDecline }: InviteActionsProps) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnAccept]}
        onPress={onAccept}
        disabled={isPending || isAcceptBlocked}
      >
        <Ionicons
          name={isAcceptBlocked ? 'lock-closed' : 'checkmark'}
          size={14}
          color={isAcceptBlocked ? Colors.n500 : Colors.successDark}
        />
        <Text style={[styles.actionBtnText, { color: isAcceptBlocked ? Colors.n500 : Colors.successDark }]}>
          {isAcceptBlocked ? 'Bloqueado' : 'Aceitar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnDecline]}
        onPress={onDecline}
        disabled={isPending}
      >
        <Ionicons name="close" size={14} color={Colors.errorDark} />
        <Text style={[styles.actionBtnText, { color: Colors.errorDark }]}>Recusar</Text>
      </TouchableOpacity>
    </View>
  );
}

type SpotApplicationActionsProps = {
  isPending?: boolean;
  onApprove: () => void;
  onDecline: () => void;
};

function SpotApplicationActionsComponent({ isPending, onApprove, onDecline }: SpotApplicationActionsProps) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnAccept]}
        onPress={onApprove}
        disabled={isPending}
      >
        <Ionicons name="checkmark" size={14} color={Colors.successDark} />
        <Text style={[styles.actionBtnText, { color: Colors.successDark }]}>Aprovar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnDecline]}
        onPress={onDecline}
        disabled={isPending}
      >
        <Ionicons name="close" size={14} color={Colors.errorDark} />
        <Text style={[styles.actionBtnText, { color: Colors.errorDark }]}>Recusar</Text>
      </TouchableOpacity>
    </View>
  );
}

export const InviteActions = memo(InviteActionsComponent);
export const SpotApplicationActions = memo(SpotApplicationActionsComponent);
