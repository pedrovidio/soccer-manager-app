import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../theme';

interface Props {
  onPress?: () => void;
}

export function BackButton({ onPress }: Props) {
  const router = useRouter();

  function handlePress() {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  }

  return (
    <TouchableOpacity onPress={handlePress} style={s.backBtn}>
      <Ionicons name="arrow-back" size={22} color={Colors.n900} style={s.icon} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.n100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // Ajuste fino para garantir que o ícone fique perfeitamente centralizado no Android/iOS
    marginLeft: -1,
  }
});
