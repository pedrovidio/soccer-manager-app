import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { AthleteSearchResult, GroupInviteItem } from '@features/groups/groupTypes';
import { groupApi } from '@features/groups/services/groupApi';
import { InviteSection, InviteState, ResendState } from './types';

export function useInviteAthleteScreen() {
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const adminId = useAuthStore((state) => state.athleteId) ?? '';
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [inviteMap, setInviteMap] = useState<Record<string, InviteState>>({});
  const [resendMap, setResendMap] = useState<Record<string, ResendState>>({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const pendingInvitesQuery = useQuery({
    queryKey: ['group-invites', groupId],
    queryFn: () => groupApi.listGroupInvites(groupId!),
    enabled: !!groupId,
  });

  const searchQuery = useQuery({
    queryKey: ['group-athlete-search', groupId, adminId, debouncedQuery],
    queryFn: () => groupApi.searchAthletes(debouncedQuery, groupId, adminId),
    enabled: debouncedQuery.length >= 2,
  });

  const pendingInvites = useMemo(
    () => (pendingInvitesQuery.data ?? []).filter((invite) => invite.status === 'PENDING'),
    [pendingInvitesQuery.data],
  );
  const results = useMemo(
    () => (searchQuery.data ?? []).filter((athlete) => inviteMap[athlete.id] !== 'sent'),
    [inviteMap, searchQuery.data],
  );

  const inviteMutation = useMutation({
    mutationFn: (athlete: AthleteSearchResult) => groupApi.inviteAthlete(groupId!, adminId, athlete.id),
    onMutate: (athlete) => {
      setInviteMap((prev) => ({ ...prev, [athlete.id]: 'sending' }));
    },
    onSuccess: (_response, athlete) => {
      setInviteMap((prev) => ({ ...prev, [athlete.id]: 'sent' }));
      queryClient.setQueryData<GroupInviteItem[]>(['group-invites', groupId], (current = []) => [
        buildPendingInvite(athlete),
        ...current,
      ]);
    },
    onError: (_error, athlete) => {
      setInviteMap((prev) => ({ ...prev, [athlete.id]: 'error' }));
    },
  });

  const resendMutation = useMutation({
    mutationFn: (invite: GroupInviteItem) => groupApi.inviteAthlete(groupId!, adminId, invite.athleteId),
    onMutate: (invite) => {
      setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'sending' }));
    },
    onSuccess: (_response, invite) => {
      setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'sent' }));
      setTimeout(() => setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'idle' })), 2000);
    },
    onError: (_error, invite) => {
      setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'error' }));
    },
  });

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.trim().length < 2) setDebouncedQuery('');
  }, []);

  const handleInvite = useCallback((athlete: AthleteSearchResult) => {
    if (groupId) inviteMutation.mutate(athlete);
  }, [groupId, inviteMutation]);

  const handleResend = useCallback((invite: GroupInviteItem) => {
    if (groupId) resendMutation.mutate(invite);
  }, [groupId, resendMutation]);

  const sections = useMemo<InviteSection[]>(() => {
    const showResults = query.trim().length >= 2;
    const showPending = pendingInvites.length > 0;

    return [
      ...(showResults ? [{
        key: 'results' as const,
        title: results.length > 0 ? 'Resultados da busca' : '',
        data: results.length > 0 ? results : [{ __empty: true } as const],
        type: 'results' as const,
      }] : []),
      ...(showPending ? [{
        key: 'pending' as const,
        title: `Convidados (${pendingInvites.length})`,
        data: pendingInvites,
        type: 'pending' as const,
      }] : []),
    ];
  }, [pendingInvites, query, results]);

  return {
    groupName,
    handleInvite,
    handleResend,
    handleSearch,
    inviteMap,
    noResults: debouncedQuery.length >= 2 && !searchQuery.isFetching && results.length === 0,
    query,
    resendMap,
    searching: searchQuery.isFetching,
    sections,
  };
}

function buildPendingInvite(athlete: AthleteSearchResult): GroupInviteItem {
  return {
    inviteId: '',
    athleteId: athlete.id,
    name: athlete.name,
    position: athlete.position,
    overall: athlete.overall,
    email: athlete.email,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}
