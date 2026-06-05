import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

function OverallCardComponent({ overall }: { overall: number }) {
  return (
    <View style={styles.overallCard}>
      <Text style={styles.overallLabel}>Seu Overall Estimado</Text>
      <Text style={styles.overallValue}>{overall}</Text>
      <Text style={styles.overallHint}>
        Varia dinamicamente conforme sua posicao, historico e atributos.
      </Text>
    </View>
  );
}

export const OverallCard = memo(OverallCardComponent);
