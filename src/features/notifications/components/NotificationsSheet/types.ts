import { Notification } from '@features/notifications/types';

export type NotificationActionProps = {
  item: Notification;
  onDelete: (id: string) => void;
  onMarkRead: (id: string) => void;
  onRespondInvite: (notificationId: string, inviteId: string, accept: boolean) => void;
  respondInvitePending: boolean;
  onRespondSpotApplication?: (applicationId: string, accept: boolean) => void;
  respondSpotApplicationPending?: boolean;
  blockMatchAccept?: boolean;
};

export type NotificationsSheetProps = {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onRespondInvite: (notificationId: string, inviteId: string, accept: boolean) => void;
  respondInvitePending: boolean;
  onRespondSpotApplication?: (applicationId: string, accept: boolean) => void;
  respondSpotApplicationPending?: boolean;
  blockMatchAccept?: boolean;
};
