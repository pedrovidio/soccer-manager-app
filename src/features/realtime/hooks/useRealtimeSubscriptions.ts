import { useFinanceRealtime } from './useFinanceRealtime';
import { useGroupRealtime } from './useGroupRealtime';
import { useMatchRealtime } from './useMatchRealtime';
import { useNotificationsRealtime } from './useNotificationsRealtime';

export function useRealtimeSubscriptions(athleteId: string | null, enabled: boolean) {
  const activeAthleteId = enabled ? athleteId : null;

  useGroupRealtime(activeAthleteId);
  useMatchRealtime(activeAthleteId);
  useFinanceRealtime(activeAthleteId);
  useNotificationsRealtime(activeAthleteId);
}
