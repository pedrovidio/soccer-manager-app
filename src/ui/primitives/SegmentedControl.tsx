import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
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
  const isFirstLayout = useRef(true);
  const translateX = useRef(new Animated.Value(0)).current;

  // We subtract 8px (3px padding on each side, 1px border on each side) to fit the segments perfectly
  const itemWidth = containerWidth > 0 ? (containerWidth - 8) / options.length : 0;
  const fontSize = options.length > 4 ? 10 : 13;

  const activeIndex = options.findIndex((item) => item.value === value);

  useEffect(() => {
    if (containerWidth > 0 && activeIndex !== -1 && itemWidth > 0) {
      const targetX = activeIndex * itemWidth;

      if (isFirstLayout.current) {
        translateX.setValue(targetX);
        isFirstLayout.current = false;
      } else {
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [activeIndex, itemWidth, containerWidth, translateX]);

  const renderItem = useCallback(({ item }: { item: SegmentOption<T> }) => {
    const active = item.value === value;

    return (
      <TouchableOpacity
        style={[
          styles.segment,
          containerWidth === 0 && active ? styles.segmentActive : null,
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
  }, [value, onChange, itemWidth, fontSize, containerWidth]);

  return (
    <View
      style={[styles.segmented, style]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.animatedBackground,
            {
              width: itemWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
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
  animatedBackground: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    backgroundColor: Arena.neon,
    borderRadius: Radius.r999,
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
