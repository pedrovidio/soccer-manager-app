import React from 'react';
import { SafeAreaView } from 'react-native';
import { BottomNav } from '../common/components/BottomNav';
import { MarketplaceHeader } from './components/MarketplaceHeader';
import { MarketplaceList } from './components/MarketplaceList';
import { MarketplaceTabs } from './components/MarketplaceTabs';
import { styles } from './components/styles';
import { useMarketplaceScreen } from './hooks/useMarketplaceScreen';

export default function MarketplaceScreen() {
  const marketplace = useMarketplaceScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <MarketplaceHeader tab={marketplace.tab} isSyncingLocation={marketplace.isSyncingLocation} />
      <MarketplaceTabs
        activeTab={marketplace.tab}
        inviteCount={marketplace.inviteCount}
        matchCount={marketplace.matchCount}
        onChange={marketplace.setTab}
      />
      <MarketplaceList
        data={marketplace.listData}
        isRefreshing={marketplace.isLoading}
        blockMessage={marketplace.blockMessage}
        respondMutation={marketplace.respondMutation}
        applyMutation={marketplace.applyMutation}
        onRefresh={marketplace.refetch}
        onFinance={marketplace.goFinance}
        onAcceptInvite={marketplace.acceptInvite}
        onDeclineInvite={marketplace.declineInvite}
        onApply={marketplace.applyToMatch}
      />
      <BottomNav active="marketplace" />
    </SafeAreaView>
  );
}
