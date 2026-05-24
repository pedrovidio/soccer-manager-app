import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { CreateGroupFormData } from '@features/groups/groupTypes';
import { groupApi } from '@features/groups/services/groupApi';
import {
  buildUpdateGroupPayload,
  groupToForm,
  INITIAL_GROUP_FORM,
  parseApiError,
  validateGroupForm,
} from '@features/groups/utils/groupForm';

export function useEditGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateGroupFormData>(INITIAL_GROUP_FORM);
  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupApi.findById(groupId!),
    enabled: !!groupId,
    retry: false,
  });
  const group = groupQuery.data ?? null;

  const isAdmin = useMemo(() => !!group?.adminIds.includes(athleteId), [athleteId, group?.adminIds]);

  const updateField = useCallback((field: keyof CreateGroupFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (group) {
      setForm(groupToForm(group));
    }
  }, [group]);

  useEffect(() => {
    if (groupQuery.isError) {
      Alert.alert('Erro', 'Nao foi possivel carregar o grupo.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [groupQuery.isError, router]);

  const updateMutation = useMutation({
    mutationFn: () => groupApi.update(groupId!, buildUpdateGroupPayload(form, athleteId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-home', groupId] });
      Alert.alert('Salvo!', 'As alteracoes foram salvas com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Erro', parseApiError(error, 'Nao foi possivel salvar as alteracoes.'));
    },
  });

  const handleSave = useCallback(async () => {
    const error = validateGroupForm(form);
    if (error) {
      Alert.alert('Atencao', error);
      return;
    }
    if (!groupId) return;
    updateMutation.mutate();
  }, [form, groupId, updateMutation]);

  return {
    form,
    group,
    isAdmin,
    loading: groupQuery.isLoading,
    saving: updateMutation.isPending,
    handleSave,
    updateField,
  };
}
