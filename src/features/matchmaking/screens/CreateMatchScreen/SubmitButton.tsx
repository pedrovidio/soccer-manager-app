import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type SubmitButtonProps = {
  isEditing: boolean;
  isPending: boolean;
  onPress: () => void;
};

function SubmitButtonComponent({ isEditing, isPending, onPress }: SubmitButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.submitBtn, isPending ? styles.submitBtnDisabled : null]}
      onPress={onPress}
      disabled={isPending}
      activeOpacity={0.8}
    >
      {isPending ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.submitBtnText}>{isEditing ? 'Atualizar partida' : 'Criar partida'}</Text>
      )}
    </TouchableOpacity>
  );
}

export const SubmitButton = memo(SubmitButtonComponent);
