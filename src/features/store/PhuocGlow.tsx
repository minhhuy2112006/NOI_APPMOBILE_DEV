import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function PhuocGlow() {
  const pulse = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  useFocusEffect(useCallback(() => {
    pulse.set(0);
    if (!reducedMotion) pulse.set(withRepeat(withTiming(1, { duration: 1800 }), -1, true));
    return () => cancelAnimation(pulse);
  }, [pulse, reducedMotion]));
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 + pulse.value * 0.4, transform: [{ scale: 0.9 + pulse.value * 0.15 }] }));
  const star = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * pulse.value }, { rotate: `${-6 + pulse.value * 12}deg` }] }));
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 66, height: 72, alignItems: 'center', justifyContent: 'center' }}><View style={[s.root, { transform: [{ scale: 0.67 }] }]}>
    <Animated.View style={[s.halo, halo]}><LinearGradient colors={['#FFE894', '#F8B4DA', '#D9C6FF']} style={s.disc} /></Animated.View>
    <View style={s.ring} />
    <Animated.View style={star}><Ionicons name="star" size={58} color="#F3AF23" /><View style={s.face}><View style={s.eye} /><View style={s.eye} /></View><View style={s.smile} /></Animated.View>
    <Animated.View style={[s.spark, halo]}><Ionicons name="sparkles" size={22} color="#B16BCD" /></Animated.View>
    <View style={s.smallSpark}><Ionicons name="sparkles" size={14} color="#CC8E18" /></View>
  </View></View>;
}
const s = StyleSheet.create({
  root: { width: 98, height: 108, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 96, height: 96, borderRadius: 48 },
  disc: { flex: 1, borderRadius: 48 },
  ring: { position: 'absolute', width: 77, height: 77, borderRadius: 40, borderWidth: 2, borderColor: '#FFF8DB' },
  face: { position: 'absolute', top: 27, left: 21, flexDirection: 'row', gap: 8 },
  eye: { width: 4, height: 5, borderRadius: 3, backgroundColor: '#85502F' },
  smile: { position: 'absolute', top: 35, left: 27, width: 8, height: 5, borderBottomWidth: 2, borderColor: '#85502F', borderRadius: 5 },
  spark: { position: 'absolute', top: 5, right: 0 }, smallSpark: { position: 'absolute', bottom: 7, left: 3 },
});

