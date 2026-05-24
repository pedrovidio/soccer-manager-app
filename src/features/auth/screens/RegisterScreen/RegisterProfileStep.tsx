import React, { memo, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ChipRow, LevelCard } from '@ui/primitives';
import { FREQUENCIES, LEVELS, POSITIONS, YEARS } from './options';
import { styles } from './styles';
import { RegisterStepProps } from './types';

function RegisterProfileStepComponent({ form, setField }: RegisterStepProps) {
  const renderLevel = useCallback(({ item }: { item: typeof LEVELS[number] }) => (
    <LevelCard
      value={item.value}
      label={item.label}
      desc={item.desc}
      icon={item.icon}
      isSelected={form.highestLevel === item.value}
      onSelect={(value) => setField('highestLevel', value)}
    />
  ), [form.highestLevel, setField]);

  return (
    <View>
      <Text style={styles.stepTitle}>Perfil no futebol</Text>
      <Text style={styles.stepSubtitle}>Essas informações calculam seu Overall inicial</Text>

      <Text style={styles.sectionLabel}>Posição preferida</Text>
      <ChipRow
        options={POSITIONS}
        selectedValue={form.preferredPosition}
        onSelect={(value) => setField('preferredPosition', value)}
      />

      <Text style={styles.sectionLabel}>Nível mais alto que jogou</Text>
      <FlatList
        data={LEVELS}
        keyExtractor={(item) => item.value}
        renderItem={renderLevel}
        scrollEnabled={false}
      />

      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Há quantos anos joga?</Text>
      <ChipRow options={YEARS} selectedValue={form.yearsPlaying} onSelect={(value) => setField('yearsPlaying', value)} />

      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Frequência semanal</Text>
      <ChipRow
        options={FREQUENCIES}
        selectedValue={form.weeklyFrequency}
        onSelect={(value) => setField('weeklyFrequency', value)}
      />
    </View>
  );
}

export const RegisterProfileStep = memo(RegisterProfileStepComponent);
