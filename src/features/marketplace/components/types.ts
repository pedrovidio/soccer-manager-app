import type { Invite } from '../../athletes/athleteTypes';
import type { SpotMarketplaceMatch } from '../../matchmaking/types';

export type MarketplaceTab = 'invites' | 'search';

export type MarketplaceListItem =
  | { type: 'debt-lock' }
  | { type: 'location-warning' }
  | { type: 'error' }
  | { type: 'empty'; text: string; icon: 'mail-open-outline' | 'football-outline' }
  | { type: 'invite'; invite: Invite }
  | { type: 'spot-match'; match: SpotMarketplaceMatch };
