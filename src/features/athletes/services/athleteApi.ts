import { httpClient } from '@lib/httpClient';
import { uploadImageToSupabaseStorage } from '@lib/supabase';
import { appLogger } from '@lib/logger';
import { AthleteDashboard, AthleteFinanceReport, Invite } from '../athleteTypes';
import { Notification } from '@features/notifications/types';
import { AssessmentPayload, AvailabilitySlot } from '@features/auth/registerTypes';

export type AssessmentData = AssessmentPayload;

function buildPhotoFormData(uri: string) {
  const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  const formData = new FormData();
  formData.append('photo', {
    uri,
    name: `photo.${extension}`,
    type: mimeType,
  } as any);
  return formData;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface AthleteHomeResponse {
  dashboard: AthleteDashboard;
  notifications: NotificationsResponse;
  invites: Invite[];
}

function normalizeNotifications(notifications: Notification[]): Notification[] {
  return notifications.map((n: any) => ({
    ...n,
    read: n.isRead ?? n.read ?? false,
    avatarInitials: n.avatarInitials ?? n.title?.slice(0, 2).toUpperCase() ?? '??',
  })) as Notification[];
}

export const athleteApi = {
  home: (athleteId: string) =>
    httpClient.get<AthleteHomeResponse>(`/athletes/${athleteId}/home`).then((r) => ({
      dashboard: r.data.dashboard,
      notifications: normalizeNotifications(r.data.notifications.notifications),
      invites: r.data.invites,
    })),

  dashboard: (athleteId: string) =>
    httpClient.get<AthleteDashboard>(`/athletes/${athleteId}/dashboard`).then((r) => r.data),

  financeReport: (athleteId: string, filters: Record<string, string> = {}) =>
    httpClient
      .get<AthleteFinanceReport>(`/athletes/${athleteId}/finance/report`, {
        params: { requesterId: athleteId, ...filters },
      })
      .then((r) => r.data),

  reportMonthlyPayment: (transactionId: string) =>
    httpClient.post(`/monthly-payments/${transactionId}/report`).then((r) => r.data),

  updateLocation: (athleteId: string, latitude: number, longitude: number) =>
    httpClient.patch(`/athletes/${athleteId}/location`, { latitude, longitude }).then((r) => r.data),

  notifications: (athleteId: string) =>
    httpClient
      .get<NotificationsResponse>(`/athletes/${athleteId}/notifications`)
      .then((r) => normalizeNotifications(r.data.notifications)),

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
    pixKey?: string | null;
    address?: {
      cep: string; street: string; number: number;
      complement?: string; neighborhood: string; city: string; state: string;
    };
  }) =>
    httpClient.patch(`/athletes/${athleteId}`, data).then((r) => r.data),

  deleteAccount: () =>
    httpClient.delete('/athletes/me').then((r) => r.data),

  uploadPhoto: async (athleteId: string, uri: string) => {
    try {
      const photoUrl = await uploadImageToSupabaseStorage({
        bucket: 'athlete-photos',
        uri,
      });

      return httpClient
        .patch(`/athletes/${athleteId}/photo-url`, { photoUrl })
        .then((r) => r.data as { photoUrl: string });
    } catch (error) {
      appLogger.warn('[AthleteApi] Supabase photo upload failed, falling back to API upload', { error });

      return httpClient
        .patch(`/athletes/${athleteId}/photo`, buildPhotoFormData(uri), {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data as { photoUrl: string });
    }
  },

  getAssessment: (athleteId: string) =>
    httpClient.get<AssessmentData>(`/athletes/${athleteId}/assessment`).then((r) => r.data),

  getAvailability: (athleteId: string) =>
    httpClient.get<AvailabilitySlot[]>(`/athletes/${athleteId}/availability`).then((r) => r.data),

  saveAvailability: (athleteId: string, slots: AvailabilitySlot[]) =>
    httpClient.put(`/athletes/${athleteId}/availability`, { slots }).then((r) => r.data),
};
