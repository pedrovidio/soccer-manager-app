import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../../common/theme';

interface AthleteRatingRowProps {
  name: string;
  position: string;
  overall: number;
  value?: number;
  disabled?: boolean;
  onRate: (stars: number) => void;
}

export function AthleteRatingRow({ name, position, overall, value = 0, disabled = false, onRate }: AthleteRatingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta}>{position} · OVR {overall}</Text>
      </View>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((stars) => (
          <TouchableOpacity
            key={stars}
            style={styles.starButton}
            onPress={() => onRate(stars)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            {disabled && value === stars ? (
              <ActivityIndicator size="small" color={Colors.warningDark} />
            ) : (
              <Ionicons
                name={stars <= value ? 'star' : 'star-outline'}
                size={22}
                color={stars <= value ? Colors.warning : Colors.n400}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r8, borderWidth: 1, borderColor: Colors.n200, paddingHorizontal: Spacing.sm, paddingVertical: 9, gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 12, fontWeight: '700', color: Colors.n900 },
  meta: { fontSize: 11, color: Colors.n500, marginTop: 2 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  starButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
