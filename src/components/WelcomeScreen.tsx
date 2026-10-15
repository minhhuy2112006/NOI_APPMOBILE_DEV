import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
export function WelcomeScreen({ onReady }: { onReady: () => void }) {
  return <LinearGradient colors={['#FBE8F4', '#FAFAFF', '#E7F2FF']} style={s.fill}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={s.topWave} /><View style={s.cloudLeft} /><View style={s.cloudRight} /><View style={s.bottomWave} />
      <Ionicons name="heart" size={48} color="#F6D8EF" style={{ position: 'absolute', right: -8, bottom: '27%', transform: [{ rotate: '16deg' }] }} />
      <Ionicons name="heart" size={54} color="#F9EAF6" style={{ position: 'absolute', left: -12, bottom: 64, transform: [{ rotate: '-18deg' }] }} />
    </View>
    <View style={s.brand}><Image source={require('../../assets/branding/noi-emblem.png')} onLoad={onReady} onError={onReady} resizeMode="contain" style={s.logo} accessibilityLabel="Biểu tượng NOI" /><Text style={s.title}>NOI</Text><Text style={s.tagline}>Kết nối yêu thương</Text></View>
  </LinearGradient>;
}
const s = StyleSheet.create({ fill: { flex: 1, overflow: 'hidden' }, brand: { position: 'absolute', top: '28%', width: '100%', alignItems: 'center', gap: 4 }, logo: { width: 112, height: 112 }, title: { fontSize: 42, fontWeight: '800', letterSpacing: 1, color: '#101955' }, tagline: { fontSize: 17, color: '#414A89' }, topWave: { position: 'absolute', top: '17%', left: '-20%', width: '140%', height: 160, borderRadius: 150, backgroundColor: '#FFFFFF70', transform: [{ rotate: '-17deg' }] }, cloudLeft: { position: 'absolute', bottom: -70, left: '-20%', width: '95%', height: '39%', borderTopLeftRadius: 150, borderTopRightRadius: 240, backgroundColor: '#CEDDFA', transform: [{ rotate: '-20deg' }] }, cloudRight: { position: 'absolute', right: '-30%', bottom: -45, width: '110%', height: '34%', borderTopLeftRadius: 220, backgroundColor: '#DBDFF9', transform: [{ rotate: '18deg' }] }, bottomWave: { position: 'absolute', bottom: -100, left: '-10%', width: '130%', height: 240, borderRadius: 170, backgroundColor: '#F7E5F4', transform: [{ rotate: '-15deg' }] } });
