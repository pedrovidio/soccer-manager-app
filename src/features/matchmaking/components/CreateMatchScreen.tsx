import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { TextInput } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../common/theme';
import { PlacesAutocomplete, PlaceResult } from '../../common/PlacesAutocomplete';
import { matchApi } from '../services/matchApi';
import { useAuthStore } from '../../auth/useAuthStore';
import { BackButton } from '../../common/components/BackButton';

type MatchType = 'CAMPO' | 'SOCIETY' | 'FUTSAL';

const MATCH_TYPES: { value: MatchType; label: string; vacancies: number }[] = [
  { value: 'CAMPO',   label: 'Campo',   vacancies: 24 },
  { value: 'SOCIETY', label: 'Society', vacancies: 16 },
  { value: 'FUTSAL',  label: 'Futsal',  vacancies: 12 },
];

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function CreateMatchScreen() {
  const router    = useRouter();
  const qc        = useQueryClient();
  const { groupId, matchId } = useLocalSearchParams<{ groupId: string; matchId?: string }>();
  const adminId   = useAuthStore((s) => s.athleteId) ?? '';
  const isEditing = !!matchId;

  const [type, setType]                     = useState<MatchType>('SOCIETY');
  const [date, setDate]                     = useState(new Date());
  const [location, setLocation]             = useState('');
  const [coords, setCoords]                 = useState({ latitude: 0, longitude: 0 });
  const [totalVacancies, setTotalVacancies] = useState('16');
  const [reserveVacancies, setReserve]      = useState('2');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecurring, setIsRecurring]       = useState(false);
  const [prefilled, setPrefilled]           = useState(false);

  const { data: matchData } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: () => matchApi.getDetail(matchId!),
    enabled: isEditing,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (matchData && !prefilled) {
      setType(matchData.type as MatchType);
      setDate(new Date(matchData.date));
      setLocation(matchData.location);
      setCoords({ latitude: matchData.latitude, longitude: matchData.longitude });
      setTotalVacancies(String(matchData.totalVacancies));
      setReserve(String(matchData.reserveVacancies));
      setIsRecurring(matchData.isRecurring ?? false);
      setPrefilled(true);
    }
  }, [matchData, prefilled]);

  const createMutation = useMutation({
    mutationFn: matchApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group-home', groupId] });
      router.back();
    },
    onError: () => Alert.alert('Erro', 'Não foi possível criar a partida.'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof matchApi.update>[1]) =>
      matchApi.update(matchId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      qc.invalidateQueries({ queryKey: ['group-home', groupId] });
      router.back();
    },
    onError: () => Alert.alert('Erro', 'Não foi possível atualizar a partida.'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleTypeChange(t: typeof MATCH_TYPES[number]) {
    setType(t.value);
    setTotalVacancies(String(t.vacancies));
  }

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    setShowDatePicker(false);
    if (selected) {
      const merged = new Date(selected);
      merged.setHours(date.getHours(), date.getMinutes());
      setDate(merged);
    }
  }

  function onTimeChange(_: DateTimePickerEvent, selected?: Date) {
    setShowTimePicker(false);
    if (selected) {
      const merged = new Date(date);
      merged.setHours(selected.getHours(), selected.getMinutes());
      setDate(merged);
    }
  }

  function handleSubmit() {
    if (!location.trim()) return Alert.alert('Atenção', 'Informe o local da partida.');
    if (+totalVacancies < 2) return Alert.alert('Atenção', 'Mínimo de 2 vagas.');
    if (!isEditing && date < new Date()) return Alert.alert('Atenção', 'A data deve ser no futuro.');

    const payload = {
      adminId,
      groupId: groupId!,
      type,
      date: date.toISOString(),
      location: location.trim(),
      latitude:  coords.latitude,
      longitude: coords.longitude,
      totalVacancies:   +totalVacancies,
      reserveVacancies: +reserveVacancies || 0,
      spotRadiusKm: 10,
      minOverall: 0,
      minAge: 16,
      maxAge: 99,
      isRecurring,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>{isEditing ? 'Editar partida' : 'Marcar partida'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* TIPO */}
        <Text style={s.label}>Tipo de partida</Text>
        <View style={s.segmented}>
          {MATCH_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[s.segment, type === t.value && s.segmentActive]}
              onPress={() => handleTypeChange(t)}
              activeOpacity={0.7}
            >
              <Text style={[s.segmentText, type === t.value && s.segmentTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DATA E HORA */}
        <View style={s.row}>
          <View style={s.flex1}>
            <Text style={s.label}>Data</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={s.pickerBtnText}>{formatDate(date)}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.flex1}>
            <Text style={s.label}>Hora</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={s.pickerBtnText}>{formatTime(date)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={onDateChange}
            locale="pt-BR"
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour
            onChange={onTimeChange}
          />
        )}

        {/* LOCAL — Nominatim autocomplete */}
        <Text style={s.label}>Local</Text>
        <PlacesAutocomplete
          value={location}
          onChange={setLocation}
          onSelect={(place: PlaceResult) => {
            setLocation(place.description);
            setCoords({ latitude: place.lat, longitude: place.lng });
          }}
        />
        {coords.latitude !== 0 && (
          <View style={s.coordsRow}>
            <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
            <Text style={s.coordsText}>Localização confirmada</Text>
          </View>
        )}

        {/* VAGAS */}
        <View style={s.row}>
          <View style={s.flex1}>
            <Text style={s.label}>Vagas</Text>
            <TextInput
              style={s.input}
              placeholderTextColor={Colors.n400}
              value={totalVacancies}
              onChangeText={setTotalVacancies}
              keyboardType="numeric"
            />
          </View>
          <View style={s.flex1}>
            <Text style={s.label}>Reservas</Text>
            <TextInput
              style={s.input}
              placeholder="2"
              placeholderTextColor={Colors.n400}
              value={reserveVacancies}
              onChangeText={setReserve}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* HINT DE VAGAS */}
        <View style={s.hintRow}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.n400} />
          <Text style={s.hintText}>
            Sugestão para {MATCH_TYPES.find((t) => t.value === type)?.label}:{' '}
            {MATCH_TYPES.find((t) => t.value === type)?.vacancies} jogadores no máximo, incluindo reservas (editável)
          </Text>
        </View>

        {/* JOGO FIXO */}
        <TouchableOpacity
          style={[s.recurringRow, isRecurring && s.recurringRowActive]}
          onPress={() => setIsRecurring((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={[s.checkbox, isRecurring && s.checkboxActive]}>
            {isRecurring && <Ionicons name="checkmark" size={14} color={Colors.white} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.recurringLabel, isRecurring && s.recurringLabelActive]}>
              Jogo fixo (recorrente)
            </Text>
            <Text style={s.recurringSub}>
              {isRecurring
                ? `Toda ${date.toLocaleDateString('pt-BR', { weekday: 'long' })} às ${formatTime(date)}`
                : 'Ocorre apenas nesta data'}
            </Text>
          </View>
          <Ionicons name="repeat" size={18} color={isRecurring ? Colors.primary : Colors.n400} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />

        <TouchableOpacity
          style={[s.submitBtn, isPending && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.8}
        >
          {isPending
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={s.submitBtnText}>{isEditing ? 'Atualizar partida' : 'Criar partida'}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: Colors.n50 },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  backBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  headerTitle:       { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  content:           { padding: Spacing.lg },

  label:             { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 6, marginTop: 12 },
  input:             { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },

  row:               { flexDirection: 'row', gap: 12 },
  flex1:             { flex: 1 },

  segmented:         { flexDirection: 'row', backgroundColor: Colors.n100, borderRadius: Radius.r8, padding: 3, marginTop: 6 },
  segment:           { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.r8 - 1 },
  segmentActive:     { backgroundColor: Colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  segmentText:       { fontSize: 13, fontWeight: '500', color: Colors.n500 },
  segmentTextActive: { color: Colors.primary, fontWeight: '700' },

  pickerBtn:         { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10 },
  pickerBtnText:     { fontSize: 13, color: Colors.n900, fontWeight: '500', flexShrink: 1 },

  coordsRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  coordsText:        { fontSize: 11, color: Colors.successDark },

  hintRow:           { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  hintText:          { fontSize: 11, color: Colors.n400 },

  recurringRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.n200, borderRadius: Radius.r12, padding: Spacing.md, marginTop: 16 },
  recurringRowActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  checkbox:            { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.n300, alignItems: 'center', justifyContent: 'center' },
  checkboxActive:      { backgroundColor: Colors.primary, borderColor: Colors.primary },
  recurringLabel:      { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  recurringLabelActive:{ color: Colors.primary },
  recurringSub:        { fontSize: 11, color: Colors.n500, marginTop: 2 },

  submitBtn:         { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
