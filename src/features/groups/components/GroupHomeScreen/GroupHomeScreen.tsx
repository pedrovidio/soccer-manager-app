import React from 'react';
import { RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../../../common/theme';
import { GroupTopMenu } from '../GroupTopMenu';
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

  if (controller.isLoading) return <HomeLoadingState />;

  if (controller.isError || !controller.data) {
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
        groupName={data.group.name}
        membersCount={data.members.length}
        isAdmin={data.isAdmin}
        onEdit={controller.goEditGroup}
      />
      <GroupTopMenu groupId={controller.groupId!} active="summary" showFinance={data.isAdmin} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={controller.isLoading} onRefresh={controller.refetch} colors={[Colors.primary]} />}
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
    </SafeAreaView>
  );
}
