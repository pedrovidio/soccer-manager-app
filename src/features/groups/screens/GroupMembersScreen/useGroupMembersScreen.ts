import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { GroupMember } from '@features/groups/groupTypes';
import { groupApi } from '@features/groups/services/groupApi';
import { queryKeys } from '@lib/queryKeys';
import { MemberListItem, MembersTab } from './types';

export function useGroupMembersScreen() {
  const { groupId, tab } = useLocalSearchParams<{ groupId: string; tab?: MembersTab }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const [activeTab, setActiveTab] = useState<MembersTab>(tab === 'spot' ? 'spot' : 'members');
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [profileMember, setProfileMember] = useState<GroupMember | null>(null);

  const groupQuery = useQuery({
    queryKey: groupId ? queryKeys.groupHome(groupId) : queryKeys.groupHomes(),
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
  });

  const favoriteQuery = useQuery({
    queryKey: groupId ? queryKeys.favoriteSpotAthletes(groupId) : queryKeys.favoriteSpotAthletesAll(),
    queryFn: () => groupApi.listFavoriteSpotAthletes(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && groupQuery.data?.isAdmin === true,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (targetAthleteId: string) => groupApi.unfavoriteSpotAthlete(groupId!, athleteId, targetAthleteId),
    onSuccess: () => {
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.favoriteSpotAthletes(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.nearbyAthletesAll() });
    },
    onError: () => Alert.alert('Erro', 'Nao foi possivel remover o favorito.'),
  });

  const effectiveTab: MembersTab = activeTab === 'spot' && !groupQuery.data?.isAdmin ? 'members' : activeTab;

  const memberItems = useMemo<MemberListItem[]>(() => {
    const members = groupQuery.data?.members ?? [];
    const activeMembers = members.filter((member) => !member.hasDebt && !member.isInjured && !member.isBlocked);
    const blockedMembers = members.filter((member) => member.hasDebt || member.isInjured || member.isBlocked);

    return [
      ...activeMembers.map((member) => ({ kind: 'member' as const, id: member.id, member })),
      ...(blockedMembers.length > 0 ? [{ kind: 'label' as const, id: 'blocked-label', label: 'Com alerta' }] : []),
      ...blockedMembers.map((member) => ({ kind: 'member' as const, id: `blocked-${member.id}`, member })),
    ];
  }, [groupQuery.data?.members]);

  const openProfile = useCallback((member: GroupMember) => setProfileMember(member), []);
  const openOptions = useCallback((member: GroupMember) => setSelectedMember(member), []);
  const closeProfile = useCallback(() => setProfileMember(null), []);
  const closeOptions = useCallback(() => setSelectedMember(null), []);
  const removeFavorite = useCallback((athleteId: string) => removeFavoriteMutation.mutate(athleteId), [removeFavoriteMutation]);

  return {
    activeTab: effectiveTab,
    athleteId,
    data: groupQuery.data,
    error: groupQuery.error,
    favoriteSpotAthletes: favoriteQuery.data ?? [],
    groupId,
    isError: groupQuery.isError,
    isLoading: groupQuery.isLoading,
    isRemovingFavorite: removeFavoriteMutation.isPending,
    memberItems,
    openOptions,
    openProfile,
    profileMember,
    refetch: groupQuery.refetch,
    removeFavorite,
    router,
    selectedMember,
    setActiveTab,
    closeProfile,
    closeOptions,
  };
}
