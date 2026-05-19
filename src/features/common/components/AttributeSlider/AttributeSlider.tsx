import React, { memo, useCallback, useMemo, useRef } from 'react';
import { View, Text, PanResponder, LayoutChangeEvent } from 'react-native';
import { Colors } from '../../theme';
import { styles } from './styles';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

function AttributeSliderComponent({ label, value, onChange, min = 0, max = 100 }: Props) {
  const trackX = useRef(0);
  const trackWidth = useRef(0);
  const [, forceUpdate] = React.useState(0);

  const clamp = useCallback((v: number) => Math.min(max, Math.max(min, Math.round(v))), [max, min]);

  const calcValue = useCallback((pageX: number) => {
    const relative = pageX - trackX.current;
    const clamped = Math.max(0, Math.min(relative, trackWidth.current));
    return clamp(Math.round((clamped / trackWidth.current) * (max - min) + min));
  }, [clamp, max, min]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e) => {
        onChange(calcValue(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        onChange(calcValue(e.nativeEvent.pageX));
      },
    }),
    [calcValue, onChange],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    (e.target as any)?.measure?.((_x: number, _y: number, _w: number, _h: number, px: number) => {
      trackX.current = px;
      forceUpdate(n => n + 1);
    });
  }, []);

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const color = value >= 70 ? Colors.success : value >= 50 ? Colors.warning : Colors.error;
  const fillWidth = `${pct * 100}%` as any;
  const thumbOffset = trackWidth.current * pct;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
      <View style={styles.trackWrap}>
        <View style={styles.track} onLayout={onLayout} {...panResponder.panHandlers}>
          <View style={[styles.fill, { width: fillWidth, backgroundColor: color }]} />
          <View style={[styles.thumb, { transform: [{ translateX: thumbOffset - 13 }], borderColor: color }]} />
        </View>
      </View>
    </View>
  );
}

export const AttributeSlider = memo(AttributeSliderComponent);
