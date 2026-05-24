import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '@ui/composites/BackButton';
import { styles } from './styles';

type Props = {
  groupName?: string;
  isAdmin: boolean;
};

function EditGroupHeaderComponent({ groupName, isAdmin }: Props) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Editar grupo</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{groupName}</Text>
      </View>
      {!isAdmin && (
        <View style={styles.readOnlyBadge}>
          <Text style={styles.readOnlyText}>Somente leitura</Text>
        </View>
      )}
    </View>
  );
}

export const EditGroupHeader = memo(EditGroupHeaderComponent);
