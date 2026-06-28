import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@features/auth/useAuthStore';
import { useHomeDashboard } from '@features/home/hooks/useHomeDashboard';
import { athleteApi } from '../services/athleteApi';
import { httpClient } from '@lib/httpClient';
import { queryKeys } from '@lib/queryKeys';
import { maskDate } from '@ui/utils/masks';
import type { FootballLevel, YearsPlaying, WeeklyFrequency, AvailabilitySlot } from '@features/auth/registerTypes';

export type Step = 0 | 1 | 2;

/** Converte uma data ISO (YYYY-MM-DD ou timestamp) para DD/MM/AAAA */
function isoToBrazilian(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/** Converte DD/MM/AAAA para YYYY-MM-DD (ISO) */
function brazilianToIso(value: string): string | undefined {
  const parts = value.split('/');
  if (parts.length !== 3) return undefined;
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return undefined;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function useEditProfileForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const { dashboard } = useHomeDashboard(athleteId);

  const [hasInitialized, setHasInitialized] = useState(!!dashboard);
  const [step, setStep] = useState<Step>(0);

  // ── Step 1: Dados Pessoais ────────────────────────────────────────
  const [name, setName] = useState(dashboard?.name ?? '');
  const [gender, setGender] = useState<'M' | 'F'>(dashboard?.gender ?? 'M');
  const [birthDate, setBirthDate] = useState(isoToBrazilian(dashboard?.birthDate));
  const [position, setPosition] = useState(() => {
    const pos = dashboard?.position ?? '';
    return pos ? pos.charAt(0).toUpperCase() + pos.slice(1).toLowerCase() : '';
  });
  const [pixKey, setPixKey] = useState(dashboard?.pixKey ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (dashboard && !hasInitialized) {
      if (dashboard.name) setName(dashboard.name);
      if (dashboard.gender) setGender(dashboard.gender);
      if (dashboard.birthDate) setBirthDate(isoToBrazilian(dashboard.birthDate));
      if (dashboard.position) {
        const pos = dashboard.position;
        const normalizedPos = pos.charAt(0).toUpperCase() + pos.slice(1).toLowerCase();
        setPosition(normalizedPos);
      }
      if (dashboard.pixKey) setPixKey(dashboard.pixKey);
      setHasInitialized(true);
    }
  }, [dashboard, hasInitialized]);

  function handleBirthDateChange(value: string) {
    setBirthDate(maskDate(value));
  }

  // ── Step 2: Questionário ──────────────────────────────────────────
  const { data: assessment } = useQuery({
    queryKey: queryKeys.assessment(athleteId),
    queryFn: () => athleteApi.getAssessment(athleteId),
    enabled: !!athleteId,
  });

  const [playedProfessionally, setPlayedProfessionally] = useState(false);
  const [highestLevel, setHighestLevel] = useState<FootballLevel>('CASUAL');
  const [yearsPlaying, setYearsPlaying] = useState<YearsPlaying>('LESS_THAN_2');
  const [weeklyFrequency, setWeeklyFrequency] = useState<WeeklyFrequency>('RARELY');
  const [pace, setPace] = useState(50);
  const [shooting, setShooting] = useState(50);
  const [passing, setPassing] = useState(50);
  const [dribbling, setDribbling] = useState(50);
  const [defense, setDefense] = useState(50);
  const [physical, setPhysical] = useState(50);

  useEffect(() => {
    if (!assessment) return;
    setPlayedProfessionally(assessment.playedProfessionally);
    setHighestLevel(assessment.highestLevel);
    setYearsPlaying(assessment.yearsPlaying);
    setWeeklyFrequency(assessment.weeklyFrequency);
    setPace(assessment.selfRatedPace);
    setShooting(assessment.selfRatedShooting);
    setPassing(assessment.selfRatedPassing);
    setDribbling(assessment.selfRatedDribbling);
    setDefense(assessment.selfRatedDefense);
    setPhysical(assessment.selfRatedPhysical);
  }, [assessment]);

  // ── Step 3: Disponibilidade ───────────────────────────────────────
  const { data: savedSlots } = useQuery({
    queryKey: queryKeys.availability(athleteId),
    queryFn: () => athleteApi.getAvailability(athleteId),
    enabled: !!athleteId,
  });

  const [wantsAvailability, setWantsAvailability] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    if (!savedSlots) return;
    if (savedSlots.length > 0) {
      setWantsAvailability(true);
      setSlots(savedSlots);
    }
  }, [savedSlots]);

  // ── Mutations ─────────────────────────────────────────────────────
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.home(athleteId) });
    qc.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
    qc.invalidateQueries({ queryKey: queryKeys.assessment(athleteId) });
    qc.invalidateQueries({ queryKey: queryKeys.availability(athleteId) });
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      const isoDate = brazilianToIso(birthDate);
      return athleteApi.update(athleteId, {
        name: name.trim(),
        gender,
        ...(isoDate && { birthDate: isoDate }),
        position,
        pixKey: pixKey.trim() || null,
      });
    },
    onSuccess: () => {
      invalidate();
      Alert.alert('Sucesso', 'Dados pessoais salvos com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: () => Alert.alert('Erro', 'Não foi possível salvar o cadastro.'),
  });

  const assessmentMutation = useMutation({
    mutationFn: () => {
      const payload = {
        playedProfessionally,
        highestLevel,
        yearsPlaying,
        weeklyFrequency,
        selfRatedPace: pace,
        selfRatedShooting: shooting,
        selfRatedPassing: passing,
        selfRatedDribbling: dribbling,
        selfRatedDefense: defense,
        selfRatedPhysical: physical,
        preferredPosition: position || 'Midfielder',
      };
      return httpClient.patch(`/athletes/${athleteId}/assessment`, payload).then((r) => r.data);
    },
    onSuccess: () => {
      invalidate();
      Alert.alert('Sucesso', 'Perfil e autoavaliação salvos com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: () => Alert.alert('Erro', 'Não foi possível salvar o questionário.'),
  });

  const availabilityMutation = useMutation({
    mutationFn: () => athleteApi.saveAvailability(athleteId, wantsAvailability ? slots : []),
    onSuccess: () => {
      invalidate();
      Alert.alert('Sucesso', 'Disponibilidade salva com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: () => Alert.alert('Erro', 'Não foi possível salvar a disponibilidade.'),
  });

  async function saveCurrentTab() {
    try {
      if (step === 0) {
        await updateMutation.mutateAsync();
      } else if (step === 1) {
        await assessmentMutation.mutateAsync();
      } else {
        await availabilityMutation.mutateAsync();
      }
    } catch {
      // errors handled in onError callbacks
    }
  }

  const isPending =
    updateMutation.isPending || assessmentMutation.isPending || availabilityMutation.isPending;

  return {
    step, setStep,
    // step 1
    name, setName,
    gender, setGender,
    birthDate, setBirthDate: handleBirthDateChange,
    position, setPosition,
    pixKey, setPixKey,
    photoUri, setPhotoUri,
    // step 2
    playedProfessionally, setPlayedProfessionally,
    highestLevel, setHighestLevel,
    yearsPlaying, setYearsPlaying,
    weeklyFrequency, setWeeklyFrequency,
    pace, setPace, shooting, setShooting, passing, setPassing,
    dribbling, setDribbling, defense, setDefense, physical, setPhysical,
    // step 3
    wantsAvailability, setWantsAvailability, slots, setSlots,
    // shared
    saveCurrentTab, isPending, athleteId, dashboard,
  };
}
