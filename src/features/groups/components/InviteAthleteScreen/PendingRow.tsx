import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { GroupInviteItem } from '../../groupTypes';
import { positionLabel } from '../../utils/athleteLabels';
import { ResendState } from './types';
import { styles } from './styles';

type Props = {
  invite: GroupInviteItem;
  resendState: ResendState;
  onResend: (invite: GroupInviteItem) => void;
};

function PendingRowComponent({ invite, resendState, onResend }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, styles.avatarPending]}>
        <Text style={[styles.avatarText, styles.avatarTextPending]}>
          {invite.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{invite.name}</Text>
        <View style={styles.meta}>
          <View style={styles.posTag}>
            <Text style={styles.posTagText}>{positionLabel(invite.position)}</Text>
          </View>
          <Text style={styles.overall}>OVR {invite.overall}</Text>
          <View style={styles.pendingTag}>
            <Text style={styles.pendingTagText}>Pendente</Text>
          </View>
        </View>
      </View>
      {resendState === 'sending' ? (
        <View style={styles.resendBtn}>
          <ActivityIndicator size="small" color={Colors.n500} />
        </View>
      ) : resendState === 'sent' ? (
        <View style={[styles.resendBtn, styles.resendBtnSent]}>
          <Ionicons name="checkmark" size={13} color={Colors.success} />
          <Text style={[styles.resendBtnText, styles.resendBtnTextSent]}>Reenviado</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.resendBtn} onPress={() => onResend(invite)}>
          <Ionicons name="send-outline" size={13} color={Colors.n700} />
          <Text style={styles.resendBtnText}>Reenviar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const PendingRow = memo(PendingRowComponent);
