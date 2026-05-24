import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type Props = {
  isAdmin: boolean;
  onInvite: () => void;
  onCreateMatch: () => void;
  onFinance: () => void;
};

function QuickActionsComponent({ isAdmin, onInvite, onCreateMatch, onFinance }: Props) {
  if (!isAdmin) return null;

  return (
    <View style={styles.actionsRow}>
      <QuickAction icon="person-add-outline" label="Convidar" onPress={onInvite} />
      <QuickAction icon="football-outline" label="Nova partida" onPress={onCreateMatch} />
      <QuickAction icon="wallet-outline" label="Financeiro" onPress={onFinance} />
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export const QuickActions = memo(QuickActionsComponent);
