import React, { memo, useState, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Arena, Radius } from '../tokens/theme';

export type SegmentOption<T> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: any;
};

function SegmentedControlComponent<T extends string | number>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);

  // We subtract 8px (3px padding on each side, 1px border on each side) to fit the segments perfectly
  const itemWidth = containerWidth > 0 ? (containerWidth - 8) / options.length : 0;
  const fontSize = options.length > 4 ? 10 : 13;

  const renderItem = useCallback(({ item }: { item: SegmentOption<T> }) => {
    const active = item.value === value;

    return (
      <TouchableOpacity
        style={[
          styles.segment,
          active ? styles.segmentActive : null,
          itemWidth > 0 ? { width: itemWidth } : { flex: 1 },
        ]}
        onPress={() => onChange(item.value)}
        activeOpacity={0.7}
      >
        <Text style={[styles.segmentText, active ? styles.segmentTextActive : null, { fontSize }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  }, [value, onChange, itemWidth, fontSize]);

  return (
    <View
      style={[styles.segmented, style]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        data={options}
        keyExtractor={(item) => String(item.value)}
        renderItem={renderItem}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    backgroundColor: Arena.cardSoft,
    borderRadius: Radius.r999,
    padding: 3,
    borderWidth: 1,
    borderColor: Arena.line,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  segment: {
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.r999,
  },
  segmentActive: {
    backgroundColor: Arena.neon,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Arena.textSubtle,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: Arena.bgDeep,
    fontWeight: '900',
  },
});

export const SegmentedControl = memo(SegmentedControlComponent) as <T extends string | number>(
  props: SegmentedControlProps<T>
) => React.ReactElement;
