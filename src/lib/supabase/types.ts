export type SupabaseBaseTable =
  | 'athletes'
  | 'groups'
  | 'matches'
  | 'match_invites'
  | 'spot_applications'
  | 'financial_transactions'
  | 'notifications'
  | 'group_invites'
  | 'group_member_statuses'
  | 'group_favorite_spot_athletes';

export interface SupabaseRealtimePayload<T extends Record<string, unknown> = Record<string, unknown>> {
  table: SupabaseBaseTable | string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  new: T | null;
  old: T | null;
}
