import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { AthleteSearchResult } from '../../groupTypes';
import { positionLabel } from '../../utils/athleteLabels';
import { InviteState } from './types';
import { styles } from './styles';

type Props = {
  athlete: AthleteSearchResult;
  inviteState: InviteState;
  onInvite: (athlete: AthleteSearchResult) => void;
};

function SearchResultRowComponent({ athlete, inviteState, onInvite }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{athlete.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{athlete.name}</Text>
        <View style={styles.meta}>
          <View style={styles.posTag}>
            <Text style={styles.posTagText}>{positionLabel(athlete.position)}</Text>
          </View>
          <Text style={styles.overall}>OVR {athlete.overall}</Text>
          <Text style={styles.email} numberOfLines={1}>{athlete.email}</Text>
        </View>
      </View>
      {inviteState === 'sending' ? (
        <View style={styles.inviteBtn}>
          <ActivityIndicator size="small" color={Colors.white} />
        </View>
      ) : inviteState === 'sent' ? (
        <View style={[styles.inviteBtn, styles.inviteBtnSent]}>
          <Ionicons name="checkmark" size={14} color={Colors.success} />
          <Text style={[styles.inviteBtnText, styles.inviteBtnTextSent]}>Enviado</Text>
        </View>
      ) : inviteState === 'error' ? (
        <TouchableOpacity style={[styles.inviteBtn, styles.inviteBtnError]} onPress={() => onInvite(athlete)}>
          <Ionicons name="refresh-outline" size={14} color={Colors.error} />
          <Text style={[styles.inviteBtnText, styles.inviteBtnTextError]}>Tentar novamente</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.inviteBtn} onPress={() => onInvite(athlete)}>
          <Ionicons name="person-add-outline" size={14} color={Colors.white} />
          <Text style={styles.inviteBtnText}>Convidar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const SearchResultRow = memo(SearchResultRowComponent);
