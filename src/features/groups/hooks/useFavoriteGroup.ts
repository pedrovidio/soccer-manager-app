import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favorite_group_id';

export function useFavoriteGroup() {
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => setFavoriteId(v));
  }, []);

  const toggle = useCallback(async (groupId: string) => {
    const next = favoriteId === groupId ? null : groupId;
    setFavoriteId(next);
    if (next) await AsyncStorage.setItem(KEY, next);
    else await AsyncStorage.removeItem(KEY);
  }, [favoriteId]);

  const clear = useCallback(async () => {
    setFavoriteId(null);
    await AsyncStorage.removeItem(KEY);
  }, []);

  return { favoriteId, toggle, clear };
}
