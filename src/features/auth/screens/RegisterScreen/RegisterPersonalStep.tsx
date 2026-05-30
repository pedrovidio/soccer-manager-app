import React, { memo, useCallback } from 'react';
import { Text, View } from 'react-native';
import { FormField, UFSelect, ChipRow, Input } from '@ui/primitives';
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

      <FormField label="CPF">
        <Input
          placeholder="000.000.000-00"
          keyboardType="numeric"
          value={form.cpf}
          onChangeText={handleCpfChange}
        />
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

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <FormField label="Telefone">
            <Input
              placeholder="(51) 99999-9999"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={handlePhoneChange}
            />
          </FormField>
        </View>
        <View style={styles.rowRight}>
          <FormField label="Idade">
            <Input
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
            <Input
              placeholder="00000-000"
              keyboardType="numeric"
              value={form.cep}
              onChangeText={handleCepChange}
            />
          </FormField>
        </View>
        <View style={styles.rowRightWide}>
          <FormField label="Rua">
            <Input value={form.street} onChangeText={(value) => setField('street', value)} />
          </FormField>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <FormField label="Número">
            <Input
              placeholder="123"
              keyboardType="numeric"
              value={form.number}
              onChangeText={(value) => setField('number', value)}
            />
          </FormField>
        </View>
        <View style={styles.rowRightWide}>
          <FormField label="Complemento">
            <Input
              placeholder="Apto (opcional)"
              value={form.complement}
              onChangeText={(value) => setField('complement', value)}
            />
          </FormField>
        </View>
      </View>

      <FormField label="Bairro">
        <Input
          value={form.neighborhood}
          onChangeText={(value) => setField('neighborhood', value)}
        />
      </FormField>

      <View style={styles.row}>
        <View style={styles.rowLeftWide}>
          <FormField label="Cidade">
            <Input value={form.city} onChangeText={(value) => setField('city', value)} />
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
