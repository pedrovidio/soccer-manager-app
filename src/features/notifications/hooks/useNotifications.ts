import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { athleteApi } from '../../athletes/services/athleteApi';
import { matchApi } from '../../matchmaking/services/matchApi';
import { groupApi } from '../../groups/services/groupApi';
import { queryKeys } from '../../../lib/queryKeys';
import { Notification } from '../types';

export function useNotificationActions(athleteId: string, notifications: Notification[]) {
  const qc = useQueryClient();
  const key = queryKeys.notifications(athleteId);

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const setLocal = (updater: (prev: Notification[]) => Notification[]) =>
    qc.setQueryData<Notification[]>(key, (prev) => updater(prev ?? []));

  const markAsRead = useMutation({
    mutationFn: (id: string) => athleteApi.markNotificationRead(athleteId, id),
    onMutate: (id) => setLocal((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    onError: invalidate,
  });

  const markAllAsRead = useMutation({
    mutationFn: () => athleteApi.markAllNotificationsRead(athleteId),
    onMutate: () => setLocal((prev) => prev.map((n) => ({ ...n, read: true }))),
    onError: invalidate,
  });

  const deleteOne = useMutation({
    mutationFn: (id: string) => athleteApi.deleteNotification(athleteId, id),
    onMutate: (id) => setLocal((prev) => prev.filter((n) => n.id !== id)),
    onError: invalidate,
  });

  const deleteAll = useMutation({
    mutationFn: () => athleteApi.deleteAllNotifications(athleteId),
    onMutate: () => setLocal(() => []),
    onError: invalidate,
  });

  const respondInvite = useMutation({
    mutationFn: ({ inviteId, accept, notificationId }: { inviteId: string; notificationId: string; accept: boolean }) => {
      // determina o tipo pelo id da notificação no cache local
      const notif = (qc.getQueryData<Notification[]>(key) ?? []).find((n) => n.id === notificationId);
      return notif?.type === 'GROUP_INVITE'
        ? groupApi.respondGroupInvite(inviteId, athleteId, accept)
        : matchApi.respondInvite(inviteId, athleteId, accept);
    },
    onSuccess: (_data, { notificationId, inviteId }) => {
      setLocal((prev) => prev.filter((n) => n.id !== notificationId && n.referenceId !== inviteId));
      athleteApi.deleteNotification(athleteId, notificationId).catch(() => null);
    },
    onError: invalidate,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    unreadCount,
    markAsRead: useCallback((id: string) => markAsRead.mutate(id), [markAsRead]),
    markAllAsRead: useCallback(() => markAllAsRead.mutate(), [markAllAsRead]),
    deleteOne: useCallback((id: string) => deleteOne.mutate(id), [deleteOne]),
    deleteAll: useCallback(() => deleteAll.mutate(), [deleteAll]),
    respondInvite: useCallback(
      (notificationId: string, inviteId: string, accept: boolean) =>
        respondInvite.mutate({ notificationId, inviteId, accept }),
      [respondInvite],
    ),
    respondInvitePending: respondInvite.isPending,
  };
}
