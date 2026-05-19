import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';
import { LevelCardProps } from './types';

function LevelCardComponent({ value, label, desc, icon, isSelected, onSelect }: LevelCardProps) {
  return (
    <TouchableOpacity
      style={[styles.levelCard, isSelected ? styles.levelCardActive : null]}
      onPress={() => onSelect(value)}
    >
      <Text style={styles.levelIcon}>{icon}</Text>
      <View style={styles.levelContent}>
        <Text style={[styles.levelLabel, isSelected ? styles.levelLabelActive : null]}>{label}</Text>
        <Text style={styles.levelDesc}>{desc}</Text>
      </View>
      <View style={[styles.radio, isSelected ? styles.radioActive : null]}>
        {isSelected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

export const LevelCard = memo(LevelCardComponent);
