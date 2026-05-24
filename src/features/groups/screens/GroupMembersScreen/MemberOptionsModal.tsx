import React, { memo, useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { GroupMember } from '../../groupTypes';
import { groupApi } from '../../services/groupApi';
import { ConfirmState } from './types';
import { styles } from './styles';

type Props = {
  member: GroupMember | null;
  groupId: string;
  currentAthleteId: string;
  onClose: () => void;
  onRefresh: () => void;
};

type OptionItem = {
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function MemberOptionsModalComponent({ member, groupId, currentAthleteId, onClose, onRefresh }: Props) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const callApi = useCallback(async (fn: () => Promise<unknown>, errorMsg: string) => {
    try {
      await fn();
      onRefresh();
      onClose();
      setConfirmState(null);
    } catch {
      Alert.alert('Erro', errorMsg);
    }
  }, [onClose, onRefresh]);

  const confirm = useCallback((title: string, msg: string, fn: () => Promise<unknown>, errMsg: string, destructive = false) => {
    setConfirmState({ title, msg, fn, errMsg, destructive });
  }, []);

  const options = useMemo<OptionItem[]>(() => {
    if (!member) return [];

    return [
      {
        label: member.isAdmin ? 'Remover admin' : 'Tornar admin',
        onPress: () => confirm(
          member.isAdmin ? 'Remover admin' : 'Tornar admin',
          member.isAdmin ? `Remover permissao de admin de ${member.name}?` : `Tornar ${member.name} admin do grupo?`,
          () => member.isAdmin
            ? groupApi.demoteAdmin(groupId, currentAthleteId, member.id)
            : groupApi.promoteAdmin(groupId, currentAthleteId, member.id),
          'Nao foi possivel alterar admin.',
        ),
      },
      {
        label: member.isInjured ? 'Marcar como apto' : 'Marcar lesionado',
        onPress: () => confirm(
          member.isInjured ? 'Marcar como apto' : 'Marcar lesionado',
          member.isInjured ? `Marcar ${member.name} como apto?` : `Marcar ${member.name} como lesionado?`,
          () => groupApi.setInjured(groupId, currentAthleteId, member.id, !member.isInjured),
          'Nao foi possivel alterar lesao.',
        ),
      },
      {
        label: member.isBlocked ? 'Reativar membro' : 'Bloquear membro',
        destructive: !member.isBlocked,
        onPress: () => confirm(
          member.isBlocked ? 'Reativar membro' : 'Bloquear membro',
          member.isBlocked ? `Reativar ${member.name}?` : `Bloquear ${member.name}?`,
          () => groupApi.setBlocked(groupId, currentAthleteId, member.id, !member.isBlocked),
          member.isBlocked ? 'Nao foi possivel ativar o membro.' : 'Nao foi possivel bloquear o membro.',
          !member.isBlocked,
        ),
      },
      {
        label: 'Excluir do grupo',
        destructive: true,
        onPress: () => confirm(
          'Excluir do grupo',
          `Remover ${member.name} do grupo permanentemente?`,
          () => groupApi.removeMember(groupId, currentAthleteId, member.id),
          'Nao foi possivel remover o membro.',
          true,
        ),
      },
    ];
  }, [confirm, currentAthleteId, groupId, member]);

  if (!member) return null;

  if (confirmState) {
    return (
      <Modal transparent animationType="fade" visible onRequestClose={() => setConfirmState(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmState(null)}>
          <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{confirmState.title}</Text>
            <Text style={styles.modalSub}>{confirmState.msg}</Text>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalOption} onPress={() => callApi(confirmState.fn, confirmState.errMsg)} activeOpacity={0.7}>
              <Text style={[styles.modalOptionText, confirmState.destructive && styles.modalOptionDestructive]}>{confirmState.title}</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalOption} onPress={() => setConfirmState(null)} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.modalTitle}>{member.name}</Text>
          <Text style={styles.modalSub}>O que deseja fazer?</Text>
          <View style={styles.modalDivider} />
          <FlatList
            data={options}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => <OptionRow item={item} />}
            scrollEnabled={false}
          />
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalOption} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function OptionRow({ item }: { item: OptionItem }) {
  return (
    <TouchableOpacity style={styles.modalOption} onPress={item.onPress} activeOpacity={0.7}>
      <Text style={[styles.modalOptionText, item.destructive && styles.modalOptionDestructive]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

export const MemberOptionsModal = memo(MemberOptionsModalComponent);
