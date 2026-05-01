import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { athleteApi } from '../../athletes/services/athleteApi';
import { queryKeys } from '../../../lib/queryKeys';
import { Notification } from '../types';

export function useNotificationActions(athleteId: string, notifications: Notification[]) {
  const qc = useQueryClient();
  const key = queryKeys.notifications(athleteId);

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  // Optimistic helpers
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    unreadCount,
    markAsRead: useCallback((id: string) => markAsRead.mutate(id), [markAsRead]),
    markAllAsRead: useCallback(() => markAllAsRead.mutate(), [markAllAsRead]),
    deleteOne: useCallback((id: string) => deleteOne.mutate(id), [deleteOne]),
    deleteAll: useCallback(() => deleteAll.mutate(), [deleteAll]),
  };
}
