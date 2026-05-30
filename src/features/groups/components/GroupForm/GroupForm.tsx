import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { maskCurrency } from '@ui/utils/masks';
import { CreateGroupFormData } from '@features/groups/groupTypes';
import { Input } from '@ui/primitives';
import { Field } from './Field';
import { TeamNameInput } from './TeamNameInput';
import { styles } from './styles';

type Props = {
  form: CreateGroupFormData;
  editable?: boolean;
  onChange: (field: keyof CreateGroupFormData, value: string | string[]) => void;
};

function GroupFormComponent({ form, editable = true, onChange }: Props) {
  const teamNameItems = useMemo(
    () => [0, 1].map((index) => ({ index, value: form.teamNames[index] ?? '' })),
    [form.teamNames],
  );

  const handleTeamNameChange = useCallback((index: number, value: string) => {
    const next = [...form.teamNames];
    next[index] = value;
    onChange('teamNames', next);
  }, [form.teamNames, onChange]);

  const renderTeamName = useCallback(({ item }: { item: { index: number; value: string } }) => (
    <TeamNameInput index={item.index} value={item.value} editable={editable} onChange={handleTeamNameChange} />
  ), [editable, handleTeamNameChange]);

  const inputStyle = useMemo(() => [!editable ? styles.inputDisabled : null], [editable]);

  return (
    <>
      <Text style={styles.sectionLabel}>Identificacao</Text>
      <Field label="Nome do grupo *">
        <Input
          style={inputStyle}
          placeholder="Ex: Pelada da Sexta"
          value={form.name}
          onChangeText={(value) => onChange('name', value)}
          maxLength={60}
          editable={editable}
        />
      </Field>

      <Field label="Descricao">
        <Input
          style={[styles.inputMultiline, !editable ? styles.inputDisabled : null]}
          placeholder="Conte um pouco sobre o grupo (opcional)"
          value={form.description}
          onChangeText={(value) => onChange('description', value)}
          multiline
          numberOfLines={3}
          maxLength={200}
          editable={editable}
        />
      </Field>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Financeiro</Text>
      <Field label="Aluguel mensal da quadra">
        <Input
          style={inputStyle}
          placeholder="0,00"
          keyboardType="decimal-pad"
          value={form.courtMonthlyFee}
          onChangeText={(value) => onChange('courtMonthlyFee', maskCurrency(value))}
          editable={editable}
        />
      </Field>

      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <Field label="Mensalidade do mensalista">
            <Input
              style={inputStyle}
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={form.monthlyFee}
              onChangeText={(value) => onChange('monthlyFee', maskCurrency(value))}
              editable={editable}
            />
          </Field>
        </View>
        <View style={styles.column}>
          <Field label="Valor do avulso">
            <Input
              style={inputStyle}
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={form.spotFee}
              onChangeText={(value) => onChange('spotFee', maskCurrency(value))}
              editable={editable}
            />
          </Field>
        </View>
      </View>

      <Field label="Chave PIX">
        <Input
          style={inputStyle}
          placeholder="CPF, e-mail ou tel."
          autoCapitalize="none"
          value={form.pixKey}
          onChangeText={(value) => onChange('pixKey', value)}
          editable={editable}
        />
      </Field>

      <Field label="Dia de vencimento da mensalidade">
        <Input
          style={inputStyle}
          placeholder="10"
          keyboardType="number-pad"
          value={form.monthlyFeeDueDay}
          onChangeText={(value) => onChange('monthlyFeeDueDay', value.replace(/\D/g, '').slice(0, 2))}
          maxLength={2}
          editable={editable}
        />
      </Field>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Times</Text>
      <Text style={styles.sectionDesc}>Nomes usados automaticamente no sorteio</Text>
      <FlatList
        data={teamNameItems}
        keyExtractor={(item) => String(item.index)}
        renderItem={renderTeamName}
        scrollEnabled={false}
        removeClippedSubviews={false}
      />
    </>
  );
}

export const GroupForm = memo(GroupFormComponent);
