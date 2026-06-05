import React from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { Arena } from '@ui/tokens/theme';
import { GroupTopMenu } from '@features/groups/components/GroupTopMenu';
import { MatchesErrorState, MatchesLoadingState } from './LoadingErrorState';
import { MatchesHeader } from './MatchesHeader';
import { MatchesList } from './MatchesList';
import { styles } from './styles';
import { useGroupMatchesScreen } from './useGroupMatchesScreen';

export function GroupMatchesScreen() {
  const controller = useGroupMatchesScreen();

  if (controller.isError) {
    const isForbidden = (controller.error as any)?.response?.status === 403;
    return (
      <MatchesErrorState
        isForbidden={isForbidden}
        onPress={() => (isForbidden ? controller.router.back() : controller.refetch())}
      />
    );
  }

  const data = controller.data;
  const group = data?.group;
  const isAdmin = data?.isAdmin ?? false;
  const upcomingMatches = data?.upcomingMatches ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <MatchesHeader groupName={group?.name ?? ''} isAdmin={isAdmin} onCreateMatch={controller.goCreateMatch} />

      {controller.isLoading || !data ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color={Arena.neon} />
        </View>
      ) : (
        <MatchesList
          matches={upcomingMatches}
          isAdmin={isAdmin}
          onCreateMatch={controller.goCreateMatch}
          onOpenMatch={(matchId) => controller.goMatch(matchId, isAdmin)}
          refreshing={controller.isLoading}
          onRefresh={controller.refetch}
        />
      )}

      <GroupTopMenu groupId={controller.groupId!} active="matches" showFinance={isAdmin} />
    </SafeAreaView>
  );
}
