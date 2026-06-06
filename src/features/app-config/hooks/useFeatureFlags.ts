import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@lib/queryKeys';
import { featureFlagsApi } from '../services/featureFlagsApi';
import type { FeatureFlag, FeatureKey } from '../featureFlags';

export function useFeatureFlags() {
  const query = useQuery({
    queryKey: queryKeys.featureFlags(),
    queryFn: featureFlagsApi.list,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const byKey = useMemo(() => {
    const entries = (query.data ?? []).map((flag) => [flag.key, flag] as const);
    return new Map<FeatureKey, FeatureFlag>(entries);
  }, [query.data]);

  return {
    ...query,
    byKey,
    flags: query.data ?? [],
  };
}
