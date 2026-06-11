import React, { memo, useCallback } from 'react';
import { Text, View } from 'react-native';
import { FormField, ChipRow, Input } from '@ui/primitives';
import { maskDate } from '@ui/utils/masks';
import { GENDERS } from './options';
import { styles } from './styles';
import { RegisterStepProps } from './types';

function RegisterPersonalStepComponent({ form, setField }: RegisterStepProps) {
  const handleDateChange = useCallback((value: string) => {
    setField('birthDate', maskDate(value));
  }, [setField]);

  return (
    <View>
      <Text style={styles.stepTitle}>Dados pessoais</Text>
      <Text style={styles.stepSubtitle}>Informações básicas de cadastro</Text>

      <FormField label="Nome completo">
        <Input value={form.name} onChangeText={(value) => setField('name', value)} />
      </FormField>

      <FormField label="E-mail">
        <Input
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(value) => setField('email', value)}
        />
      </FormField>

      <FormField label="Data de nascimento">
        <Input
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          value={form.birthDate}
          onChangeText={handleDateChange}
        />
      </FormField>

      <FormField label="Gênero">
        <ChipRow options={GENDERS} selectedValue={form.gender} onSelect={(value) => setField('gender', value)} />
      </FormField>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <FormField label="Senha">
            <Input
              placeholder="******"
              secureTextEntry
              value={form.password}
              onChangeText={(value) => setField('password', value)}
            />
          </FormField>
        </View>
        <View style={styles.rowRight}>
          <FormField label="Confirmar senha">
            <Input
              placeholder="******"
              secureTextEntry
              value={form.confirmPassword}
              onChangeText={(value) => setField('confirmPassword', value)}
            />
          </FormField>
        </View>
      </View>
    </View>
  );
}

export const RegisterPersonalStep = memo(RegisterPersonalStepComponent);
