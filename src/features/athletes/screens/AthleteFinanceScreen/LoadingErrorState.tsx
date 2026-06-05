import React, { memo } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

export const AthleteFinanceLoadingState = memo(function AthleteFinanceLoadingState() {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator size="large" color={Arena.neon} />
    </SafeAreaView>
  );
});

export const AthleteFinanceErrorState = memo(function AthleteFinanceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.center, { flex: 1 }]}>
        <Ionicons name="alert-circle-outline" size={42} color={Arena.error} />
        <Text style={styles.errorText}>Erro ao carregar financeiro</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRetry}>
          <Text style={styles.primaryBtnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});
