import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { AttributeSlider } from '@features/athletes/components/AttributeSlider';
import { Colors } from '@ui/tokens/theme';
import { ATTRIBUTES } from './options';
import { styles } from './styles';
import { RegisterStepProps } from './types';

function RegisterAttributesStepComponent({ form, setField }: RegisterStepProps) {
  const overall = useMemo(() => Math.round(
    (
      form.selfRatedPace +
      form.selfRatedShooting +
      form.selfRatedPassing +
      form.selfRatedDribbling +
      form.selfRatedDefense +
      form.selfRatedPhysical
    ) / 6,
  ), [
    form.selfRatedDefense,
    form.selfRatedDribbling,
    form.selfRatedPace,
    form.selfRatedPassing,
    form.selfRatedPhysical,
    form.selfRatedShooting,
  ]);

  const overallColor = overall >= 70 ? Colors.success : overall >= 50 ? Colors.warning : Colors.error;

  const renderAttribute = useCallback(({ item }: { item: typeof ATTRIBUTES[number] }) => (
    <AttributeSlider
      label={item.label}
      value={form[item.key] as number}
      onChange={(value) => setField(item.key, value)}
    />
  ), [form, setField]);

  return (
    <View>
      <Text style={styles.stepTitle}>Autoavaliação</Text>
      <Text style={styles.stepSubtitle}>Arraste para definir seus atributos técnicos</Text>

      <View style={[styles.overallCard, { borderColor: overallColor }]}>
        <Text style={styles.overallLabel}>Overall inicial estimado</Text>
        <Text style={[styles.overallValue, { color: overallColor }]}>{overall}</Text>
      </View>

      <FlatList
        data={ATTRIBUTES}
        keyExtractor={(item) => item.key}
        renderItem={renderAttribute}
        scrollEnabled={false}
      />
    </View>
  );
}

export const RegisterAttributesStep = memo(RegisterAttributesStepComponent);
