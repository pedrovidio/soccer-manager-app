import React, { memo, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import type { Invite } from '../../athletes/athleteTypes';
import { Colors } from '../../common/theme';
import { DebtLockCard, EmptyState, LocationWarningCard } from './MarketplaceStateCards';
import { InviteCard } from './InviteCard';
import { SpotMatchCard } from './SpotMatchCard';
import { styles } from './styles';
import { MarketplaceListItem } from './types';

type MarketplaceListProps = {
  data: MarketplaceListItem[];
  isRefreshing: boolean;
  blockMessage: string;
  respondMutation: {
    isPending: boolean;
    variables?: { invite: Invite; accept: boolean };
  };
  applyMutation: {
    isPending: boolean;
    variables?: string;
  };
  onRefresh: () => void;
  onFinance: () => void;
  onAcceptInvite: (invite: Invite) => void;
  onDeclineInvite: (invite: Invite) => void;
  onApply: (matchId: string) => void;
};

function MarketplaceListComponent({
  data,
  isRefreshing,
  blockMessage,
  respondMutation,
  applyMutation,
  onRefresh,
  onFinance,
  onAcceptInvite,
  onDeclineInvite,
  onApply,
}: MarketplaceListProps) {
  const renderItem = useCallback(({ item }: { item: MarketplaceListItem }) => {
    if (item.type === 'debt-lock') {
      return <DebtLockCard message={blockMessage} onFinance={onFinance} />;
    }

    if (item.type === 'location-warning') {
      return <LocationWarningCard />;
    }

    if (item.type === 'error') {
      return <EmptyState icon="alert-circle-outline" text="Erro ao carregar vagas" tone="error" />;
    }

    if (item.type === 'empty') {
      return <EmptyState icon={item.icon} text={item.text} />;
    }

    if (item.type === 'invite') {
      return (
        <InviteCard
          invite={item.invite}
          isPending={respondMutation.isPending && respondMutation.variables?.invite.id === item.invite.id}
          onAccept={onAcceptInvite}
          onDecline={onDeclineInvite}
        />
      );
    }

    return (
      <SpotMatchCard
        match={item.match}
        isPending={applyMutation.isPending && applyMutation.variables === item.match.id}
        onApply={onApply}
      />
    );
  }, [
    applyMutation.isPending,
    applyMutation.variables,
    blockMessage,
    onAcceptInvite,
    onApply,
    onDeclineInvite,
    onFinance,
    respondMutation.isPending,
    respondMutation.variables,
  ]);

  const keyExtractor = useCallback((item: MarketplaceListItem, index: number) => {
    if (item.type === 'invite') return item.invite.id;
    if (item.type === 'spot-match') return item.match.id;
    return `${item.type}-${index}`;
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

export const MarketplaceList = memo(MarketplaceListComponent);
