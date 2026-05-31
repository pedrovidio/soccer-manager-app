import React from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { Arena, Colors } from '@ui/tokens/theme';
import { GroupTopMenu } from '@features/groups/components/GroupTopMenu';
import { HomeHeader } from './HomeHeader';
import { HomeErrorState, HomeLoadingState } from './LoadingErrorState';
import { NextMatchSection } from './NextMatchSection';
import { QuickActions } from './QuickActions';
import { ReviewPaymentsCard } from './ReviewPaymentsCard';
import { SummaryGrid } from './SummaryGrid';
import { styles } from './styles';
import { useGroupHomeScreen } from './useGroupHomeScreen';

export function GroupHomeScreen() {
  const controller = useGroupHomeScreen();

  if (controller.isError) {
    const isForbidden = (controller.error as any)?.response?.status === 403;
    return (
      <HomeErrorState
        isForbidden={isForbidden}
        onPress={() => (isForbidden ? controller.router.back() : controller.refetch())}
      />
    );
  }

  const { data } = controller;

  return (
    <SafeAreaView style={styles.safe}>
      <HomeHeader
        groupName={data?.group.name ?? ''}
        membersCount={data?.members.length ?? 0}
        isAdmin={data?.isAdmin ?? false}
        onEdit={controller.goEditGroup}
      />

      {controller.isLoading || !data ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={controller.isLoading} onRefresh={controller.refetch} colors={[Arena.neon]} />}
          contentContainerStyle={styles.scroll}
        >
          <QuickActions
            isAdmin={data.isAdmin}
            onInvite={() => controller.goInviteAthlete(data.group.name)}
            onCreateMatch={controller.goCreateMatch}
            onFinance={() => controller.goFinance()}
          />
          {data.isAdmin && (
            <ReviewPaymentsCard count={controller.reviewPaymentsCount} onPress={() => controller.goFinance('review')} />
          )}
          <SummaryGrid
            data={data}
            blockedCount={controller.blockedCount}
            favoriteSpotCount={controller.favoriteSpotAthletes.length}
            onMembers={() => controller.goMembers('members')}
            onSpot={() => controller.goMembers('spot')}
            onFinance={() => controller.goFinance()}
            onMatches={controller.goMatches}
          />
          <NextMatchSection
            match={controller.nextMatch}
            isAdmin={data.isAdmin}
            onCreateMatch={controller.goCreateMatch}
            onOpenMatch={(matchId) => controller.goMatch(matchId, data.isAdmin)}
            onOpenMatches={controller.goMatches}
          />
        </ScrollView>
      )}

      <GroupTopMenu groupId={controller.groupId!} active="summary" showFinance={data?.isAdmin ?? true} />
    </SafeAreaView>
  );
}
