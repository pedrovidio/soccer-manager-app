import { httpClient } from '../../../lib/httpClient';
import { AthleteDashboard, Invite } from '../athleteTypes';
import { Notification } from '../../notifications/types';
import { AssessmentPayload, AvailabilitySlot } from '../../auth/registerTypes';

export type AssessmentData = AssessmentPayload;

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
    httpClient.patch(`/notifications/${notificationId}/read`).then((r) => r.data),

  deleteNotification: (athleteId: string, notificationId: string) =>
    httpClient.delete(`/athletes/${athleteId}/notifications/${notificationId}`).then((r) => r.data),

  deleteAllNotifications: (athleteId: string) =>
    httpClient.delete(`/athletes/${athleteId}/notifications`).then((r) => r.data),

  markAllNotificationsRead: (athleteId: string) =>
    httpClient.patch(`/athletes/${athleteId}/notifications/read-all`).then((r) => r.data),

  update: (athleteId: string, data: {
    name?: string;
    cpf?: string;
    gender?: 'M' | 'F';
    phone?: string;
    age?: number;
    position?: string;
    isGoalkeeperForHire?: boolean;
    pixKey?: string | null;
    address?: {
      cep: string; street: string; number: number;
      complement?: string; neighborhood: string; city: string; state: string;
    };
  }) =>
    httpClient.patch(`/athletes/${athleteId}`, data).then((r) => r.data),

  uploadPhoto: (athleteId: string, uri: string) => {
    const form = new FormData();
    form.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
    return httpClient.patch(`/athletes/${athleteId}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data as { photoUrl: string });
  },

  getAssessment: (athleteId: string) =>
    httpClient.get<AssessmentData>(`/athletes/${athleteId}/assessment`).then((r) => r.data),

  getAvailability: (athleteId: string) =>
    httpClient.get<AvailabilitySlot[]>(`/athletes/${athleteId}/availability`).then((r) => r.data),

  saveAvailability: (athleteId: string, slots: AvailabilitySlot[]) =>
    httpClient.put(`/athletes/${athleteId}/availability`, { slots }).then((r) => r.data),
};
