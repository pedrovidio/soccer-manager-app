import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Invite } from '@features/athletes/athleteTypes';
import { Colors } from '@ui/tokens/theme';
import { InfoLine } from './InfoLine';
import { formatMarketplaceDate } from './marketplaceFormatters';
import { styles } from './styles';

type InviteCardProps = {
  invite: Invite;
  isPending: boolean;
  onAccept: (invite: Invite) => void;
  onDecline: (invite: Invite) => void;
};

function InviteCardComponent({ invite, isPending, onAccept, onDecline }: InviteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons name="mail-outline" size={20} color={Colors.primary} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{invite.matchGroupName ?? 'Grupo'}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{invite.matchLocation ?? 'Local a confirmar'}</Text>
        </View>
      </View>

      <InfoLine icon="calendar-outline" text={formatMarketplaceDate(invite.matchDate)} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => onDecline(invite)} disabled={isPending}>
          <Text style={styles.secondaryBtnText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.primaryBtnExpanded, isPending ? styles.disabledBtn : null]}
          onPress={() => onAccept(invite)}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Aceitar vaga</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const InviteCard = memo(InviteCardComponent);
