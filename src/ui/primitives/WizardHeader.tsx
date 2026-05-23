import React, { memo, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { BackButton } from '../composites/BackButton';
import { styles } from './styles';
import { WizardHeaderProps } from './types';

function WizardHeaderComponent({ step, totalSteps, onBack }: WizardHeaderProps) {
  const steps = useMemo(() => Array.from({ length: totalSteps }, (_, index) => index), [totalSteps]);

  return (
    <View style={styles.header}>
      <View style={styles.headerBack}>
        <BackButton onPress={onBack} />
      </View>
      <View style={styles.stepInfo}>
        <Text style={styles.stepLabel}>
          Passo {step} de {totalSteps}
        </Text>
        <FlatList
          data={steps}
          horizontal
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => (
            <View style={[styles.progressDot, item < step ? styles.progressDotActive : null]} />
          )}
          contentContainerStyle={styles.progressBar}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

export const WizardHeader = memo(WizardHeaderComponent);
