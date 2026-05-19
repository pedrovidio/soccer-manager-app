import React, { memo } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../common/theme';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type FinishMatchModalProps = {
  controller: MatchHomeController;
};

function FinishMatchModalComponent({ controller }: FinishMatchModalProps) {
  const {
    finishComment,
    finishMatchMutation,
    finishModalVisible,
    setFinishComment,
    setFinishModalVisible,
  } = controller;

  if (!finishModalVisible) return null;

  return (
    <View style={s.modalOverlay}>
      <View style={s.modal}>
        <Text style={s.modalTitle}>Finalizar Jogo</Text>
        <Text style={s.modalSubtitle}>Voce pode adicionar uma observacao (opcional)</Text>

        <TextInput
          style={s.modalInput}
          placeholder="Observacao (max. 500 caracteres)"
          placeholderTextColor={Colors.n400}
          value={finishComment}
          onChangeText={setFinishComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={s.modalCharCount}>{finishComment.length}/500</Text>

        <View style={s.modalButtonRow}>
          <TouchableOpacity
            style={[s.modalBtn, s.modalBtnSecondary]}
            onPress={() => {
              setFinishModalVisible(false);
              setFinishComment('');
            }}
            disabled={finishMatchMutation.isPending}
          >
            <Text style={s.modalBtnTextSecondary}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.modalBtn, s.modalBtnPrimary]}
            onPress={() => finishMatchMutation.mutate()}
            disabled={finishComment.length > 500 || finishMatchMutation.isPending}
          >
            {finishMatchMutation.isPending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={s.modalBtnTextPrimary}>Finalizar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const FinishMatchModal = memo(FinishMatchModalComponent);
