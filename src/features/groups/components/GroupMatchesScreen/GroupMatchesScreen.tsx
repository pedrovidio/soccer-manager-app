import React from 'react';
import { SafeAreaView } from 'react-native';
import { GroupTopMenu } from '../GroupTopMenu';
import { MatchesErrorState, MatchesLoadingState } from './LoadingErrorState';
import { MatchesHeader } from './MatchesHeader';
import { MatchesList } from './MatchesList';
import { styles } from './styles';
import { useGroupMatchesScreen } from './useGroupMatchesScreen';

export function GroupMatchesScreen() {
  const controller = useGroupMatchesScreen();

  if (controller.isLoading) return <MatchesLoadingState />;

  if (controller.isError || !controller.data) {
    const isForbidden = (controller.error as any)?.response?.status === 403;
    return (
      <MatchesErrorState
        isForbidden={isForbidden}
        onPress={() => (isForbidden ? controller.router.back() : controller.refetch())}
      />
    );
  }

  const { group, isAdmin, upcomingMatches } = controller.data;

  return (
    <SafeAreaView style={styles.safe}>
      <MatchesHeader groupName={group.name} isAdmin={isAdmin} onCreateMatch={controller.goCreateMatch} />
      <GroupTopMenu groupId={controller.groupId!} active="matches" showFinance={isAdmin} />
      <MatchesList
        matches={upcomingMatches}
        isAdmin={isAdmin}
        onCreateMatch={controller.goCreateMatch}
        onOpenMatch={(matchId) => controller.goMatch(matchId, isAdmin)}
        refreshing={controller.isLoading}
        onRefresh={controller.refetch}
      />
    </SafeAreaView>
  );
}
