import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '@ui/composites/BackButton';
import { styles } from './styles';

type CreateMatchHeaderProps = {
  isEditing: boolean;
};

function CreateMatchHeaderComponent({ isEditing }: CreateMatchHeaderProps) {
  return (
    <View style={styles.header}>
      <BackButton />
      <Text style={styles.headerTitle}>{isEditing ? 'Editar partida' : 'Marcar partida'}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export const CreateMatchHeader = memo(CreateMatchHeaderComponent);
