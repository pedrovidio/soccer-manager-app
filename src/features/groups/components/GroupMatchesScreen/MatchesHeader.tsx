import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { BackButton } from '../../../common/components/BackButton';
import { styles } from './styles';

type Props = {
  groupName: string;
  isAdmin: boolean;
  onCreateMatch: () => void;
};

function MatchesHeaderComponent({ groupName, isAdmin, onCreateMatch }: Props) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerBody}>
        <Text style={styles.headerTitle}>Jogos</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{groupName}</Text>
      </View>
      {isAdmin && (
        <TouchableOpacity style={styles.iconBtn} onPress={onCreateMatch}>
          <Ionicons name="add" size={22} color={Colors.n700} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export const MatchesHeader = memo(MatchesHeaderComponent);
