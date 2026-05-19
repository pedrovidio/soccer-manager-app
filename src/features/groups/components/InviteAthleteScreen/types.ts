import { AthleteSearchResult, GroupInviteItem } from '../../groupTypes';

export type ResendState = 'idle' | 'sending' | 'sent' | 'error';
export type InviteState = 'idle' | 'sending' | 'sent' | 'error';

export type InviteSection =
  | {
      key: 'results';
      title: string;
      type: 'results';
      data: Array<AthleteSearchResult | { __empty: true }>;
    }
  | {
      key: 'pending';
      title: string;
      type: 'pending';
      data: GroupInviteItem[];
    };
