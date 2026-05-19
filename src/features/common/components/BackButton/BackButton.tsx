import React, { memo, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme';
import { styles } from './styles';

interface Props {
  onPress?: () => void;
}

function BackButtonComponent({ onPress }: Props) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }

    router.back();
  }, [onPress, router]);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.backBtn}>
      <Ionicons name="arrow-back" size={22} color={Colors.n900} style={styles.icon} />
    </TouchableOpacity>
  );
}

export const BackButton = memo(BackButtonComponent);
