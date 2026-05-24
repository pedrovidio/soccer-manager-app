import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { styles } from './styles';

function SubmitButtonComponent({ isPending, isLastStep, onPress }: { isPending: boolean; isLastStep: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.btn, isPending ? styles.btnDisabled : null]} onPress={onPress} disabled={isPending}>
      {isPending
        ? <ActivityIndicator color={Colors.white} />
        : <Text style={styles.btnText}>{isLastStep ? 'Salvar' : 'Continuar'}</Text>}
    </TouchableOpacity>
  );
}

export const SubmitButton = memo(SubmitButtonComponent);
