import { resolveFeatureAccess, type FeatureFlag } from './featureFlags';

const baseFlag: FeatureFlag = {
  id: 'feature-1',
  key: 'MATCH_SEARCH',
  description: 'Match search',
  requiresPremium: false,
  isActive: true,
};

describe('resolveFeatureAccess', () => {
  it('allows active free features for every athlete', () => {
    const access = resolveFeatureAccess({ feature: baseFlag, isPremium: false });

    expect(access.hasAccess).toBe(true);
    expect(access.reason).toBeNull();
  });

  it('blocks active premium features for free athletes', () => {
    const access = resolveFeatureAccess({
      feature: { ...baseFlag, requiresPremium: true },
      isPremium: false,
    });

    expect(access.hasAccess).toBe(false);
    expect(access.reason).toBe('premium');
  });

  it('blocks inactive features even for premium athletes', () => {
    const access = resolveFeatureAccess({
      feature: { ...baseFlag, requiresPremium: true, isActive: false },
      isPremium: true,
    });

    expect(access.hasAccess).toBe(false);
    expect(access.reason).toBe('disabled');
  });

  it('allows unknown non-canonical flags to avoid breaking unseeded features', () => {
    const access = resolveFeatureAccess({ feature: null, isPremium: false });

    expect(access.hasAccess).toBe(true);
    expect(access.isKnown).toBe(false);
  });

  it('blocks missing canonical flags', () => {
    const access = resolveFeatureAccess({ feature: null, featureKey: 'MATCH_SEARCH', isPremium: false });

    expect(access.hasAccess).toBe(false);
    expect(access.isFeatureActive).toBe(false);
    expect(access.isKnown).toBe(false);
    expect(access.reason).toBe('disabled');
  });

  it('hides feature while the flag response is still loading', () => {
    const access = resolveFeatureAccess({ feature: null, isLoading: true, isPremium: true });

    expect(access.hasAccess).toBe(false);
    expect(access.isLoading).toBe(true);
  });
});
