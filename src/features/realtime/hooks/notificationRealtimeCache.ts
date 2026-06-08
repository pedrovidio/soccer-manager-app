import { Notification } from '@features/notifications/types';
import { SupabaseRealtimePayload } from '@lib/supabase/types';

export type NotificationRealtimeRow = {
  id?: string;
  athlete_id?: string;
  type?: string;
  title?: string;
  body?: string;
  reference_id?: string | null;
  is_read?: boolean;
  created_at?: string;
};

function toNotification(row: NotificationRealtimeRow): Notification | null {
  if (!row.id || !row.type || !row.title || !row.body || !row.created_at) return null;

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    referenceId: row.reference_id ?? undefined,
    read: row.is_read ?? false,
    createdAt: row.created_at,
    avatarInitials: row.title.slice(0, 2).toUpperCase(),
  };
}

export function applyNotificationRealtimeEvent(
  current: Notification[] = [],
  payload: SupabaseRealtimePayload<NotificationRealtimeRow>,
): Notification[] {
  const newNotification = payload.new ? toNotification(payload.new) : null;
  const oldId = payload.old?.id;

  if (payload.eventType === 'DELETE') {
    return oldId ? current.filter((notification) => notification.id !== oldId) : current;
  }

  if (!newNotification) return current;

  const withoutCurrent = current.filter((notification) => notification.id !== newNotification.id);

  if (payload.eventType === 'UPDATE') {
    return [newNotification, ...withoutCurrent].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return [newNotification, ...withoutCurrent];
}
