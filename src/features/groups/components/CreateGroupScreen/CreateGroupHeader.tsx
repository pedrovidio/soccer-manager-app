import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { styles } from './styles';

type Props = {
  step: 1 | 2;
  onBack: () => void;
};

function CreateGroupHeaderComponent({ step, onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color={Colors.n900} />
      </TouchableOpacity>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{step === 1 ? 'Criar grupo' : 'Adicionar participantes'}</Text>
        <Text style={styles.headerSub}>
          {step === 1 ? 'Passo 1 de 2 - Configuracoes' : 'Passo 2 de 2 - Convites'}
        </Text>
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, step >= 2 ? styles.dotActive : null]} />
      </View>
    </View>
  );
}

export const CreateGroupHeader = memo(CreateGroupHeaderComponent);
