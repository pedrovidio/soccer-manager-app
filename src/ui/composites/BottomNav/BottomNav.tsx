import React, { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@ui/tokens/theme';
import { NAV_ITEMS, NAV_ROUTES, NavItem, NavTab } from './options';
import { styles } from './styles';

interface BottomNavProps {
  active: NavTab;
  onPress?: (tab: NavTab) => void;
}

function BottomNavComponent({ active, onPress }: BottomNavProps) {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const itemWidth = width / NAV_ITEMS.length;

  const handlePress = useCallback((tab: NavTab) => {
    if (onPress) { onPress(tab); return; }
    if (tab === active) return;
    router.push(NAV_ROUTES[tab] as any);
  }, [active, onPress, router]);

  const renderItem = useCallback(({ item }: { item: NavItem }) => {
    const isActive = item.key === active;

    return (
      <TouchableOpacity style={[styles.btn, { width: itemWidth }]} onPress={() => handlePress(item.key)}>
        <Ionicons
          name={isActive ? item.iconActive : item.icon}
          size={22}
          color={isActive ? Colors.primary : Colors.n400}
        />
        <Text style={[styles.label, isActive ? styles.labelActive : null]}>{item.label}</Text>
      </TouchableOpacity>
    );
  }, [active, handlePress, itemWidth]);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, 10) }]}>
      <FlatList
        data={NAV_ITEMS}
        horizontal
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        scrollEnabled={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

export const BottomNav = memo(BottomNavComponent);
export { NAV_ROUTES };
export type { NavTab };
