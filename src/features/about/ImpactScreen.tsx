import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useFonts, Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { useAssistantContext } from '../assistant/Assistant';

// Design-reference figures, not verified platform totals. Replace with aggregate API data when available.
const sampleMetrics = [
  { value: '12.000+', label: 'Suất ăn được trao', description: 'Góp phần mang đến\nnhững bữa ăn ấm áp', x: 210, y: 815, width: 260 },
  { value: '8.500+', label: 'Học sinh được hỗ trợ', description: 'Tiếp thêm cơ hội học tập\nvà phát triển tương lai.', x: 465, y: 992, width: 340 },
  { value: '15.000+', label: 'Cây xanh được trồng', description: 'Góp phần xây dựng\nmôi trường sống trong lành\nvà bền vững hơn.', x: 175, y: 1150, width: 290 },
  { value: '30+', label: 'Tỉnh thành có hoạt động', description: 'Lan tỏa những giá trị tốt đẹp\nđến nhiều vùng miền.', x: 500, y: 1355, width: 310 },
];

export default function ImpactScreen() {
  const { width, fontScale } = useWindowDimensions();
  const u = Math.min(width, 520) / 853;
  const [fontsLoaded] = useFonts({ Lora_400Regular, Lora_400Regular_Italic });
  const s = styles(u, fontsLoaded);
  const largeText = fontScale > 1.05;
  useAssistantContext('Tác động cộng đồng', { page: 'Tác động cộng đồng', dataSource: 'Số liệu minh họa theo thiết kế, không phải báo cáo thực tế', metrics: sampleMetrics.map(({ value, label }) => ({ value, label })) });
  return <View style={s.screen}>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}>
      <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại Về NOI" onPress={() => router.canGoBack() ? router.back() : router.replace('/about')} style={s.back}><Ionicons name="chevron-back" size={25} color="#0D2E68" /></Pressable><Text style={s.headerTitle}>Tác động cộng đồng</Text><View style={s.back} /></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={largeText ? s.readingLayout : s.canvas}>
          {!largeText && <Image source={require('../../../assets/about/impact-editorial-background.png')} style={s.artwork} resizeMode="stretch" accessible={false} />}
          <View style={largeText ? s.readingBlock : s.hero}>
            <Text accessibilityRole="header" style={s.heroTitle}>Những{'\n'}thay đổi từ{'\n'}những <Text style={s.heroPink}>hành động nhỏ</Text></Text>
            <Text style={s.heroDescription}>Mỗi đóng góp, dù nhỏ, đều có thể tạo nên{ '\n' }những thay đổi tích cực cho cộng đồng.</Text>
          </View>
          <View style={largeText ? s.readingBlock : s.quotePanel}>
            <Text style={s.quoteMark}>“</Text><Text style={s.quote}>Những điều lớn lao{'\n'}luôn bắt đầu từ{'\n'}những hành động nhỏ.</Text>
            {!largeText && <View style={s.quoteDivider} />}
            <Text style={[s.quoteBody, largeText && { flex: 0, marginTop: 0 }]}>Cùng nhau, chúng ta đã và đang lan tỏa những giá trị tốt đẹp, tạo nên những thay đổi bền vững cho cộng đồng.</Text>
          </View>
          <View style={largeText ? s.readingBlock : s.sectionHeading}>
            <Text style={s.eyebrow}>NHỮNG GIÁ TRỊ ĐÃ TẠO RA</Text>
            <Text accessibilityRole="header" style={s.sectionTitle}>Cộng đồng hôm nay <Text style={s.italicPink}>tốt đẹp hơn</Text></Text>
          </View>
          {sampleMetrics.map(item => <View key={item.label} style={largeText ? s.readingBlock : [s.metric, { left: item.x * u, top: (item.y - 120) * u, width: item.width * u }]}>
            <Text style={s.number}>{item.value}</Text><Text style={s.metricLabel}>{item.label}</Text><Text style={s.metricDescription}>{item.description}</Text>
          </View>)}
          <View style={largeText ? s.readingBlock : s.footer}>
            <Text accessibilityRole="header" style={s.footerTitle}>Mỗi con số{'\n'}là một cuộc đời <Text style={s.italicPink}>tốt đẹp hơn.</Text></Text>
            <View style={s.underline} />
            <Text style={s.footerDescription}>Và tất cả đều bắt đầu từ những{'\n'}hành động nhỏ của cộng đồng{'\n'}cùng nhau tạo nên.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </View>;
}
const styles = (u: number, loaded: boolean) => {
  const serif = loaded ? 'Lora_400Regular' : Platform.OS === 'ios' ? 'Georgia' : 'serif';
  const italic = loaded ? 'Lora_400Regular_Italic' : serif;
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FFF8F9' },
    header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 520, alignSelf: 'center' },
    back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', color: '#0D2E68', fontSize: 29 * u, lineHeight: 37 * u, fontWeight: '700' },
    content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingBottom: 8 },
    canvas: { height: 1724 * u, overflow: 'hidden' },
    artwork: { position: 'absolute', left: 0, top: -120 * u, width: 853 * u, height: 1844 * u },
    hero: { position: 'absolute', top: 26 * u, left: 49 * u, width: 610 * u },
    heroTitle: { fontFamily: serif, color: '#0C2D67', fontSize: 58 * u, lineHeight: 65 * u, letterSpacing: -1.9 * u },
    heroPink: { fontFamily: italic, color: '#EE579D' },
    heroDescription: { marginTop: 16 * u, fontSize: 23 * u, lineHeight: 31 * u, color: '#728199' },
    quotePanel: { position: 'absolute', top: 380 * u, left: 65 * u, right: 65 * u, flexDirection: 'row', alignItems: 'flex-start' },
    quoteMark: { fontSize: 76 * u, lineHeight: 80 * u, color: '#F164AA', fontFamily: serif, width: 60 * u },
    quote: { fontFamily: italic, fontSize: 26 * u, lineHeight: 36 * u, color: '#0C2D67', width: 305 * u },
    quoteDivider: { width: 1, height: 116 * u, backgroundColor: '#F6B8D3', marginTop: 45 * u, marginHorizontal: 25 * u },
    quoteBody: { flex: 1, marginTop: 63 * u, fontSize: 20 * u, lineHeight: 27 * u, color: '#728199' },
    sectionHeading: { position: 'absolute', top: 610 * u, left: 30 * u, right: 30 * u, alignItems: 'center', gap: 8 * u },
    eyebrow: { fontSize: 16 * u, lineHeight: 22 * u, color: '#728199', letterSpacing: 1.3 * u },
    sectionTitle: { fontFamily: serif, fontSize: 34 * u, lineHeight: 44 * u, color: '#0C2D67', textAlign: 'center', letterSpacing: -1 * u },
    italicPink: { fontFamily: italic, color: '#EE579D' },
    metric: { position: 'absolute' },
    number: { fontFamily: serif, fontSize: 44 * u, lineHeight: 51 * u, color: '#0C2D67' },
    metricLabel: { fontSize: 22 * u, lineHeight: 29 * u, color: '#0C2D67' },
    metricDescription: { fontSize: 19 * u, lineHeight: 25 * u, color: '#728199', marginTop: 4 * u },
    footer: { position: 'absolute', top: 1435 * u, left: 60 * u, width: 520 * u },
    footerTitle: { fontFamily: serif, fontSize: 36 * u, lineHeight: 44 * u, color: '#0C2D67', letterSpacing: -1.2 * u },
    underline: { width: 76 * u, height: 3 * u, backgroundColor: '#EF6DAD', marginVertical: 17 * u, transform: [{ rotate: '-4deg' }] },
    footerDescription: { fontSize: 21 * u, lineHeight: 29 * u, color: '#728199' },
    disclosure: { fontSize: 10, lineHeight: 15, color: '#7E7181', textAlign: 'center', paddingHorizontal: 24, paddingTop: 5 },
    readingLayout: { padding: 20, gap: 24 },
    readingBlock: { gap: 8 },
  });
};
