import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Image, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export function KissThanks() {
  const reducedMotion = useReducedMotion();
  const [glow] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) return;
    const halo = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ]));
    halo.start();
    return () => { halo.stop(); };

  }, [glow, reducedMotion]);
  return <View accessible accessibilityRole="image" accessibilityLabel="Đức Phật ngồi thiền trong hào quang vàng" style={s.art}>
    <Animated.View pointerEvents="none" style={[s.halo, { opacity: reducedMotion ? 0.85 : glow.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }), transform: [{ scale: reducedMotion ? 1 : glow.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }) }] }]}>
      {[120, 108, 94, 78].map((size, index) => <View key={size} style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: ['#FFE6A51A', '#FFDE8A24', '#FFD16B30', '#FFF1BC55'][index], borderWidth: index === 1 ? 1 : 0, borderColor: '#EFC46B77' }} />)}
      {Array.from({ length: 24 }, (_, index) => <View key={index} style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${index * 15}deg` }] }]}><View style={{ position: 'absolute', left: 59, top: index % 2 ? 8 : 2, width: 2, height: index % 2 ? 7 : 12, borderRadius: 2, backgroundColor: '#E8BC6266' }} /></View>)}
    </Animated.View>
    <Image source={require('../../../assets/branding/buddha-thanks.png')} style={{ width: 104, height: 116 }} resizeMode="contain" />

  </View>;
}
const s = StyleSheet.create({
  art: { width: 160, height: 132, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  circle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 120, height: 120, top: 6, alignItems: 'center', justifyContent: 'center' },
  face: { fontSize: 52, lineHeight: 66 },
  heart: { position: 'absolute', left: 95, top: 70 },
});
