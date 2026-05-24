import React, { memo } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav } from '../../../../ui/composites/BottomNav/BottomNav';
import { Colors } from '../../../../ui/tokens/theme';
import { styles } from './styles';

export const AthleteFinanceLoadingState = memo(function AthleteFinanceLoadingState() {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </SafeAreaView>
  );
});

export const AthleteFinanceErrorState = memo(function AthleteFinanceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <Ionicons name="alert-circle-outline" size={42} color={Colors.error} />
      <Text style={styles.errorText}>Erro ao carregar financeiro</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onRetry}>
        <Text style={styles.primaryBtnText}>Tentar novamente</Text>
      </TouchableOpacity>
      <BottomNav active="financial" />
    </SafeAreaView>
  );
});
