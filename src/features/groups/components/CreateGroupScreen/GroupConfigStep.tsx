import React, { memo } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { CreateGroupFormData } from '../../groupTypes';
import { GroupForm } from '../GroupForm/GroupForm';
import { styles } from './styles';

type Props = {
  form: CreateGroupFormData;
  onChange: (field: keyof CreateGroupFormData, value: string | string[]) => void;
  onNext: () => void;
};

function GroupConfigStepComponent({ form, onChange, onNext }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Configuracoes do grupo</Text>
      <Text style={styles.stepSub}>Deixe cobrancas e PIX claros para evitar ajuste depois</Text>
      <GroupForm form={form} onChange={onChange} />
      <TouchableOpacity style={styles.btn} onPress={onNext}>
        <Text style={styles.btnText}>Continuar</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

export const GroupConfigStep = memo(GroupConfigStepComponent);
