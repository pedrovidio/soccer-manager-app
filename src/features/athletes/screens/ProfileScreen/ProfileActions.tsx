import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena, Colors } from '@ui/tokens/theme';
import { styles } from './styles';

function ProfileActionsComponent({ onGroups, onLogout }: { onGroups: () => void; onLogout: () => void }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.actionRow} onPress={onGroups}>
        <Ionicons name="people-outline" size={20} color={Arena.neon} />
        <Text style={styles.actionLabel}>Meus grupos</Text>
        <Ionicons name="chevron-forward" size={16} color={Arena.textSubtle} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.actionRow} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={[styles.actionLabel, styles.actionLabelDanger]}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

export const ProfileActions = memo(ProfileActionsComponent);
