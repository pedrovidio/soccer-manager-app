import React, { memo, useCallback } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import { FormField, UFSelect, ChipRow } from '@ui/primitives';
import { maskCep, maskCpf, maskPhone } from '@ui/utils/masks';
import { GENDERS } from './options';
import { styles } from './styles';
import { RegisterStepProps } from './types';

type RegisterPersonalStepProps = RegisterStepProps & {
  onCepComplete: (cepDigits: string) => void;
};

function RegisterPersonalStepComponent({ form, setField, onCepComplete }: RegisterPersonalStepProps) {
  const handleCpfChange = useCallback((value: string) => {
    setField('cpf', maskCpf(value));
  }, [setField]);

  const handlePhoneChange = useCallback((value: string) => {
    setField('phone', maskPhone(value));
  }, [setField]);

  const handleCepChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    setField('cep', maskCep(digits));

    if (digits.length === 8) {
      onCepComplete(digits);
    }
  }, [onCepComplete, setField]);

  return (
    <View>
      <Text style={styles.stepTitle}>Dados pessoais</Text>
      <Text style={styles.stepSubtitle}>Informações básicas e endereço</Text>

      <FormField label="Nome completo">
        <TextInput style={styles.input} value={form.name} onChangeText={(value) => setField('name', value)} />
      </FormField>

      <FormField label="E-mail">
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor={Colors.n400}
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(value) => setField('email', value)}
        />
      </FormField>

      <FormField label="CPF">
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor={Colors.n400}
          keyboardType="numeric"
          value={form.cpf}
          onChangeText={handleCpfChange}
        />
      </FormField>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <FormField label="Senha">
            <TextInput
              style={styles.input}
              placeholder="******"
              placeholderTextColor={Colors.n400}
              secureTextEntry
              value={form.password}
              onChangeText={(value) => setField('password', value)}
            />
          </FormField>
        </View>
        <View style={styles.rowRight}>
          <FormField label="Confirmar senha">
            <TextInput
              style={styles.input}
              placeholder="******"
              placeholderTextColor={Colors.n400}
              secureTextEntry
              value={form.confirmPassword}
              onChangeText={(value) => setField('confirmPassword', value)}
            />
          </FormField>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <FormField label="Telefone">
            <TextInput
              style={styles.input}
              placeholder="(51) 99999-9999"
              placeholderTextColor={Colors.n400}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={handlePhoneChange}
            />
          </FormField>
        </View>
        <View style={styles.rowRight}>
          <FormField label="Idade">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.age}
              onChangeText={(value) => setField('age', value)}
            />
          </FormField>
        </View>
      </View>

      <FormField label="Gênero">
        <ChipRow options={GENDERS} selectedValue={form.gender} onSelect={(value) => setField('gender', value)} />
      </FormField>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Endereço</Text>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <FormField label="CEP">
            <TextInput
              style={styles.input}
              placeholder="00000-000"
              placeholderTextColor={Colors.n400}
              keyboardType="numeric"
              value={form.cep}
              onChangeText={handleCepChange}
            />
          </FormField>
        </View>
        <View style={styles.rowRightWide}>
          <FormField label="Rua">
            <TextInput style={styles.input} value={form.street} onChangeText={(value) => setField('street', value)} />
          </FormField>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <FormField label="Número">
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor={Colors.n400}
              keyboardType="numeric"
              value={form.number}
              onChangeText={(value) => setField('number', value)}
            />
          </FormField>
        </View>
        <View style={styles.rowRightWide}>
          <FormField label="Complemento">
            <TextInput
              style={styles.input}
              placeholder="Apto (opcional)"
              placeholderTextColor={Colors.n400}
              value={form.complement}
              onChangeText={(value) => setField('complement', value)}
            />
          </FormField>
        </View>
      </View>

      <FormField label="Bairro">
        <TextInput
          style={styles.input}
          value={form.neighborhood}
          onChangeText={(value) => setField('neighborhood', value)}
        />
      </FormField>

      <View style={styles.row}>
        <View style={styles.rowLeftWide}>
          <FormField label="Cidade">
            <TextInput style={styles.input} value={form.city} onChangeText={(value) => setField('city', value)} />
          </FormField>
        </View>
      </View>

      <FormField label="UF">
        <UFSelect value={form.state} onChange={(value) => setField('state', value)} />
      </FormField>
    </View>
  );
}

export const RegisterPersonalStep = memo(RegisterPersonalStepComponent);
