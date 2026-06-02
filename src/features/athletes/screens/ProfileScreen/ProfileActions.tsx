import React, { memo } from 'react';
import { Text, TouchableOpacity, View, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena, Colors, useThemeStore } from '@ui/tokens/theme';
import { styles } from './styles';

function ProfileActionsComponent({ onGroups, onLogout }: { onGroups: () => void; onLogout: () => void }) {
  const { theme, setTheme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.actionRow} onPress={onGroups}>
        <Ionicons name="people-outline" size={20} color={Arena.neon} />
        <Text style={styles.actionLabel}>Meus grupos</Text>
        <Ionicons name="chevron-forward" size={16} color={Arena.textSubtle} />
      </TouchableOpacity>
      
      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <Ionicons name={isLight ? "sunny-outline" : "moon-outline"} size={20} color={Arena.neon} />
        <Text style={styles.actionLabel}>{isLight ? 'Tema Claro' : 'Tema Escuro'}</Text>
        <Switch
          value={isLight}
          onValueChange={(val) => setTheme(val ? 'light' : 'dark')}
          trackColor={{ false: Arena.line, true: Arena.neon }}
          thumbColor={Arena.text}
        />
      </View>

      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.actionRow} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={[styles.actionLabel, styles.actionLabelDanger]}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

export const ProfileActions = memo(ProfileActionsComponent);
