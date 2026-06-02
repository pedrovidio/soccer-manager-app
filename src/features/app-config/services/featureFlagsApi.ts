import { httpClient } from '@lib/httpClient';
import type { FeatureFlag } from '../featureFlags';

export const featureFlagsApi = {
  list: () =>
    httpClient
      .get<FeatureFlag[]>('/api/app-config/features')
      .then((response) => response.data),
};
