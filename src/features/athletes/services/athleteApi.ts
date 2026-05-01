import { httpClient } from '../../../lib/httpClient';
import { AthleteDashboard, Invite } from '../athleteTypes';
import { Notification } from '../../notifications/types';

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const athleteApi = {
  dashboard: (athleteId: string) =>
    httpClient.get<AthleteDashboard>(`/athletes/${athleteId}/dashboard`).then((r) => r.data),

  notifications: (athleteId: string) =>
    httpClient
      .get<NotificationsResponse>(`/athletes/${athleteId}/notifications`)
      .then((r) =>
        r.data.notifications.map((n: any) => ({
          ...n,
          read: n.isRead ?? n.read ?? false,
          avatarInitials: n.avatarInitials ?? n.title?.slice(0, 2).toUpperCase() ?? '??',
        })) as Notification[]
      ),

  invites: (athleteId: string) =>
    httpClient.get<Invite[]>(`/athletes/${athleteId}/invites`).then((r) => r.data),

  markNotificationRead: (athleteId: string, notificationId: string) =>
    httpClient.patch(`/athletes/${athleteId}/notifications/${notificationId}/read`).then((r) => r.data),

  deleteNotification: (athleteId: string, notificationId: string) =>
    httpClient.delete(`/athletes/${athleteId}/notifications/${notificationId}`).then((r) => r.data),

  deleteAllNotifications: (athleteId: string) =>
    httpClient.delete(`/athletes/${athleteId}/notifications`).then((r) => r.data),

  markAllNotificationsRead: (athleteId: string) =>
    httpClient.patch(`/athletes/${athleteId}/notifications/read-all`).then((r) => r.data),
};
