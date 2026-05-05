import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Radius, Spacing } from '../../../common/theme';
import type { useEditProfileForm } from '../../hooks/useEditProfileForm';
import type { FootballLevel, YearsPlaying, WeeklyFrequency } from '../../../auth/registerTypes';

type Props = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'highestLevel' | 'setHighestLevel'
  | 'yearsPlaying' | 'setYearsPlaying'
  | 'weeklyFrequency' | 'setWeeklyFrequency'
  | 'pace' | 'setPace' | 'shooting' | 'setShooting' | 'passing' | 'setPassing'
  | 'dribbling' | 'setDribbling' | 'defense' | 'setDefense' | 'physical' | 'setPhysical'
>;

const LEVELS: { value: FootballLevel; label: string; desc: string }[] = [
  { value: 'PROFESSIONAL', label: 'Profissional', desc: 'Jogou profissionalmente ou em competições oficiais' },
  { value: 'AMATEUR',      label: 'Amador',       desc: 'Participou de campeonatos amadores ou ligas locais' },
  { value: 'CASUAL',       label: 'Casual',       desc: 'Joga por lazer, sem competições formais' },
];

const YEARS: { value: YearsPlaying; label: string }[] = [
  { value: 'LESS_THAN_2', label: 'Menos de 2 anos' },
  { value: '2_TO_5',      label: '2 a 5 anos' },
  { value: '6_TO_10',     label: '6 a 10 anos' },
  { value: 'MORE_THAN_10',label: 'Mais de 10 anos' },
];

const FREQUENCY: { value: WeeklyFrequency; label: string }[] = [
  { value: 'RARELY',   label: 'Raramente' },
  { value: '1_TO_2',   label: '1 a 2x por semana' },
  { value: '3_OR_MORE',label: '3x ou mais por semana' },
];

const ATTRIBUTES: { key: keyof Props & string; label: string }[] = [
  { key: 'pace',      label: 'Velocidade' },
  { key: 'shooting',  label: 'Finalização' },
  { key: 'passing',   label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defense',   label: 'Defesa' },
  { key: 'physical',  label: 'Físico' },
];

const SETTER_MAP: Record<string, keyof Props> = {
  pace:      'setPace',
  shooting:  'setShooting',
  passing:   'setPassing',
  dribbling: 'setDribbling',
  defense:   'setDefense',
  physical:  'setPhysical',
};

export default function StepQuestionario(props: Props) {
  const {
    highestLevel, setHighestLevel,
    yearsPlaying, setYearsPlaying,
    weeklyFrequency, setWeeklyFrequency,
  } = props;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

      {/* Nível de futebol */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Nível de futebol</Text>
        {LEVELS.map((l) => (
          <TouchableOpacity
            key={l.value}
            style={[s.optionRow, highestLevel === l.value && s.optionRowActive]}
            onPress={() => setHighestLevel(l.value)}
            activeOpacity={0.7}
          >
            <View style={[s.radio, highestLevel === l.value && s.radioActive]}>
              {highestLevel === l.value && <View style={s.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.optionLabel, highestLevel === l.value && s.optionLabelActive]}>{l.label}</Text>
              <Text style={s.optionDesc}>{l.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tempo de prática */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Há quanto tempo joga?</Text>
        {YEARS.map((y) => (
          <TouchableOpacity
            key={y.value}
            style={[s.optionRow, yearsPlaying === y.value && s.optionRowActive]}
            onPress={() => setYearsPlaying(y.value)}
            activeOpacity={0.7}
          >
            <View style={[s.radio, yearsPlaying === y.value && s.radioActive]}>
              {yearsPlaying === y.value && <View style={s.radioDot} />}
            </View>
            <Text style={[s.optionLabel, yearsPlaying === y.value && s.optionLabelActive]}>{y.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Frequência semanal */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Frequência semanal</Text>
        {FREQUENCY.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[s.optionRow, weeklyFrequency === f.value && s.optionRowActive]}
            onPress={() => setWeeklyFrequency(f.value)}
            activeOpacity={0.7}
          >
            <View style={[s.radio, weeklyFrequency === f.value && s.radioActive]}>
              {weeklyFrequency === f.value && <View style={s.radioDot} />}
            </View>
            <Text style={[s.optionLabel, weeklyFrequency === f.value && s.optionLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Atributos técnicos */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Atributos técnicos</Text>
        <Text style={s.sectionDesc}>Avalie suas habilidades de 0 a 100</Text>
        {ATTRIBUTES.map(({ key, label }) => {
          const value = props[key as keyof Props] as number;
          const setter = props[SETTER_MAP[key] as keyof Props] as (v: number) => void;
          return (
            <View key={key} style={s.sliderRow}>
              <Text style={s.sliderLabel}>{label}</Text>
              <Slider
                style={s.slider}
                minimumValue={0} maximumValue={100} step={1}
                value={value}
                onValueChange={setter}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.n200}
                thumbTintColor={Colors.primary}
              />
              <Text style={s.sliderVal}>{value}</Text>
            </View>
          );
        })}
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:           { padding: Spacing.lg, paddingBottom: 24, gap: 12 },
  card:             { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 0.5, borderColor: Colors.n200, padding: Spacing.lg, gap: 4 },
  sectionTitle:     { fontSize: 13, fontWeight: '700', color: Colors.n900, marginBottom: 10 },
  sectionDesc:      { fontSize: 11, color: Colors.n500, marginBottom: 8, marginTop: -6 },
  optionRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 10, borderRadius: Radius.r8, marginBottom: 4 },
  optionRowActive:  { backgroundColor: Colors.primaryLight },
  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.n300, alignItems: 'center', justifyContent: 'center' },
  radioActive:      { borderColor: Colors.primary },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionLabel:      { fontSize: 13, fontWeight: '500', color: Colors.n700 },
  optionLabelActive:{ color: Colors.primary, fontWeight: '700' },
  optionDesc:       { fontSize: 11, color: Colors.n400, marginTop: 1 },
  sliderRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sliderLabel:      { fontSize: 12, color: Colors.n700, width: 76, flexShrink: 0 },
  slider:           { flex: 1, height: 32 },
  sliderVal:        { fontSize: 13, fontWeight: '700', color: Colors.primary, width: 28, textAlign: 'right' },
});
