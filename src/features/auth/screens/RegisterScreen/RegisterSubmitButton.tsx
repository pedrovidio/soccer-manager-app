import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { styles } from './styles';

type RegisterSubmitButtonProps = {
  isLastStep: boolean;
  loading: boolean;
  onPress: () => void;
};

function RegisterSubmitButtonComponent({ isLastStep, loading, onPress }: RegisterSubmitButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, loading ? styles.btnDisabled : null]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.btnText}>{isLastStep ? 'Criar conta' : 'Continuar'}</Text>
      )}
    </TouchableOpacity>
  );
}

export const RegisterSubmitButton = memo(RegisterSubmitButtonComponent);
