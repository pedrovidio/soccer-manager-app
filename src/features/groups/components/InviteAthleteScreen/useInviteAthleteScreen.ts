import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { realtime } from '../../../../lib/realtime';
import { useAuthStore } from '../../../auth/useAuthStore';
import { AthleteSearchResult, GroupInviteItem } from '../../groupTypes';
import { groupApi } from '../../services/groupApi';
import { InviteSection, InviteState, ResendState } from './types';

export function useInviteAthleteScreen() {
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const adminId = useAuthStore((state) => state.athleteId) ?? '';
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pendingInvites, setPendingInvites] = useState<GroupInviteItem[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AthleteSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [inviteMap, setInviteMap] = useState<Record<string, InviteState>>({});
  const [resendMap, setResendMap] = useState<Record<string, ResendState>>({});

  const loadInvites = useCallback(async () => {
    if (!groupId) return;
    try {
      const data = await groupApi.listGroupInvites(groupId);
      setPendingInvites(data.filter((invite) => invite.status === 'PENDING'));
    } catch {
      setPendingInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadInvites();
    const interval = setInterval(loadInvites, realtime.notificationsMs);
    return () => clearInterval(interval);
  }, [loadInvites]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setNoResults(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await groupApi.searchAthletes(text.trim(), groupId, adminId);
        setResults(data);
        setNoResults(data.length === 0);
      } catch {
        setResults([]);
        setNoResults(true);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [adminId, groupId]);

  const handleInvite = useCallback(async (athlete: AthleteSearchResult) => {
    if (!groupId) return;
    setInviteMap((prev) => ({ ...prev, [athlete.id]: 'sending' }));
    try {
      await groupApi.inviteAthlete(groupId, adminId, athlete.id);
      setInviteMap((prev) => ({ ...prev, [athlete.id]: 'sent' }));
      setResults((prev) => prev.filter((item) => item.id !== athlete.id));
      setPendingInvites((prev) => [buildPendingInvite(athlete), ...prev]);
    } catch {
      setInviteMap((prev) => ({ ...prev, [athlete.id]: 'error' }));
    }
  }, [adminId, groupId]);

  const handleResend = useCallback(async (invite: GroupInviteItem) => {
    if (!groupId) return;
    setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'sending' }));
    try {
      await groupApi.inviteAthlete(groupId, adminId, invite.athleteId);
      setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'sent' }));
      setTimeout(() => setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'idle' })), 2000);
    } catch {
      setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'error' }));
    }
  }, [adminId, groupId]);

  const sections = useMemo<InviteSection[]>(() => {
    const showResults = query.length >= 2;
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
  }, [pendingInvites, query.length, results]);

  return {
    groupName,
    handleInvite,
    handleResend,
    handleSearch,
    inviteMap,
    loadingInvites,
    noResults,
    query,
    resendMap,
    searching,
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
