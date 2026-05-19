import { useMemo, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

export function useSwipeToDelete(onDelete: () => void) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panHandlers = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderMove: (_, gesture) => {
      translateX.setValue(gesture.dx);
    },
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) > 120) {
        Animated.timing(translateX, {
          toValue: gesture.dx > 0 ? 500 : -500,
          duration: 200,
          useNativeDriver: true,
        }).start(onDelete);
        return;
      }

      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    },
  }), [onDelete, translateX]);

  return {
    translateX,
    panHandlers: panHandlers.panHandlers,
  };
}
