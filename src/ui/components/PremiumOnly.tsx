import type { PropsWithChildren } from 'react';
import { useFeatureAccess } from '@features/app-config/hooks/useFeatureAccess';
import type { FeatureKey } from '@features/app-config/featureFlags';
import { usePremium } from '../../hooks/usePremium';

type PremiumOnlyProps = PropsWithChildren<{
  featureKey?: FeatureKey;
}>;

export function PremiumOnly({ children, featureKey }: PremiumOnlyProps) {
  if (featureKey) {
    return <FeaturePremiumOnly featureKey={featureKey}>{children}</FeaturePremiumOnly>;
  }

  return <PlanPremiumOnly>{children}</PlanPremiumOnly>;
}

function FeaturePremiumOnly({ children, featureKey }: PremiumOnlyProps & { featureKey: FeatureKey }) {
  const featureAccess = useFeatureAccess(featureKey);

  return featureAccess.hasAccess ? <>{children}</> : null;
}

function PlanPremiumOnly({ children }: PropsWithChildren) {
  const { isPremium } = usePremium();

  if (!isPremium) return null;

  return <>{children}</>;
}
