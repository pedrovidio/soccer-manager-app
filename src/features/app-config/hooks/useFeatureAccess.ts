import { usePremium } from '../../../hooks/usePremium';
import { FeatureKey, resolveFeatureAccess } from '../featureFlags';
import { useFeatureFlags } from './useFeatureFlags';

export function useFeatureAccess(featureKey: FeatureKey) {
  const { isPremium } = usePremium();
  const featureFlags = useFeatureFlags();
  const feature = featureFlags.byKey.get(featureKey);

  return resolveFeatureAccess({
    feature,
    featureKey,
    isLoading: featureFlags.isLoading,
    isPremium,
  });
}
