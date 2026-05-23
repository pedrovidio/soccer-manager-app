import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { AthleteStats } from '../../athleteTypes';
import { ATTRS } from './profileData';
import { styles } from './styles';

type AttrItem = {
  key: string;
  label: string;
  value: number;
};

function AttributesCardComponent({ stats }: { stats?: AthleteStats }) {
  const items = useMemo<AttrItem[]>(() => {
    if (!stats) return [];
    return ATTRS.map((item) => ({
      key: item.key,
      label: item.label,
      value: (stats as any)[item.key] ?? 0,
    }));
  }, [stats]);

  const renderItem = useCallback(({ item }: { item: AttrItem }) => <AttrRow item={item} />, []);

  if (!stats) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Atributos tecnicos</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        scrollEnabled={false}
        removeClippedSubviews={false}
      />
    </View>
  );
}

function AttrRow({ item }: { item: AttrItem }) {
  const barColor = item.value >= 70 ? Colors.success : item.value >= 50 ? Colors.warning : Colors.error;
  return (
    <View style={styles.attrRow}>
      <Text style={styles.attrLabel}>{item.label}</Text>
      <View style={styles.attrBarBg}>
        <View style={[styles.attrBarFill, { width: `${Math.min(item.value, 100)}%` as any, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.attrVal}>{item.value}</Text>
    </View>
  );
}

export const AttributesCard = memo(AttributesCardComponent);
