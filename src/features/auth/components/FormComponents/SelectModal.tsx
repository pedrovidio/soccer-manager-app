import React, { memo, useCallback } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

type SelectModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  value: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

function SelectModalComponent({ visible, title, options, value, onClose, onSelect }: SelectModalProps) {
  const renderItem = useCallback(({ item }: { item: string }) => {
    const active = value === item;

    return (
      <TouchableOpacity
        style={[styles.modalItem, active ? styles.modalItemActive : null]}
        onPress={() => onSelect(item)}
      >
        <Text style={[styles.modalItemText, active ? styles.modalItemTextActive : null]}>{item}</Text>
        {active && <Text style={styles.primaryText}>✓</Text>}
      </TouchableOpacity>
    );
  }, [onSelect, value]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>×</Text>
          </TouchableOpacity>
        </View>
        <FlatList data={options} keyExtractor={(item) => item} renderItem={renderItem} />
      </View>
    </Modal>
  );
}

export const SelectModal = memo(SelectModalComponent);
