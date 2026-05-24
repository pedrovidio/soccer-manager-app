import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../../auth/useAuthStore';
import { CreateGroupFormData, GroupResponse } from '../../groupTypes';
import { groupApi } from '../../services/groupApi';
import {
  buildUpdateGroupPayload,
  groupToForm,
  INITIAL_GROUP_FORM,
  parseApiError,
  validateGroupForm,
} from '../../utils/groupForm';

export function useEditGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [form, setForm] = useState<CreateGroupFormData>(INITIAL_GROUP_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = useMemo(() => !!group?.adminIds.includes(athleteId), [athleteId, group?.adminIds]);

  const updateField = useCallback((field: keyof CreateGroupFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadGroup() {
      if (!groupId) return;
      setLoading(true);
      try {
        const nextGroup = await groupApi.findById(groupId);
        if (!active) return;
        setGroup(nextGroup);
        setForm(groupToForm(nextGroup));
      } catch {
        if (!active) return;
        Alert.alert('Erro', 'Nao foi possivel carregar o grupo.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGroup();
    return () => {
      active = false;
    };
  }, [groupId, router]);

  const handleSave = useCallback(async () => {
    const error = validateGroupForm(form);
    if (error) {
      Alert.alert('Atencao', error);
      return;
    }
    if (!groupId) return;

    setSaving(true);
    try {
      await groupApi.update(groupId, buildUpdateGroupPayload(form, athleteId));
      Alert.alert('Salvo!', 'As alteracoes foram salvas com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', parseApiError(error, 'Nao foi possivel salvar as alteracoes.'));
    } finally {
      setSaving(false);
    }
  }, [athleteId, form, groupId, router]);

  return {
    form,
    group,
    isAdmin,
    loading,
    saving,
    handleSave,
    updateField,
  };
}
