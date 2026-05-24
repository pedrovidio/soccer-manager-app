import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

function SectionHeaderComponent({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export const SectionHeader = memo(SectionHeaderComponent);
