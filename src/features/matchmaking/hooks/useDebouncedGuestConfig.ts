import { useEffect, useState } from 'react';
import { Gender } from '../types';

interface GuestFilterState {
  radiusKm: string;
  minAge: string;
  maxAge: string;
  gender: Gender;
  minOverall: string;
}

export interface DebouncedGuestConfig {
  radiusKm: number;
  minAge: number;
  maxAge: number;
  gender: Gender;
  minOverall: number;
}

export function useDebouncedGuestConfig(filters: GuestFilterState): DebouncedGuestConfig {
  const [debouncedConfig, setDebouncedConfig] = useState<DebouncedGuestConfig>({
    radiusKm: 10,
    minAge: 16,
    maxAge: 50,
    gender: 'ANY',
    minOverall: 0,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedConfig({
        radiusKm: +filters.radiusKm || 10,
        minAge: +filters.minAge || 16,
        maxAge: +filters.maxAge || 50,
        gender: filters.gender,
        minOverall: +filters.minOverall || 0,
      });
    }, 600);
    return () => clearTimeout(t);
  }, [filters.radiusKm, filters.minAge, filters.maxAge, filters.gender, filters.minOverall]);

  return debouncedConfig;
}
