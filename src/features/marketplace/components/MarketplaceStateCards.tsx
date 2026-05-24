import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type DebtLockCardProps = {
  message: string;
  onFinance: () => void;
};

function DebtLockCardComponent({ message, onFinance }: DebtLockCardProps) {
  return (
    <View style={styles.lockCard}>
      <Ionicons name="lock-closed-outline" size={24} color={Colors.errorDark} />
      <View style={styles.lockBody}>
        <Text style={styles.lockTitle}>Marketplace bloqueado</Text>
        <Text style={styles.lockText}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.financeBtn} onPress={onFinance}>
        <Text style={styles.financeBtnText}>Ver</Text>
      </TouchableOpacity>
    </View>
  );
}

function LocationWarningCardComponent() {
  return (
    <View style={styles.infoCard}>
      <Ionicons name="location-outline" size={24} color={Colors.warningDark} />
      <Text style={styles.infoTitle}>Localização necessária</Text>
      <Text style={styles.infoText}>Habilite a localização para buscar partidas abertas perto de você.</Text>
    </View>
  );
}

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  tone?: 'neutral' | 'error';
};

function EmptyStateComponent({ icon, text, tone = 'neutral' }: EmptyStateProps) {
  const color = tone === 'error' ? Colors.error : Colors.n300;

  return (
    <View style={styles.emptyCard}>
      <Ionicons name={icon} size={34} color={color} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export const DebtLockCard = memo(DebtLockCardComponent);
export const EmptyState = memo(EmptyStateComponent);
export const LocationWarningCard = memo(LocationWarningCardComponent);
