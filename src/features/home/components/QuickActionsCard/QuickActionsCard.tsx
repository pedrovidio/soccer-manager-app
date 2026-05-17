import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../../notifications/types';
import { Colors } from '../../../common/theme';
import { styles } from './QuickActionsCard.styles';

const INVITE_TYPES = ['MATCH_INVITE', 'GROUP_INVITE'];
const MAX_ACTIONS = 3;

type IconName = keyof typeof Ionicons.glyphMap;

interface QuickActionsCardProps {
  notifications: Notification[];
  onRespondInvite: (notificationId: string, inviteId: string, accept: boolean) => void;
  respondInvitePending: boolean;
  onRespondSpotApplication?: (applicationId: string, accept: boolean) => void;
  respondSpotApplicationPending?: boolean;
  blockMatchAccept?: boolean;
  onViewAll: () => void;
}

function isSpotApplication(notification: Notification): boolean {
  return notification.title === 'Candidatura de avulso' && !!notification.referenceId && !notification.read;
}

function isInvite(notification: Notification): boolean {
  return INVITE_TYPES.includes(notification.type) && !!notification.referenceId && !notification.read;
}

function actionIcon(type: string): { name: IconName; color: string; bg: string } {
  if (type === 'GROUP_INVITE') return { name: 'people', color: Colors.primary, bg: Colors.primaryLight };
  if (type === 'MATCH_INVITE') return { name: 'football', color: Colors.primary, bg: Colors.primaryLight };
  return { name: 'person-add', color: Colors.warningDark, bg: Colors.warningLight };
}

export function QuickActionsCard({
  notifications,
  onRespondInvite,
  respondInvitePending,
  onRespondSpotApplication,
  respondSpotApplicationPending = false,
  blockMatchAccept = false,
  onViewAll,
}: QuickActionsCardProps) {
  const actions = notifications.filter((notification) => isInvite(notification) || isSpotApplication(notification));
  const visibleActions = actions.slice(0, MAX_ACTIONS);

  if (visibleActions.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flash-outline" size={16} color={Colors.primary} />
          <Text style={styles.title}>{'A\u00e7\u00f5es r\u00e1pidas'}</Text>
        </View>
        {actions.length > MAX_ACTIONS && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>Ver todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {visibleActions.map((item) => {
        const icon = actionIcon(item.type);
        const spotApplication = isSpotApplication(item);
        const matchAcceptBlocked = blockMatchAccept && item.type === 'MATCH_INVITE';

        return (
          <View key={item.id} style={styles.item}>
            <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
              <Ionicons name={icon.name} size={17} color={icon.color} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemText} numberOfLines={2}>{item.body}</Text>

              <View style={styles.actions}>
                {spotApplication ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => onRespondSpotApplication?.(item.referenceId!, true)}
                      disabled={!onRespondSpotApplication || respondSpotApplicationPending}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="checkmark" size={14} color={Colors.successDark} />
                      <Text style={[styles.actionText, { color: Colors.successDark }]}>Aprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.declineBtn]}
                      onPress={() => onRespondSpotApplication?.(item.referenceId!, false)}
                      disabled={!onRespondSpotApplication || respondSpotApplicationPending}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="close" size={14} color={Colors.errorDark} />
                      <Text style={[styles.actionText, { color: Colors.errorDark }]}>Recusar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, matchAcceptBlocked ? styles.blockedBtn : styles.acceptBtn]}
                      onPress={() => onRespondInvite(item.id, item.referenceId!, true)}
                      disabled={respondInvitePending || matchAcceptBlocked}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={matchAcceptBlocked ? 'lock-closed' : 'checkmark'}
                        size={14}
                        color={matchAcceptBlocked ? Colors.n500 : Colors.successDark}
                      />
                      <Text style={[styles.actionText, { color: matchAcceptBlocked ? Colors.n500 : Colors.successDark }]}>
                        {matchAcceptBlocked ? 'Bloqueado' : 'Aceitar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.declineBtn]}
                      onPress={() => onRespondInvite(item.id, item.referenceId!, false)}
                      disabled={respondInvitePending}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="close" size={14} color={Colors.errorDark} />
                      <Text style={[styles.actionText, { color: Colors.errorDark }]}>Recusar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
