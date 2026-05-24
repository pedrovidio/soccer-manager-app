import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@features/auth/useAuthStore';
import { AthleteSearchResult, CreateGroupFormData } from '@features/groups/groupTypes';
import { groupApi } from '@features/groups/services/groupApi';
import { buildCreateGroupPayload, INITIAL_GROUP_FORM, parseApiError, validateGroupForm } from '@features/groups/utils/groupForm';

export function useCreateGroupScreen() {
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<CreateGroupFormData>(INITIAL_GROUP_FORM);
  const [selected, setSelected] = useState<AthleteSearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AthleteSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedIds = useMemo(() => new Set(selected.map((athlete) => athlete.id)), [selected]);

  const updateField = useCallback((field: keyof CreateGroupFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
      return;
    }
    router.back();
  }, [router, step]);

  const goToInvites = useCallback(() => {
    const error = validateGroupForm(form);
    if (error) {
      Alert.alert('Atencao', error);
      return;
    }
    setStep(2);
  }, [form]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await groupApi.searchAthletes(text.trim());
        setResults(data.filter((athlete) => athlete.id !== athleteId && !selectedIds.has(athlete.id)));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [athleteId, selectedIds]);

  const toggleAthlete = useCallback((athlete: AthleteSearchResult) => {
    setSelected((prev) =>
      prev.some((item) => item.id === athlete.id)
        ? prev.filter((item) => item.id !== athlete.id)
        : [...prev, athlete],
    );
    setResults((prev) => prev.filter((item) => item.id !== athlete.id));
  }, []);

  const removeSelected = useCallback((id: string) => {
    setSelected((prev) => prev.filter((athlete) => athlete.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    const error = validateGroupForm(form);
    if (error) {
      Alert.alert('Atencao', error);
      return;
    }

    setSubmitting(true);
    try {
      const group = await groupApi.create(buildCreateGroupPayload(form, athleteId));

      if (selected.length > 0) {
        await Promise.allSettled(selected.map((athlete) => groupApi.inviteAthlete(group.id, athleteId, athlete.id)));
      }

      const inviteMessage = selected.length > 0 ? ` ${selected.length} convite(s) enviado(s).` : '';
      Alert.alert('Grupo criado!', `"${group.name}" foi criado com sucesso.${inviteMessage}`, [
        { text: 'OK', onPress: () => router.replace('/groups' as any) },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', parseApiError(error));
    } finally {
      setSubmitting(false);
    }
  }, [athleteId, form, router, selected]);

  return {
    form,
    query,
    results,
    searching,
    selected,
    step,
    submitting,
    goToInvites,
    handleBack,
    handleSearch,
    handleSubmit,
    removeSelected,
    toggleAthlete,
    updateField,
  };
}
