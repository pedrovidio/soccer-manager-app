import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlaceResult } from '@ui/composites/PlacesAutocomplete';
import { useAuthStore } from '@features/auth/useAuthStore';
import { matchApi } from '@features/matchmaking/services/matchApi';
import { queryKeys } from '@lib/queryKeys';
import { MATCH_TYPES } from './options';
import { CancelMode, MatchCoords, MatchType, MatchTypeOption } from './types';

export function useCreateMatchScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { groupId, matchId } = useLocalSearchParams<{ groupId: string; matchId?: string }>();
  const adminId = useAuthStore((state) => state.athleteId) ?? '';
  const isEditing = !!matchId;

  const [type, setType] = useState<MatchType>('SOCIETY');
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<MatchCoords>({ latitude: 0, longitude: 0 });
  const [totalVacancies, setTotalVacancies] = useState('16');
  const [reserveVacancies, setReserveVacancies] = useState('2');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [cancelMode, setCancelMode] = useState<CancelMode | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: matchData } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: () => matchApi.getDetail(matchId!),
    enabled: isEditing,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!matchData || prefilled) return;

    setType(matchData.type as MatchType);
    setDate(new Date(matchData.date));
    setLocation(matchData.location);
    setCoords({ latitude: matchData.latitude, longitude: matchData.longitude });
    setTotalVacancies(String(matchData.totalVacancies));
    setReserveVacancies(String(matchData.reserveVacancies));
    setIsRecurring(matchData.isRecurring ?? false);
    setPrefilled(true);
  }, [matchData, prefilled]);

  const createMutation = useMutation({
    mutationFn: matchApi.create,
    onSuccess: () => {
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.groupHome(groupId) });
      router.back();
    },
    onError: () => Alert.alert('Erro', 'Não foi possível criar a partida.'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof matchApi.update>[1]) => matchApi.update(matchId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-detail', matchId] });
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.groupHome(groupId) });
      router.back();
    },
    onError: () => Alert.alert('Erro', 'Não foi possível atualizar a partida.'),
  });

  const cancelMatchMutation = useMutation({
    mutationFn: ({ mode, reason }: { mode: CancelMode; reason: string }) =>
      mode === 'series'
        ? matchApi.cancelRecurringMatches(matchId!, adminId, reason)
        : matchApi.cancelMatch(matchId!, adminId, reason),
    onSuccess: (result, variables) => {
      setCancelMode(null);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['match-detail', matchId] });
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.groupHome(groupId) });

      const message = variables.mode === 'series'
        ? `${result?.cancelledCount ?? 0} partida(s) recorrente(s) cancelada(s).`
        : 'Partida cancelada com sucesso.';
      Alert.alert('Sucesso', message);
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível cancelar a partida.');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const canCancelMatch = isEditing && matchData?.status !== 'FINISHED' && matchData?.status !== 'CANCELLED';

  const selectedType = useMemo(() => MATCH_TYPES.find((item) => item.value === type), [type]);

  const handleTypeChange = useCallback((option: MatchTypeOption) => {
    setType(option.value);
    setTotalVacancies(String(option.vacancies));
  }, []);

  const onDateChange = useCallback((_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;

    const merged = new Date(selected);
    merged.setHours(date.getHours(), date.getMinutes());
    setDate(merged);
  }, [date]);

  const onTimeChange = useCallback((_: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (!selected) return;

    const merged = new Date(date);
    merged.setHours(selected.getHours(), selected.getMinutes());
    setDate(merged);
  }, [date]);

  const handlePlaceSelect = useCallback((place: PlaceResult) => {
    setLocation(place.description);
    setCoords({ latitude: place.lat, longitude: place.lng });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!location.trim()) {
      Alert.alert('Atenção', 'Informe o local da partida.');
      return;
    }

    if (+totalVacancies < 2) {
      Alert.alert('Atenção', 'Mínimo de 2 vagas.');
      return;
    }

    if (!isEditing && date < new Date()) {
      Alert.alert('Atenção', 'A data deve ser no futuro.');
      return;
    }

    const payload = {
      adminId,
      groupId: groupId!,
      type,
      date: date.toISOString(),
      location: location.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      totalVacancies: +totalVacancies,
      reserveVacancies: +reserveVacancies || 0,
      spotRadiusKm: 10,
      minOverall: 0,
      minAge: 16,
      maxAge: 99,
      isRecurring,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
      return;
    }

    createMutation.mutate(payload);
  }, [
    adminId,
    coords.latitude,
    coords.longitude,
    createMutation,
    date,
    groupId,
    isEditing,
    isRecurring,
    location,
    reserveVacancies,
    totalVacancies,
    type,
    updateMutation,
  ]);

  const openCancel = useCallback((mode: CancelMode) => {
    setCancelMode(mode);
    setCancelReason('');
  }, []);

  const closeCancel = useCallback(() => {
    if (cancelMatchMutation.isPending) return;
    setCancelMode(null);
    setCancelReason('');
  }, [cancelMatchMutation.isPending]);

  const confirmCancel = useCallback(() => {
    if (!cancelMode || cancelReason.trim().length < 10) return;
    cancelMatchMutation.mutate({ mode: cancelMode, reason: cancelReason.trim() });
  }, [cancelMatchMutation, cancelMode, cancelReason]);

  return {
    canCancelMatch,
    cancelMatchMutation,
    cancelMode,
    cancelReason,
    coords,
    date,
    handlePlaceSelect,
    handleSubmit,
    handleTypeChange,
    isEditing,
    isPending,
    isRecurring,
    location,
    matchData,
    onDateChange,
    onTimeChange,
    reserveVacancies,
    selectedType,
    setCancelReason,
    setIsRecurring,
    setLocation,
    setReserveVacancies,
    setShowDatePicker,
    setShowTimePicker,
    setTotalVacancies,
    showDatePicker,
    showTimePicker,
    totalVacancies,
    type,
    openCancel,
    closeCancel,
    confirmCancel,
  };
}
