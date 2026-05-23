import React, { memo, useCallback } from 'react';
import { Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { maskCep } from '../../../../ui/utils/masks';
import { styles } from './styles';

type CepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

type CEPFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onCepResolved?: (data: CepResponse) => void;
  loading?: boolean;
};

function CEPFieldComponent({ value, onChange, onCepResolved, loading = false }: CEPFieldProps) {
  const handleCepChange = useCallback(async (nextValue: string) => {
    const digits = nextValue.replace(/\D/g, '').slice(0, 8);
    onChange(maskCep(digits));

    if (digits.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await res.json()) as CepResponse;
      if (!data.erro) {
        onCepResolved?.(data);
        return;
      }

      Alert.alert('CEP não encontrado');
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    }
  }, [onCepResolved, onChange]);

  return (
    <TouchableOpacity disabled style={styles.input}>
      <TextInput
        style={styles.inputText}
        placeholder="00000-000"
        placeholderTextColor={Colors.n400}
        keyboardType="numeric"
        value={value}
        onChangeText={handleCepChange}
        editable={!loading}
      />
      {loading && <Text style={styles.primaryText}>⟳</Text>}
    </TouchableOpacity>
  );
}

export const CEPField = memo(CEPFieldComponent);
