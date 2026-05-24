import React, { useCallback, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { AttributeSlider } from '../../components/AttributeSlider';
import { ChipRow, LevelCard } from '../../../../ui/primitives';
import { ATTRIBUTES, FREQUENCY, LEVELS, YEARS } from './options';
import { styles } from './styles';
import { StepQuestionarioProps } from './types';

export default function StepQuestionario(props: StepQuestionarioProps) {
  const overall = useMemo(
    () => Math.round((props.pace + props.shooting + props.passing + props.dribbling + props.defense + props.physical) / 6),
    [props.defense, props.dribbling, props.pace, props.passing, props.physical, props.shooting],
  );
  const overallColor = overall >= 70 ? Colors.success : overall >= 50 ? Colors.warning : Colors.error;

  const renderLevel = useCallback(({ item }: { item: (typeof LEVELS)[number] }) => (
    <LevelCard
      value={item.value}
      label={item.label}
      desc={item.desc}
      icon={item.icon}
      isSelected={props.highestLevel === item.value}
      onSelect={props.setHighestLevel}
    />
  ), [props.highestLevel, props.setHighestLevel]);

  const renderAttribute = useCallback(({ item }: { item: (typeof ATTRIBUTES)[number] }) => {
    const value = props[item.key] as number;
    const setter = props[item.setter] as (value: number) => void;
    return <AttributeSlider label={item.label} value={value} onChange={setter} />;
  }, [props]);

  return (
    <View>
      <Text style={styles.stepTitle}>Perfil no futebol</Text>
      <Text style={styles.stepSubtitle}>Essas informacoes calculam seu Overall</Text>

      <Text style={styles.sectionLabel}>Nivel mais alto que jogou</Text>
      <FlatList data={LEVELS} keyExtractor={(item) => item.value} renderItem={renderLevel} scrollEnabled={false} contentContainerStyle={styles.levelList} />

      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Ha quantos anos joga?</Text>
      <ChipRow options={YEARS} selectedValue={props.yearsPlaying} onSelect={props.setYearsPlaying} />

      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Frequencia semanal</Text>
      <ChipRow options={FREQUENCY} selectedValue={props.weeklyFrequency} onSelect={props.setWeeklyFrequency} />

      <View style={styles.divider} />
      <Text style={styles.stepTitle}>Autoavaliacao</Text>
      <Text style={styles.stepSubtitle}>Arraste para definir seus atributos tecnicos</Text>

      <View style={[styles.overallCard, { borderColor: overallColor }]}>
        <Text style={styles.overallLabel}>Overall estimado</Text>
        <Text style={[styles.overallValue, { color: overallColor }]}>{overall}</Text>
      </View>

      <FlatList data={ATTRIBUTES} keyExtractor={(item) => item.key} renderItem={renderAttribute} scrollEnabled={false} />
    </View>
  );
}
