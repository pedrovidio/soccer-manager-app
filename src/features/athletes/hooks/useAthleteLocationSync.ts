import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useMutation } from '@tanstack/react-query';
import { athleteApi } from '../services/athleteApi';

export function useAthleteLocationSync(athleteId: string, enabled = true) {
  const hasSynced = useRef(false);
  const mutation = useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      athleteApi.updateLocation(athleteId, latitude, longitude),
  });

  useEffect(() => {
    if (!athleteId || !enabled || hasSynced.current) return;
    hasSynced.current = true;

    let cancelled = false;
    async function syncLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED || cancelled) return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (cancelled) return;

      mutation.mutate({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    }

    syncLocation().catch(() => {
      hasSynced.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [athleteId, enabled]);

  return {
    isSyncingLocation: mutation.isPending,
    locationSyncError: mutation.error,
  };
}
