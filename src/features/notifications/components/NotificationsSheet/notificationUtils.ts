import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { Notification } from '../../types';

export const INVITE_TYPES = ['MATCH_INVITE', 'GROUP_INVITE'];

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function notificationIcon(type: string): {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
} {
  switch (type) {
    case 'MATCH_INVITE':
      return { name: 'football', color: Colors.primary, bg: Colors.primaryLight };
    case 'GROUP_INVITE':
      return { name: 'people', color: Colors.primary, bg: Colors.primaryLight };
    case 'MATCH_INVITE_ACCEPTED':
    case 'INVITE_ACCEPTED':
      return { name: 'checkmark-circle', color: Colors.successDark, bg: Colors.successLight };
    case 'MATCH_INVITE_DECLINED':
    case 'INVITE_DECLINED':
      return { name: 'close-circle', color: Colors.errorDark, bg: Colors.errorLight };
    default:
      return { name: 'notifications', color: Colors.n500, bg: Colors.n100 };
  }
}

export function isActionableInvite(item: Notification) {
  return INVITE_TYPES.includes(item.type) && !!item.referenceId && !item.read;
}

export function isActionableSpotApplication(item: Notification) {
  return item.title === 'Candidatura de avulso' && !!item.referenceId && !item.read;
}
