import React, { memo, useCallback, useRef, useEffect } from 'react';
import { Animated, FlatList, Image, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { athleteApi } from '@features/athletes/services/athleteApi';
import { useAuthStore } from '@features/auth/useAuthStore';
import { getFullImageUrl } from '@lib/imageUrl';
import { queryKeys } from '@lib/queryKeys';
import { Arena } from '@ui/tokens/theme';
import { usePremium } from '../../../hooks/usePremium';
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
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  
  const { isPremium } = usePremium();
  const { data: dashboard } = useQuery({
    queryKey: queryKeys.dashboard(athleteId),
    queryFn: () => athleteApi.dashboard(athleteId),
    enabled: !!athleteId,
  });
  const visibleItems = NAV_ITEMS.filter((item) => item.key !== 'ranking' || isPremium);
  const profilePhotoUrl = getFullImageUrl(dashboard?.photoUrl);

  const itemWidth = width / visibleItems.length;
  const activeIndex = visibleItems.findIndex((item) => item.key === active);
  const translateX = useRef(new Animated.Value(0)).current;
  const isFirstLayout = useRef(true);

  const haloWidth = 54;
  const targetX = activeIndex * itemWidth + (itemWidth - haloWidth) / 2;

  useEffect(() => {
    if (itemWidth > 0 && activeIndex !== -1) {
      if (isFirstLayout.current) {
        translateX.setValue(targetX);
        isFirstLayout.current = false;
      } else {
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [activeIndex, itemWidth, targetX, translateX]);

  const handlePress = useCallback((tab: NavTab) => {
    if (onPress) { onPress(tab); return; }
    if (tab === active) return;
    router.push(NAV_ROUTES[tab] as any);
  }, [active, onPress, router]);

  const renderItem = useCallback(({ item }: { item: NavItem }) => {
    const isActive = item.key === active;

    return (
      <TouchableOpacity style={[styles.btn, { width: itemWidth }]} onPress={() => handlePress(item.key)} activeOpacity={0.8}>
        {item.key === 'profile' && profilePhotoUrl ? (
          <Image
            source={{ uri: profilePhotoUrl }}
            style={[styles.profilePhoto, isActive ? styles.profilePhotoActive : null]}
          />
        ) : (
          <Ionicons
            name={isActive ? item.iconActive : item.icon}
            size={22}
            color={isActive ? Arena.neon : Arena.textSubtle}
          />
        )}
        <Text style={[styles.label, isActive ? styles.labelActive : null]}>{item.label}</Text>
      </TouchableOpacity>
    );
  }, [active, handlePress, itemWidth, profilePhotoUrl]);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, 10) }]}>
      {itemWidth > 0 && activeIndex !== -1 && (
        <Animated.View
          style={[
            styles.activeHalo,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      <FlatList
        data={visibleItems}
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
