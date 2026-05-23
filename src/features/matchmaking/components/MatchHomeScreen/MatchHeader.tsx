import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { BackButton } from '../../../../ui/composites/BackButton';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type MatchHeaderProps = {
  controller: MatchHomeController;
};

function MatchHeaderComponent({ controller }: MatchHeaderProps) {
  const { data, goToEdit, isAdmin, summary } = controller;
  if (!data || !summary) return null;

  const isFinished = data.status === 'FINISHED';

  return (
    <View style={s.header}>
      <BackButton />
      <View style={s.rowContent}>
        <Text style={s.headerTitle} numberOfLines={1}>{isFinished ? 'Partida encerrada' : 'Proxima partida'}</Text>
        <Text style={s.headerSub}>{data.location} - {summary.date}</Text>
      </View>
      {isAdmin && !isFinished && (
        <TouchableOpacity style={s.editBtn} onPress={goToEdit}>
          <Ionicons name="create-outline" size={20} color={Colors.n700} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export const MatchHeader = memo(MatchHeaderComponent);
