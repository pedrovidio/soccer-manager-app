import React, { memo } from 'react';
import { Text, View } from 'react-native';

function OverallCardComponent({ overall }: { overall: number }) {
  return (
    <View className="mb-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
      <Text className="text-neutral-500 font-medium mb-1">Seu Overall Estimado</Text>
      <Text className="text-5xl font-black text-emerald-600">{overall}</Text>
      <Text className="text-xs text-neutral-400 mt-2 text-center">
        Varia dinamicamente conforme sua posicao, historico e atributos.
      </Text>
    </View>
  );
}

export const OverallCard = memo(OverallCardComponent);
