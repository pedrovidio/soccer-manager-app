import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../common/theme';
import type { useEditProfileForm } from '../../hooks/useEditProfileForm';
import type { FootballLevel, YearsPlaying, WeeklyFrequency } from '../../../auth/registerTypes';
import { ChipRow, LevelCard } from '../../../common/components/form/FormElements';
import { AttributeSlider } from '../../../common/components/AttributeSlider';

type Props = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'highestLevel' | 'setHighestLevel'
  | 'yearsPlaying' | 'setYearsPlaying'
  | 'weeklyFrequency' | 'setWeeklyFrequency'
  | 'pace' | 'setPace' | 'shooting' | 'setShooting' | 'passing' | 'setPassing'
  | 'dribbling' | 'setDribbling' | 'defense' | 'setDefense' | 'physical' | 'setPhysical'
>;

const LEVELS: { value: FootballLevel; label: string; desc: string; icon: string }[] = [
  { value: 'PROFESSIONAL', label: 'Profissional', desc: 'Jogou em clube ou competição oficial', icon: '🏆' },
  { value: 'AMATEUR',      label: 'Amador',       desc: 'Joga em várzea ou campeonatos locais', icon: '⚽' },
  { value: 'CASUAL',       label: 'Casual',       desc: 'Joga por lazer e diversão',            icon: '🎮' },
];

const YEARS: { value: YearsPlaying; label: string }[] = [
  { value: 'LESS_THAN_2',  label: '< 2 anos' },
  { value: '2_TO_5',       label: '2 a 5 anos' },
  { value: '6_TO_10',      label: '6 a 10 anos' },
  { value: 'MORE_THAN_10', label: '+ de 10 anos' },
];

const FREQUENCY: { value: WeeklyFrequency; label: string }[] = [
  { value: 'RARELY',    label: 'Raramente' },
  { value: '1_TO_2',    label: '1 a 2x/semana' },
  { value: '3_OR_MORE', label: '3x ou mais' },
];

const ATTRIBUTES: { key: string; label: string }[] = [
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

  const overall = Math.round(
    (props.pace + props.shooting + props.passing +
     props.dribbling + props.defense + props.physical) / 6
  );
  const overallColor = overall >= 70 ? Colors.success : overall >= 50 ? Colors.warning : Colors.error;

  return (
    <View>
      <Text style={s.stepTitle}>Perfil no futebol</Text>
      <Text style={s.stepSubtitle}>Essas informações calculam seu Overall</Text>

      <Text style={s.sectionLabel}>Nível mais alto que jogou</Text>
      {LEVELS.map((l) => (
        <LevelCard
          key={l.value}
          value={l.value}
          label={l.label}
          desc={l.desc}
          icon={l.icon}
          isSelected={highestLevel === l.value}
          onSelect={(val) => setHighestLevel(val)}
        />
      ))}

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Há quantos anos joga?</Text>
      <ChipRow
        options={YEARS}
        selectedValue={yearsPlaying}
        onSelect={(val) => setYearsPlaying(val)}
      />

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Frequência semanal</Text>
      <ChipRow
        options={FREQUENCY}
        selectedValue={weeklyFrequency}
        onSelect={(val) => setWeeklyFrequency(val)}
      />

      <View style={s.divider} />

      <Text style={s.stepTitle}>Autoavaliação</Text>
      <Text style={s.stepSubtitle}>Arraste para definir seus atributos técnicos</Text>

      <View style={[s.overallCard, { borderColor: overallColor }]}>
        <Text style={s.overallLabel}>Overall estimado</Text>
        <Text style={[s.overallValue, { color: overallColor }]}>{overall}</Text>
      </View>

      {ATTRIBUTES.map(({ key, label }) => {
        const value = props[key as keyof Props] as number;
        const setter = props[SETTER_MAP[key] as keyof Props] as (v: number) => void;
        return (
          <AttributeSlider
            key={key}
            label={label}
            value={value}
            onChange={setter}
          />
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  stepTitle:       { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle:    { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  sectionLabel:    { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  divider:         { height: 1, backgroundColor: Colors.n200, marginVertical: 24 },
  overallCard:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 2, padding: 16, marginBottom: 24 },
  overallLabel:    { fontSize: 13, fontWeight: '600', color: Colors.n700 },
  overallValue:    { fontSize: 36, fontWeight: '800' },
});
