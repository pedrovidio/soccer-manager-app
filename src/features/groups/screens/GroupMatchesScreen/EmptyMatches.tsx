import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type Props = {
  isAdmin: boolean;
  onCreateMatch: () => void;
};

function EmptyMatchesComponent({ isAdmin, onCreateMatch }: Props) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="football-outline" size={34} color={Colors.n300} />
      <Text style={styles.emptyText}>Nenhuma partida agendada</Text>
      {isAdmin && (
        <TouchableOpacity style={styles.emptyAction} onPress={onCreateMatch}>
          <Text style={styles.emptyActionText}>Marcar partida</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const EmptyMatches = memo(EmptyMatchesComponent);
