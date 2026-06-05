import React, { memo } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

export const FinanceLoadingState = memo(function FinanceLoadingState() {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator size="large" color={Arena.neon} />
    </SafeAreaView>
  );
});

type ErrorProps = {
  isForbidden: boolean;
  onPress: () => void;
};

export const FinanceErrorState = memo(function FinanceErrorState({ isForbidden, onPress }: ErrorProps) {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <Ionicons name="alert-circle-outline" size={42} color={Arena.error} />
      <Text style={styles.errorText}>{isForbidden ? 'Voce nao tem acesso a este grupo' : 'Erro ao carregar financeiro'}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
        <Text style={styles.primaryBtnText}>{isForbidden ? 'Voltar' : 'Tentar novamente'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});
