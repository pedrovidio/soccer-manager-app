import React, { memo } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

export const MembersLoadingState = memo(function MembersLoadingState() {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </SafeAreaView>
  );
});

export const MembersErrorState = memo(function MembersErrorState({ isForbidden, onPress }: { isForbidden: boolean; onPress: () => void }) {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
      <Text style={styles.errorText}>{isForbidden ? 'Voce nao tem acesso a este grupo' : 'Erro ao carregar membros'}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
        <Text style={styles.primaryBtnText}>{isForbidden ? 'Voltar' : 'Tentar novamente'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});
