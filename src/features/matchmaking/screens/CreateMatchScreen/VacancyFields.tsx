import React, { memo } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

type VacancyFieldsProps = {
  totalVacancies: string;
  reserveVacancies: string;
  typeLabel: string;
  suggestedVacancies: number;
  onTotalChange: (value: string) => void;
  onReserveChange: (value: string) => void;
};

function VacancyFieldsComponent({
  totalVacancies,
  reserveVacancies,
  typeLabel,
  suggestedVacancies,
  onTotalChange,
  onReserveChange,
}: VacancyFieldsProps) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Vagas</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={Arena.textSubtle}
            value={totalVacancies}
            onChangeText={onTotalChange}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Reservas</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            placeholderTextColor={Arena.textSubtle}
            value={reserveVacancies}
            onChangeText={onReserveChange}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={13} color={Arena.textSubtle} />
        <Text style={styles.hintText}>
          Sugestão para {typeLabel}: {suggestedVacancies} jogadores no máximo, incluindo reservas (editável)
        </Text>
      </View>
    </>
  );
}

export const VacancyFields = memo(VacancyFieldsComponent);
