import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../auth/useAuthStore';
import { useHomeDashboard } from '../../home/hooks/useHomeDashboard';
import { athleteApi } from '../services/athleteApi';
import { httpClient } from '../../../lib/httpClient';
import { queryKeys } from '../../../lib/queryKeys';
import { maskCpf, maskPhone, maskCep, digitsOnly } from '../../../ui/utils/masks';
import type { FootballLevel, YearsPlaying, WeeklyFrequency, AvailabilitySlot } from '../../auth/registerTypes';

export type Step = 0 | 1 | 2;

export function useEditProfileForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const { dashboard } = useHomeDashboard(athleteId);

  const [step, setStep] = useState<Step>(0);

  // ── Step 1: Cadastro ──────────────────────────────────────────────
  const [name, setName] = useState(dashboard?.name ?? '');
  const [cpf, setCpf] = useState(maskCpf(dashboard?.cpf ?? ''));
  const [gender, setGender] = useState<'M' | 'F'>(dashboard?.gender ?? 'M');
  const [phone, setPhone] = useState(maskPhone(dashboard?.phone ?? ''));
  const [age, setAge] = useState(String(dashboard?.age ?? ''));
  const [position, setPosition] = useState(dashboard?.position ?? '');
  const [pixKey, setPixKey] = useState(dashboard?.pixKey ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cep, setCep] = useState(maskCep(dashboard?.address?.cep ?? ''));
  const [street, setStreet] = useState(dashboard?.address?.street ?? '');
  const [addrNum, setAddrNum] = useState(String(dashboard?.address?.number ?? ''));
  const [complement, setComplement] = useState(dashboard?.address?.complement ?? '');
  const [neighborhood, setNeighborhood] = useState(dashboard?.address?.neighborhood ?? '');
  const [city, setCity] = useState(dashboard?.address?.city ?? '');
  const [addrState, setAddrState] = useState(dashboard?.address?.state ?? '');
  const [cepLoading, setCepLoading] = useState(false);

  async function handleCepChange(value: string) {
    const masked = maskCep(value);
    setCep(masked);
    const digits = digitsOnly(masked);
    if (digits.length !== 8) return;
    try {
      setCepLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { Alert.alert('CEP não encontrado'); return; }
      setStreet(data.logradouro ?? '');
      setNeighborhood(data.bairro ?? '');
      setCity(data.localidade ?? '');
      setAddrState(data.uf ?? '');
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    } finally {
      setCepLoading(false);
    }
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
    qc.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
    qc.invalidateQueries({ queryKey: queryKeys.assessment(athleteId) });
    qc.invalidateQueries({ queryKey: queryKeys.availability(athleteId) });
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      athleteApi.update(athleteId, {
        name: name.trim(),
        cpf: cpf.replace(/\D/g, ''),
        gender,
        phone: phone.replace(/\D/g, ''),
        age: Number(age),
        position,
        pixKey: pixKey.trim() || null,
        ...(cep.trim() && {
          address: {
            cep: cep.replace(/\D/g, ''),
            street: street.trim(),
            number: Number(addrNum),
            complement: complement.trim() || undefined,
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: addrState.trim().toUpperCase(),
          },
        }),
      }),
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
      console.log('[assessment payload]', JSON.stringify(payload));
      return httpClient.patch(`/athletes/${athleteId}/assessment`, payload).then((r) => r.data);
    },
    onError: () => Alert.alert('Erro', 'Não foi possível salvar o questionário.'),
  });

  const availabilityMutation = useMutation({
    mutationFn: () => athleteApi.saveAvailability(athleteId, wantsAvailability ? slots : []),
    onSuccess: () => { invalidate(); router.back(); },
    onError: () => Alert.alert('Erro', 'Não foi possível salvar a disponibilidade.'),
  });

  async function saveAndNext() {
    try {
      if (step === 0) {
        await updateMutation.mutateAsync();
        setStep(1);
      } else if (step === 1) {
        await assessmentMutation.mutateAsync();
        setStep(2);
      } else {
        availabilityMutation.mutate();
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
    name, setName, cpf, setCpf, gender, setGender, phone, setPhone, age, setAge,
    position, setPosition, pixKey, setPixKey,
    photoUri, setPhotoUri,
    cep, setCep: handleCepChange, cepLoading, street, setStreet, addrNum, setAddrNum,
    complement, setComplement, neighborhood, setNeighborhood,
    city, setCity, addrState, setAddrState,
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
    saveAndNext, isPending, athleteId, dashboard,
  };
}
