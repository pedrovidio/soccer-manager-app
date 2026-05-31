import React, { memo, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena, Colors } from '@ui/tokens/theme';
import { styles } from './styles';

interface AthleteRatingRowProps {
  name: string;
  position: string;
  overall: number;
  value?: number;
  disabled?: boolean;
  isSubmitting?: boolean;
  onRate: (stars: number) => void;
}

const STAR_OPTIONS = [1, 2, 3, 4, 5];

function AthleteRatingRowComponent({ name, position, overall, value = 0, disabled = false, isSubmitting = false, onRate }: AthleteRatingRowProps) {
  const renderStar = useCallback(({ item: stars }: { item: number }) => (
    <TouchableOpacity
      style={styles.starButton}
      onPress={() => onRate(stars)}
      disabled={disabled || isSubmitting}
      activeOpacity={0.7}
    >
      {isSubmitting && value === stars ? (
        <ActivityIndicator size="small" color={Colors.warningDark} />
      ) : (
        <Ionicons
          name={stars <= value ? 'star' : 'star-outline'}
          size={22}
          color={stars <= value ? Colors.warning : Arena.textSubtle}
        />
      )}
    </TouchableOpacity>
  ), [disabled, isSubmitting, onRate, value]);

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta}>{position} · OVR {overall}</Text>
      </View>
      <FlatList
        data={STAR_OPTIONS}
        keyExtractor={(item) => String(item)}
        renderItem={renderStar}
        horizontal
        scrollEnabled={false}
        contentContainerStyle={styles.stars}
      />
    </View>
  );
}

export const AthleteRatingRow = memo(AthleteRatingRowComponent);
