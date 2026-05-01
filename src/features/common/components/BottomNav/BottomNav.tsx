import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme';

export type NavTab = 'home' | 'matches' | 'groups' | 'financial' | 'profile';

interface NavItem {
  key: NavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const ITEMS: NavItem[] = [
  { key: 'home',      label: 'Início',     icon: 'home-outline',          iconActive: 'home' },
  { key: 'matches',   label: 'Partidas',   icon: 'football-outline',      iconActive: 'football' },
  { key: 'groups',    label: 'Grupos',     icon: 'people-outline',        iconActive: 'people' },
  { key: 'financial', label: 'Financeiro', icon: 'wallet-outline',        iconActive: 'wallet' },
  { key: 'profile',   label: 'Perfil',     icon: 'person-outline',        iconActive: 'person' },
];

interface BottomNavProps {
  active: NavTab;
  onPress: (tab: NavTab) => void;
}

export function BottomNav({ active, onPress }: BottomNavProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, 10) }]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <TouchableOpacity key={item.key} style={styles.btn} onPress={() => onPress(item.key)}>
            <Ionicons
              name={isActive ? item.iconActive : item.icon}
              size={22}
              color={isActive ? Colors.primary : Colors.n400}
            />
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: Colors.n200,
    paddingTop: 6,
  },
  btn:         { flex: 1, alignItems: 'center', gap: 2 },
  label:       { fontSize: 10, fontWeight: '500', color: Colors.n400 },
  labelActive: { color: Colors.primary, fontWeight: '600' },
});
