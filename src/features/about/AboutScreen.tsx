import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandHeader } from '../../components/BrandHeader';
import { topics } from './content';
import { theme } from '../../theme/tokens';
const icons = ['shield-checkmark', 'heart', 'sparkles', 'people', 'leaf', 'shield-checkmark', 'hand-left', 'newspaper', 'checkmark-circle'] as const;
export default function AboutScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(0, Math.min(width, 620) - 24);
  return <LinearGradient colors={theme.gradients.soft} style={s.fill}><SafeAreaView edges={['top', 'left', 'right']} style={s.fill}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
    <BrandHeader title="Về NOI" subtitle="Kết nối con người vì một cộng đồng tốt đẹp hơn" large />
    <Pressable accessibilityRole="button" accessibilityLabel="Video giới thiệu NOI — đang chuẩn bị" onPress={() => Alert.alert('Video giới thiệu NOI', 'Video giới thiệu đang được chuẩn bị. Bạn có thể tìm hiểu NOI qua các mục bên dưới.')} style={[s.hero, { height: contentWidth / 1.8 }]}>
      <Image source={require('../../../assets/about-garden.webp')} accessibilityLabel="Cùng chăm sóc một mầm cây" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
      <View style={s.play}><Ionicons name="play" size={28} color={theme.buttons.primaryText} /></View>
      <LinearGradient colors={['transparent', '#17243BCA']} style={s.caption}><Text style={s.heroTitle}>Cùng nhau tạo nên{'\n'}những thay đổi tích cực</Text><Text style={s.heroCopy}>Vì một cộng đồng tốt đẹp hơn</Text></LinearGradient>
    </Pressable>
    <View style={s.grid}>{topics.map((topic, index) => <View key={topic.id} style={s.cell}><Pressable accessibilityRole="button" accessibilityLabel={topic.title} onPress={() => router.push({ pathname: '/about/[section]', params: { section: topic.id } })} style={({ pressed }) => [s.tile, pressed && s.pressed]}><View style={[s.icon, { backgroundColor: index < 3 ? '#F8E1F0' : index < 6 ? '#EDE5F8' : '#DCE8FF' }]}><Ionicons name={icons[index]} size={29} color={index < 3 ? '#B75A9F' : index < 6 ? '#8B65B8' : '#627EC0'} /></View><Text style={s.label}>{topic.title}</Text></Pressable></View>)}</View>
  </ScrollView></SafeAreaView></LinearGradient>;
}
const s = StyleSheet.create({ fill: { flex: 1 }, content: { paddingHorizontal: 12, paddingTop: -30, paddingBottom: 20, width: '100%', maxWidth: 620, alignSelf: 'center' }, hero: { width: '100%', borderRadius: 18, marginBottom: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDEAF4' }, play: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFFE8', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 }, caption: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 40, gap: 4, pointerEvents: 'none' }, heroTitle: { color: 'white', fontSize: 17, lineHeight: 22, fontWeight: '700' }, heroCopy: { color: '#FFFFFFE6', fontSize: 12, lineHeight: 18 }, grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }, cell: { width: '33.333333%', padding: 4 }, tile: { flex: 1, minHeight: 105, paddingHorizontal: 5, paddingVertical: 13, borderRadius: 16, backgroundColor: '#FFFFFFED', alignItems: 'center', justifyContent: 'center', gap: 9 }, icon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, label: { color: '#22304A', fontSize: 12, lineHeight: 17, fontWeight: '600', textAlign: 'center' }, pressed: { backgroundColor: theme.buttons.secondaryBackground } });
