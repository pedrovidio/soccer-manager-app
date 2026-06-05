import React, { memo } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

export const HomeLoadingState = memo(function HomeLoadingState() {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator size="large" color={Arena.neon} />
    </SafeAreaView>
  );
});

export const HomeErrorState = memo(function HomeErrorState({ isForbidden, onPress }: { isForbidden: boolean; onPress: () => void }) {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <Ionicons name="alert-circle-outline" size={40} color={Arena.error} />
      <Text style={styles.errorText}>{isForbidden ? 'Voce nao tem acesso a este grupo' : 'Erro ao carregar o grupo'}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
        <Text style={styles.primaryBtnText}>{isForbidden ? 'Voltar' : 'Tentar novamente'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});
