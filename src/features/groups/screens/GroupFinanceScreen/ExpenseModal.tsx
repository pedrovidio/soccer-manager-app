import React, { memo } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import { ExpenseKind } from './types';
import { styles } from './styles';

type Props = {
  kind: ExpenseKind | null;
  amount: string;
  description: string;
  isSaving: boolean;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

function ExpenseModalComponent({
  kind,
  amount,
  description,
  isSaving,
  onAmountChange,
  onDescriptionChange,
  onClose,
  onSave,
}: Props) {
  if (!kind) return null;
  const isPurchase = kind === 'PURCHASE';

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{isPurchase ? 'Registrar compra' : 'Pagamento da quadra'}</Text>
          <Text style={styles.inputLabel}>Valor pago</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={Colors.n400}
          />
          <Text style={styles.inputLabel}>Descricao</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder={isPurchase ? 'Ex: bola nova, uniformes...' : 'Ex: aluguel da quadra de maio'}
            placeholderTextColor={Colors.n400}
            multiline
          />
          <TouchableOpacity style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} onPress={onSave} disabled={isSaving} activeOpacity={0.7}>
            <Text style={styles.saveBtnText}>{isSaving ? 'Salvando...' : 'Registrar saida'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const ExpenseModal = memo(ExpenseModalComponent);
