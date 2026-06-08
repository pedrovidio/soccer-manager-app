import { Notification } from '@features/notifications/types';
import { applyNotificationRealtimeEvent, NotificationRealtimeRow } from './notificationRealtimeCache';

function payload(eventType: 'INSERT' | 'UPDATE' | 'DELETE', row: NotificationRealtimeRow) {
  return {
    table: 'notifications',
    eventType,
    new: eventType === 'DELETE' ? null : row,
    old: eventType === 'DELETE' ? row : null,
  } as const;
}

const currentNotification: Notification = {
  id: 'notification-1',
  type: 'SYSTEM',
  title: 'Aviso',
  body: 'Mensagem antiga',
  referenceId: undefined,
  read: false,
  createdAt: '2026-06-08T10:00:00.000Z',
  avatarInitials: 'AV',
};

describe('applyNotificationRealtimeEvent', () => {
  it('adds inserted notifications to the local cache', () => {
    const result = applyNotificationRealtimeEvent([
      currentNotification,
    ], payload('INSERT', {
      id: 'notification-2',
      type: 'MATCH_INVITE',
      title: 'Partida',
      body: 'Voce recebeu um convite',
      reference_id: 'invite-1',
      is_read: false,
      created_at: '2026-06-08T11:00:00.000Z',
    }));

    expect(result).toEqual([
      {
        id: 'notification-2',
        type: 'MATCH_INVITE',
        title: 'Partida',
        body: 'Voce recebeu um convite',
        referenceId: 'invite-1',
        read: false,
        createdAt: '2026-06-08T11:00:00.000Z',
        avatarInitials: 'PA',
      },
      currentNotification,
    ]);
  });

  it('updates an existing notification without duplicating it', () => {
    const result = applyNotificationRealtimeEvent([
      currentNotification,
    ], payload('UPDATE', {
      id: 'notification-1',
      type: 'SYSTEM',
      title: 'Aviso',
      body: 'Mensagem antiga',
      reference_id: null,
      is_read: true,
      created_at: '2026-06-08T10:00:00.000Z',
    }));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'notification-1',
      read: true,
      referenceId: undefined,
    });
  });

  it('removes deleted notifications from the local cache', () => {
    const result = applyNotificationRealtimeEvent([
      currentNotification,
    ], payload('DELETE', { id: 'notification-1' }));

    expect(result).toEqual([]);
  });
});
