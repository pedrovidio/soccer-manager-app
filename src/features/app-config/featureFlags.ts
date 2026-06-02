export const FEATURE_KEYS = [
  'AD_FREE',
  'LIVE_MATCH_SCORE',
  'MATCH_SEARCH',
  'RANKING_ACCESS',
  'SPOT_INVITES_TAX_EXEMPT',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number] | (string & {});
const FEATURE_KEY_SET = new Set<string>(FEATURE_KEYS);

export interface FeatureFlag {
  id: string;
  key: FeatureKey;
  description: string | null;
  requiresPremium: boolean;
  isActive: boolean;
}

export type FeatureAccessReason = 'disabled' | 'premium' | null;

export type FeatureAccess = {
  feature: FeatureFlag | null;
  hasAccess: boolean;
  isFeatureActive: boolean;
  isKnown: boolean;
  isLoading: boolean;
  reason: FeatureAccessReason;
  requiresPremium: boolean;
};

export function resolveFeatureAccess(params: {
  feature: FeatureFlag | null | undefined;
  featureKey?: FeatureKey;
  isLoading?: boolean;
  isPremium: boolean;
}): FeatureAccess {
  const feature = params.feature ?? null;
  const isKnown = !!feature;
  const isLoading = params.isLoading ?? false;
  const isMissingCanonicalFeature = !feature && !!params.featureKey && FEATURE_KEY_SET.has(params.featureKey);
  const isFeatureActive = isMissingCanonicalFeature ? false : feature?.isActive ?? true;
  const requiresPremium = feature?.requiresPremium ?? false;
  const reason: FeatureAccessReason = !isFeatureActive
    ? 'disabled'
    : requiresPremium && !params.isPremium
      ? 'premium'
      : null;

  return {
    feature,
    hasAccess: !isLoading && !isMissingCanonicalFeature && reason === null,
    isFeatureActive,
    isKnown,
    isLoading,
    reason,
    requiresPremium,
  };
}

export function isCanonicalFeatureKey(featureKey: FeatureKey): boolean {
  return FEATURE_KEY_SET.has(featureKey);
}

export function featureAccessMessage(access: Pick<FeatureAccess, 'reason'>): string {
  if (access.reason === 'disabled') {
    return 'Funcionalidade temporariamente desativada pela plataforma.';
  }

  if (access.reason === 'premium') {
    return 'Funcionalidade disponivel para atletas Premium.';
  }

  return '';
}
