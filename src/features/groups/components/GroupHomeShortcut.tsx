import React, { memo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../common/theme';

function GroupHomeShortcutComponent() {
  const router = useRouter();

  const goHome = useCallback(() => {
    router.replace('/');
  }, [router]);

  return (
    <TouchableOpacity
      accessibilityLabel="Ir para a home"
      accessibilityRole="button"
      activeOpacity={0.75}
      onPress={goHome}
      style={styles.button}
    >
      <Ionicons name="home-outline" size={19} color={Colors.n700} />
    </TouchableOpacity>
  );
}

export const GroupHomeShortcut = memo(GroupHomeShortcutComponent);

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.n100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
