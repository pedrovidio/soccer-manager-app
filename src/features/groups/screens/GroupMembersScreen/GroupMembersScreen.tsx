import React from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { Arena } from '@ui/tokens/theme';
import { GroupTopMenu } from '@features/groups/components/GroupTopMenu';
import { FavoriteSpotList } from './FavoriteSpotList';
import { MembersErrorState, MembersLoadingState } from './LoadingErrorState';
import { MembersHeader } from './MembersHeader';
import { MembersList } from './MembersList';
import { MembersTabs } from './MembersTabs';
import { MemberOptionsModal } from './MemberOptionsModal';
import { MemberProfileModal } from './MemberProfileModal';
import { styles } from './styles';
import { useGroupMembersScreen } from './useGroupMembersScreen';

export function GroupMembersScreen() {
  const controller = useGroupMembersScreen();

  if (controller.isError) {
    const isForbidden = (controller.error as any)?.response?.status === 403;
    return (
      <MembersErrorState
        isForbidden={isForbidden}
        onPress={() => (isForbidden ? controller.router.back() : controller.refetch())}
      />
    );
  }

  const data = controller.data;
  const group = data?.group;
  const isAdmin = data?.isAdmin ?? false;
  const members = data?.members ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <MembersHeader groupName={group?.name ?? ''} />

      {controller.isLoading || !data ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color={Arena.neon} />
        </View>
      ) : (
        <>
          <MembersTabs
            activeTab={controller.activeTab}
            membersCount={members.length}
            spotCount={controller.favoriteSpotAthletes.length}
            isAdmin={isAdmin}
            onChange={controller.setActiveTab}
          />

          {controller.activeTab === 'members' ? (
            <MembersList
              items={controller.memberItems}
              isAdmin={isAdmin}
              currentAthleteId={controller.athleteId}
              refreshing={controller.isLoading}
              onRefresh={controller.refetch}
              onOpenProfile={controller.openProfile}
              onOpenOptions={controller.openOptions}
            />
          ) : (
            <FavoriteSpotList
              items={controller.favoriteSpotAthletes}
              disabled={controller.isRemovingFavorite}
              refreshing={controller.isLoading}
              onRefresh={controller.refetch}
              onRemove={controller.removeFavorite}
            />
          )}

          <MemberProfileModal member={controller.profileMember} onClose={controller.closeProfile} />
          <MemberOptionsModal
            member={controller.selectedMember}
            groupId={controller.groupId!}
            currentAthleteId={controller.athleteId}
            onClose={controller.closeOptions}
            onRefresh={controller.refetch}
          />
        </>
      )}

      <GroupTopMenu groupId={controller.groupId!} active="members" showFinance={isAdmin} />
    </SafeAreaView>
  );
}
