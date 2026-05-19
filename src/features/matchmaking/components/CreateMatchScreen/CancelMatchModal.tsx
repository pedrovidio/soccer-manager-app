import React, { memo } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../common/theme';
import { CancelMode } from './types';
import { styles } from './styles';

type CancelMatchModalProps = {
  mode: CancelMode;
  reason: string;
  isPending: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function CancelMatchModalComponent({
  mode,
  reason,
  isPending,
  onReasonChange,
  onClose,
  onConfirm,
}: CancelMatchModalProps) {
  const canConfirm = reason.trim().length >= 10 && !isPending;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>
          {mode === 'series' ? 'Cancelar recorrência' : 'Cancelar partida'}
        </Text>
        <Text style={styles.modalSubtitle}>Informe o motivo do cancelamento.</Text>

        <TextInput
          style={styles.modalInput}
          placeholder="Motivo (mín. 10 caracteres)"
          placeholderTextColor={Colors.n400}
          value={reason}
          onChangeText={onReasonChange}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.modalButtonRow}>
          <TouchableOpacity
            style={[styles.modalBtn, styles.modalBtnSecondary]}
            onPress={onClose}
            disabled={isPending}
          >
            <Text style={styles.modalBtnTextSecondary}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalBtn, styles.modalBtnDanger, !canConfirm ? styles.modalBtnDisabled : null]}
            onPress={onConfirm}
            disabled={!canConfirm}
          >
            {isPending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.modalBtnTextDanger}>Confirmar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const CancelMatchModal = memo(CancelMatchModalComponent);
