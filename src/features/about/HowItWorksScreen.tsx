import { useAboutTypography } from './aboutTypography';
import { theme as buttonTheme } from '../../theme/tokens';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBackground } from '../../components/ui';
import { useAssistantContext } from '../assistant/Assistant';

const steps = [
  { title: 'Khám phá', subtitle: 'Tìm nơi lòng tốt của bạn thuộc về', icon: 'search-outline', color: '#176DF2', background: '#E0EDFF', text: 'Bắt đầu từ điều bạn quan tâm: một bữa cơm, một trang sách hay một mầm xanh. Tìm chiến dịch phù hợp với địa điểm, thời gian và khả năng của bạn.', note: 'Đọc mục tiêu, nhu cầu và thông tin tổ chức trước khi lựa chọn.' },
  { title: 'Tham gia', subtitle: 'Chọn cách đóng góp của riêng mình', icon: 'heart-outline', color: '#C319A5', background: '#FCE3F5', text: 'Bạn có thể đăng ký tình nguyện hoặc đóng góp theo nhu cầu của chiến dịch. Không cần làm điều thật lớn; sự phù hợp và trách nhiệm mới giúp mỗi đóng góp có ý nghĩa.', note: 'Đăng ký tình nguyện cần được tổ chức xác nhận trước khi tham gia.' },
  { title: 'Kết nối', subtitle: 'Cùng nhau biến dự định thành hành động', icon: 'people-outline', color: '#902ACD', background: '#ECE2FF', text: 'Khi được xác nhận, theo dõi lịch trình, chuẩn bị theo hướng dẫn và xem công việc được giao. Trưởng nhóm và Ban tổ chức là những người đồng hành cùng bạn trong hoạt động.', note: 'Có thay đổi hoặc cần hỗ trợ? Hãy trao đổi trực tiếp với người phụ trách.' },
  { title: 'Lan tỏa', subtitle: 'Để một việc tốt mở ra nhiều việc tốt', icon: 'paper-plane-outline', color: '#366BE7', background: '#E3EAFE', text: 'Theo dõi kết quả, chia sẻ trải nghiệm và mời người khác cùng tham gia. Những câu chuyện chân thật có thể giúp cộng đồng tìm thấy thêm những người sẵn sàng góp sức.', note: 'Chia sẻ thông tin chính xác và xin phép trước khi đăng hình ảnh của người khác.' },
] as const;

export default function HowItWorksScreen() {
  const typography = useAboutTypography();
  const { width } = useWindowDimensions();
  const u = Math.min(width, 520) / 853;
  const s = styles(u);
  useAssistantContext('Cách hoạt động', { page: 'Cách hoạt động', steps: steps.map(({ title, text, note }) => ({ title, text, note })) });
  return (
    <LinearGradient colors={['#FFF4FB', '#FCF7FF', '#EEF5FF', '#FFF0FA']} style={s.fill}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top', 'left', 'right']} style={s.fill}>
        <View style={s.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Quay lại Về NOI" style={s.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/about')}><Ionicons name="chevron-back" size={24} color="#10376E" /></Pressable>
          <Text style={[s.headerTitle, typography.header]}>Cách hoạt động</Text><View style={s.back} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <View style={s.hero}>
            
            <View style={s.heroRow}>
              <Text accessibilityRole="header" style={[s.heroTitle, typography.hero]}>Bắt đầu từ{ '\n' }<Text style={[s.pink, typography.accent]}>một điều tốt.</Text></Text>
              <Image source={require('../../../assets/about/join/join-volunteer.png')} style={{ width: 90, height: 100, borderRadius: 28 }} resizeMode="cover" accessibilityLabel="Những bàn tay cùng tham gia hoạt động" />
            </View>
            <View style={s.accentLine} />
            <Text style={s.eyebrow}>BỐN BƯỚC CÙNG NOI</Text>
            <Text style={s.body}>Tìm điều bạn quan tâm, chọn cách góp sức và đồng hành cùng cộng đồng.</Text>
          </View>
          <View style={s.sections}>
            <View style={s.timeline}>
              {steps.map((step, index) => (
                <View key={step.title} style={s.stepRow}>
                  <View style={s.rail}>
                    <View style={[s.numberBadge, { backgroundColor: step.background }]}><Text style={[s.number, { color: step.color }]}>{index + 1}</Text></View>
                    {index < steps.length - 1 && <View style={s.connector} />}
                  </View>
                  <LinearGradient colors={['#FFFFFFF5', '#FFFFFFD9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
                    <View style={s.cardHeading}><Text accessibilityRole="header" style={[s.title, s.grow, { color: step.color }]}>{step.title}</Text><View style={[s.iconBadge, { backgroundColor: step.background }]}><Ionicons name={step.icon} size={19} color={step.color} /></View></View>
                    <Text style={[s.subtitle, { color: step.color }]}>{step.subtitle}</Text>
                    <Text style={s.body}>{step.text}</Text>
                    <View style={[s.note, { backgroundColor: step.background }]}><Text style={s.noteText}>{step.note}</Text></View>
                  </LinearGradient>
                </View>
              ))}
            </View>
            <View style={s.support}>
              <View style={s.supportImageFrame}><Image source={require('../../../assets/about/mission/mission-hands.png')} resizeMode="cover" style={s.supportImage} accessibilityLabel="Những bàn tay cùng chung sức" /></View>
              <View style={s.supportCopy}>
              <Text accessibilityRole="header" style={s.title}>Luôn có người đồng hành</Text>
              <Text style={s.body}>NOI giúp bạn tìm hoạt động phù hợp. Ban tổ chức và trưởng nhóm hướng dẫn, giải đáp và hỗ trợ bạn trong suốt hành trình.</Text>
              </View>
            </View>
            <View style={s.finish}>
              <Text style={s.quote}>Sẵn sàng cho bước đầu tiên?</Text>
              <Pressable accessibilityRole="button" onPress={() => router.navigate('/')} style={[s.cta, { overflow: 'hidden', borderColor: 'transparent' }]}>{({ pressed }) => <><ActionBackground pressed={pressed} radius={16} /><Text style={[s.ctaText, { color: buttonTheme.buttons.primaryText }]}>Khám phá chiến dịch</Text><Ionicons name="arrow-forward" size={18} color={buttonTheme.buttons.primaryText} /></>}</Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
const styles = (u: number) => StyleSheet.create({
  fill: { flex: 1 },
  header: { minHeight: 44, width: '100%', maxWidth: 520, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 36 * u, fontWeight: '700', color: '#10376E' },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingBottom: 20 },
  hero: { marginHorizontal: 35 * u, marginTop: 6, marginBottom: 12, padding: 10, gap: 8, backgroundColor: '#FFFFFF40', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF' },
  accentLine: { width: 52, height: 3, borderRadius: 2, backgroundColor: '#F593E3' },
  grow: { flex: 1 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBadge: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  supportImageFrame: { height: 90, width: '100%', overflow: 'hidden' },
  supportImage: { width: '100%', height: 90 },
  supportCopy: { paddingHorizontal: 10, paddingVertical: 9, gap: 6 },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: '700', color: '#7584A0', letterSpacing: 1.3 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTitle: { flex: 1, minWidth: 0, fontSize: 50 * u, lineHeight: 59 * u, color: '#0F376F', fontWeight: '800' },
  pink: { color: '#E943A5' },
  blue: { color: '#176DF2' },
  artFrame: { width: 76, height: 76, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  communityMark: { width: 66, height: 66, borderRadius: 22, borderWidth: 1, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  body: { fontSize: 28 * u, lineHeight: 40 * u, color: '#48658C' , textAlign: 'justify'},
  sections: { paddingHorizontal: 35 * u, gap: 10 },
  timeline: { gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'stretch', gap: 5 },
  rail: { width: 24, alignItems: 'center' },
  numberBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 14, fontWeight: '700' },
  connector: { flex: 1, width: 1, backgroundColor: '#C9C0EF', marginVertical: 6 },
  card: { flex: 1, minWidth: 0, paddingHorizontal: 10, paddingTop: 5, paddingBottom: 10, marginBottom: 9, gap: 6, borderRadius: 18, backgroundColor: '#FFFFFFE8', borderWidth: 1, borderColor: '#FFFFFF', overflow: 'hidden' },
  title: { fontSize: 36 * u, lineHeight: 43 * u, fontWeight: '700', color: '#10376E' },
  subtitle: { fontSize: 28 * u, lineHeight: 38 * u, fontWeight: '600' },
  note: { padding: 10, borderRadius: 10, marginTop: 2 },
  noteText: { fontSize: 28 * u, lineHeight: 40 * u, color: '#536B8C' },
  support: { borderRadius: 22, backgroundColor: '#FFFFFFBF', overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF' },
  finish: { gap: 8, padding: 10, borderRadius: 22, backgroundColor: '#FBE2F780' },
  quote: { fontSize: 14, lineHeight: 21, textAlign: 'center', color: '#48658C' },
  cta: { minHeight: 48, padding: 14, borderRadius: 16, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#353959', flexShrink: 1 },
});

