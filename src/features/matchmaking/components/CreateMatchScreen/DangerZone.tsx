import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { CancelMode } from './types';
import { styles } from './styles';

type DangerZoneProps = {
  isRecurring: boolean;
  isPending: boolean;
  onCancel: (mode: CancelMode) => void;
};

function DangerZoneComponent({ isRecurring, isPending, onCancel }: DangerZoneProps) {
  return (
    <View style={styles.dangerZone}>
      <View>
        <Text style={styles.dangerTitle}>Cancelamento</Text>
        <Text style={styles.dangerText}>
          Essa ação avisa os atletas confirmados e não deve ficar na tela principal da partida.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.dangerBtn}
        onPress={() => onCancel('single')}
        disabled={isPending}
        activeOpacity={0.8}
      >
        <Ionicons name="close-circle-outline" size={16} color={Colors.errorDark} />
        <Text style={styles.dangerBtnText}>
          {isRecurring ? 'Cancelar esta partida' : 'Cancelar partida'}
        </Text>
      </TouchableOpacity>

      {isRecurring && (
        <TouchableOpacity
          style={[styles.dangerBtn, styles.dangerBtnStrong]}
          onPress={() => onCancel('series')}
          disabled={isPending}
          activeOpacity={0.8}
        >
          <Ionicons name="ban-outline" size={16} color={Colors.white} />
          <Text style={styles.dangerBtnStrongText}>Cancelar recorrência</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const DangerZone = memo(DangerZoneComponent);
