import { useEffect, useState } from 'react';
import { useAuthStore } from '@features/auth/useAuthStore';

export function usePremium(): { isPremium: boolean } {
  const plan = useAuthStore((state) => state.plan);
  const planExpiresAt = useAuthStore((state) => state.planExpiresAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (plan !== 'PREMIUM' || !planExpiresAt) return;

    const expiresAt = new Date(planExpiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return;

    const timeoutId = setTimeout(
      () => setNow(Date.now()),
      Math.min(expiresAt - Date.now() + 1, 2_147_483_647),
    );

    return () => clearTimeout(timeoutId);
  }, [plan, planExpiresAt]);

  const expiresAt = planExpiresAt ? new Date(planExpiresAt).getTime() : Number.NaN;
  const isActive =
    plan === 'PREMIUM' &&
    (!planExpiresAt || (Number.isFinite(expiresAt) && now < expiresAt));

  return {
    isPremium: isActive,
  };
}
