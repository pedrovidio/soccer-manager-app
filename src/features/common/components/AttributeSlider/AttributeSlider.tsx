import React, { useRef, useCallback } from 'react';
import { View, Text, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Colors, Radius } from '../../theme';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function AttributeSlider({ label, value, onChange, min = 0, max = 100 }: Props) {
  const trackX = useRef(0);
  const trackWidth = useRef(0);
  const [, forceUpdate] = React.useState(0);

  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)));

  const calcValue = (pageX: number) => {
    const relative = pageX - trackX.current;
    const clamped = Math.max(0, Math.min(relative, trackWidth.current));
    return clamp(Math.round((clamped / trackWidth.current) * (max - min) + min));
  };

  const panResponder = useRef(
    PanResponder.create({
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
    })
  ).current;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    (e.target as any)?.measure?.((_x: number, _y: number, _w: number, _h: number, px: number) => {
      trackX.current = px;
      forceUpdate(n => n + 1);
    });
  }, []);

  const pct = (value - min) / (max - min);
  const color = value >= 70 ? Colors.success : value >= 50 ? Colors.warning : Colors.error;
  const fillWidth = `${pct * 100}%` as any;
  const thumbOffset = trackWidth.current * pct;

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.label}>{label}</Text>
        <Text style={[s.value, { color }]}>{value}</Text>
      </View>
      <View style={s.trackWrap}>
        <View style={s.track} onLayout={onLayout} {...panResponder.panHandlers}>
          <View style={[s.fill, { width: fillWidth, backgroundColor: color }]} />
          <View style={[s.thumb, { transform: [{ translateX: thumbOffset - 13 }], borderColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:     { marginBottom: 20 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label:    { fontSize: 13, fontWeight: '600', color: Colors.n700 },
  value:    { fontSize: 16, fontWeight: '800' },
  trackWrap:{ paddingVertical: 10 },
  track: {
    height: 8,
    backgroundColor: Colors.n200,
    borderRadius: Radius.r999,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: Radius.r999,
  },
  thumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    borderWidth: 3,
    left: 0,
    top: -9,
    elevation: 5,
  },
});
