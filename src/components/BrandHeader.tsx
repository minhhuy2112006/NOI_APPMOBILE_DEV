import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../theme/tokens';

export function BrandHeader({ title, subtitle, large = false }: { title: string; subtitle: string; large?: boolean }) {
  return <View style={[s.header, large && { minHeight: 150 }]}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.art}>
      <View style={s.wave} />
      <LinearGradient colors={['#F9C4EA', '#D98BE0', '#8370DC']} style={[s.petal, { transform: [{ rotate: '28deg' }], right: 22 }]} />
      <LinearGradient colors={['#F8DBF5', '#C095EB', '#797CDD']} style={[s.petal, { width: 48, height: 85, right: 68, top: 34, transform: [{ rotate: '-32deg' }] }]} />
      <Ionicons name="leaf" size={38} color="#A2ACEF" style={{ position: 'absolute', right: 0, top: 12 }} />
      <Ionicons name="heart" size={22} color="#F0B5E5" style={{ position: 'absolute', left: 2, top: 0 }} />
      <Ionicons name="heart" size={17} color="#D5B2EE" style={{ position: 'absolute', right: 5, bottom: 9 }} />
    </View>
    <Text accessibilityRole="header" style={[s.title, large && { fontSize: 40 }]}>{title}</Text>
    <LinearGradient colors={['#DD62B6', '#F6BEDF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.underline} />
    <Text style={s.subtitle}>{subtitle}</Text>
  </View>;
}
const s = StyleSheet.create({
  header: { paddingTop: 18, paddingBottom: 14, minHeight: 122, justifyContent: 'center', overflow: 'hidden' },
  title: { fontSize: 30, fontWeight: '800', color: theme.colors.primaryInk, maxWidth: '70%' },
  subtitle: { fontSize: 13, lineHeight: 19, color: theme.colors.muted, maxWidth: '62%' },
  underline: { width: 36, height: 5, borderRadius: 4, marginVertical: 7 },
  art: { position: 'absolute', right: 0, top: 8, width: 150, height: 126, opacity: 0.9 },
  petal: { position: 'absolute', width: 64, height: 108, borderTopLeftRadius: 60, borderTopRightRadius: 60, borderBottomLeftRadius: 8, borderBottomRightRadius: 60, borderWidth: 2, borderColor: '#FFFFFF' },
  wave: { position: 'absolute', width: 230, height: 70, borderRadius: 80, backgroundColor: '#E3D5F6', bottom: -24, right: -36, transform: [{ rotate: '-18deg' }] },
});
