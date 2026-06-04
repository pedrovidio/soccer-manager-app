import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

function EmptySearchResultComponent() {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name="person-outline" size={28} color={Arena.textSubtle} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum atleta encontrado</Text>
      <Text style={styles.emptyText}>Tente um nome diferente ou verifique se o atleta esta cadastrado.</Text>
    </View>
  );
}

export const EmptySearchResult = memo(EmptySearchResultComponent);
