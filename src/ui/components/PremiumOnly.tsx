import type { PropsWithChildren } from 'react';
import { usePremium } from '../../hooks/usePremium';

export function PremiumOnly({ children }: PropsWithChildren) {
  const { isPremium } = usePremium();

  if (!isPremium) return null;

  return <>{children}</>;
}
