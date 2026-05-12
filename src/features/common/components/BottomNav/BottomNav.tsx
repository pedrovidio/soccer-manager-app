import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme';

export type NavTab = 'home' | 'groups' | 'financial' | 'profile';

/** Mapeia cada tab para sua rota Expo Router */
export const NAV_ROUTES: Record<NavTab, string> = {
  home:      '/',
  groups:    '/groups',
  financial: '/athlete-finance',
  profile:   '/profile',
};

interface NavItem {
  key: NavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const ITEMS: NavItem[] = [
  { key: 'home',      label: 'Início',     icon: 'home-outline',   iconActive: 'home' },
  { key: 'groups',    label: 'Grupos',     icon: 'people-outline', iconActive: 'people' },
  { key: 'financial', label: 'Financeiro', icon: 'wallet-outline', iconActive: 'wallet' },
  { key: 'profile',   label: 'Perfil',     icon: 'person-outline', iconActive: 'person' },
];

interface BottomNavProps {
  active: NavTab;
  /** Opcional: sobrescreve o comportamento padrão de navegação */
  onPress?: (tab: NavTab) => void;
}

export function BottomNav({ active, onPress }: BottomNavProps) {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();

  function handlePress(tab: NavTab) {
    if (onPress) { onPress(tab); return; }
    if (tab === active) return;
    router.push(NAV_ROUTES[tab] as any);
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, 10) }]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <TouchableOpacity key={item.key} style={styles.btn} onPress={() => handlePress(item.key)}>
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
