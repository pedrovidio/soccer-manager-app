import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const LEGACY_KEY = 'favorite_group_id';
const keyForAthlete = (athleteId: string) => `${LEGACY_KEY}:${athleteId}`;

interface FavoriteGroupStore {
  favoriteIds: Record<string, string | null>;
  hydratedAthleteIds: Record<string, boolean>;
  hydrate: (athleteId: string) => Promise<void>;
  toggle: (athleteId: string, groupId: string) => Promise<void>;
  clear: (athleteId: string) => Promise<void>;
}

const useFavoriteGroupStore = create<FavoriteGroupStore>((set, get) => ({
  favoriteIds: {},
  hydratedAthleteIds: {},

  hydrate: async (athleteId) => {
    if (!athleteId || get().hydratedAthleteIds[athleteId]) return;

    const storageKey = keyForAthlete(athleteId);
    const [storedId, legacyId] = await Promise.all([
      AsyncStorage.getItem(storageKey),
      AsyncStorage.getItem(LEGACY_KEY),
    ]);
    const favoriteId = storedId ?? legacyId;

    if (!storedId && legacyId) {
      await AsyncStorage.setItem(storageKey, legacyId);
      await AsyncStorage.removeItem(LEGACY_KEY);
    }

    set((state) => ({
      favoriteIds: { ...state.favoriteIds, [athleteId]: favoriteId },
      hydratedAthleteIds: { ...state.hydratedAthleteIds, [athleteId]: true },
    }));
  },

  toggle: async (athleteId, groupId) => {
    if (!athleteId) return;

    const current = get().favoriteIds[athleteId] ?? null;
    const next = current === groupId ? null : groupId;

    set((state) => ({
      favoriteIds: { ...state.favoriteIds, [athleteId]: next },
      hydratedAthleteIds: { ...state.hydratedAthleteIds, [athleteId]: true },
    }));

    if (next) await AsyncStorage.setItem(keyForAthlete(athleteId), next);
    else await AsyncStorage.removeItem(keyForAthlete(athleteId));
  },

  clear: async (athleteId) => {
    if (!athleteId) return;

    set((state) => ({
      favoriteIds: { ...state.favoriteIds, [athleteId]: null },
      hydratedAthleteIds: { ...state.hydratedAthleteIds, [athleteId]: true },
    }));
    await AsyncStorage.removeItem(keyForAthlete(athleteId));
  },
}));

export function useFavoriteGroup(athleteId: string) {
  const favoriteId = useFavoriteGroupStore((state) => state.favoriteIds[athleteId] ?? null);
  const hydrate = useFavoriteGroupStore((state) => state.hydrate);
  const toggleFavorite = useFavoriteGroupStore((state) => state.toggle);
  const clearFavorite = useFavoriteGroupStore((state) => state.clear);

  useEffect(() => {
    void hydrate(athleteId);
  }, [athleteId, hydrate]);

  return {
    favoriteId,
    toggle: (groupId: string) => toggleFavorite(athleteId, groupId),
    clear: () => clearFavorite(athleteId),
  };
}
