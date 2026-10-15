import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

const palette = ['#3F9CDA', '#21B4A0', '#9362DD', '#FFBC53', '#EE78BC'];
const sparks = Array.from({ length: 48 }, (_, index) => {
  const burst = Math.floor(index / 16);
  const angle = ((index % 16) / 16) * Math.PI * 2;
  const radius = 72 + (index % 4) * 17;
  return { index, burst, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, color: palette[index % palette.length] };
});

export function CelebrationFireworks({ onFinish }: { onFinish: () => void }) {
  const [progress] = useState(() => new Animated.Value(0));
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  useEffect(() => {
    if (reducedMotion) { onFinish(); return; }
    const animation = Animated.timing(progress, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: true });
    animation.start(({ finished }) => { if (finished) onFinish(); });
    return () => animation.stop();
  }, [onFinish, progress, reducedMotion]);
  if (reducedMotion) return null;
  const top = Math.min(height * 0.3, 260);
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.overlay}>
    {sparks.map(spark => {
      const start = 0.02 + spark.burst * 0.14;
      const end = start + 0.48;
      const range = [0, start, start + 0.06, end, 1];
      const left = width * [0.23, 0.77, 0.5][spark.burst];
      return <Animated.View key={spark.index} style={[s.spark, { left, top: top + [0, 45, -65][spark.burst], backgroundColor: spark.color,
        width: spark.index % 3 === 0 ? 6 : 4, height: spark.index % 3 === 0 ? 6 : 11,
        opacity: progress.interpolate({ inputRange: range, outputRange: [0, 0, 1, 0, 0] }),
        transform: [
          { translateX: progress.interpolate({ inputRange: [0, start, end, 1], outputRange: [0, 0, spark.x, spark.x], extrapolate: 'clamp' }) },
          { translateY: progress.interpolate({ inputRange: [0, start, start + 0.23, end, 1], outputRange: [0, 0, spark.y * 0.85, spark.y + 65, spark.y + 65], extrapolate: 'clamp' }) },
          { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', (spark.index % 2 ? 270 : -270) + 'deg'] }) },
          { scale: progress.interpolate({ inputRange: [0, start, start + 0.06, end, 1], outputRange: [0.2, 0.2, 1.1, 0.5, 0.5] }) },
        ],
      }]} />;
    })}
    {[0, 1, 2].map(burst => {
      const start = 0.02 + burst * 0.14;
      return <Animated.View key={burst} style={[s.ring, { left: width * [0.23, 0.77, 0.5][burst] - 24, top: top + [0, 45, -65][burst] - 24, borderColor: palette[burst],
        opacity: progress.interpolate({ inputRange: [0, start, start + 0.04, start + 0.25, 1], outputRange: [0, 0, 0.8, 0, 0] }),
        transform: [{ scale: progress.interpolate({ inputRange: [0, start, start + 0.25, 1], outputRange: [0.1, 0.1, 3.2, 3.2] }) }],
      }]} />;
    })}
  </View>;
}
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 100, overflow: 'hidden' },
  spark: { position: 'absolute', borderRadius: 3 },
  ring: { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 2 },
});
