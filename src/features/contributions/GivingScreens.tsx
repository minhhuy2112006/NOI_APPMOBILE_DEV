import { useFonts, Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { ActionBackground } from '../../components/ui';
import { CelebrationFireworks } from '../../components/CelebrationFireworks';

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
const pink = '#DF438D';
const navy = '#142955';

function useGivingStyles() {
  const [loaded] = useFonts({ Lora_400Regular, Lora_400Regular_Italic });
  const family = loaded ? 'Lora_400Regular' : Platform.OS === 'ios' ? 'Georgia' : 'serif';
  const regular = { fontFamily: family, fontWeight: '400' as const };
  return {
    ...s,
    title: { ...s.title, ...regular },
    heading: { ...s.heading, ...regular },
    headerText: { ...s.headerText, ...regular },
    entryTitle: { ...s.entryTitle, ...regular },
    body: { ...s.body, ...regular },
    centerBody: { ...s.centerBody, ...regular },
    small: { ...s.small, ...regular },
    label: { ...s.label, ...regular },
    input: { ...s.input, ...regular },
    searchInput: { ...s.searchInput, ...regular },
    amountText: { ...s.amountText, ...regular },
    compactButtonText: { ...s.compactButtonText, ...regular },
    purposeTitle: { ...s.purposeTitle, ...regular },
    purposeCopy: { ...s.purposeCopy, ...regular },
    accent: { color: pink, fontFamily: loaded ? 'Lora_400Regular_Italic' : family, fontWeight: '400' as const },
  };
}

function Frame({ title, children, onBack }: PropsWithChildren<{ title: string; onBack?: () => void }>) {
  const s = useGivingStyles();
  return <LinearGradient colors={['#FFF3F9', '#F6F4FF', '#EAF5FF']} style={s.fill}>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={s.fill}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={onBack ?? (() => router.canGoBack() ? router.back() : router.replace('/contributions'))} style={s.back}>
          <Ionicons name="chevron-back" size={25} color={navy} />
        </Pressable>
        <Text accessibilityRole="header" style={s.headerText}>{title}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>{children}</ScrollView>
    </SafeAreaView>
  </LinearGradient>;
}

function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  const s = useGivingStyles();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={s.compactButton}>
    {({ pressed }) => <><ActionBackground radius={14} pressed={pressed} disabled={disabled} /><Text style={s.compactButtonText}>{title}</Text></>}
  </Pressable>;
}

function Card({ children }: PropsWithChildren) {
  return <View style={s.card}>{children}</View>;
}

/** Native shapes keep the pig crisp at any display density; coins use the native animation driver. */
function PiggyBank({ animate = false }: { animate?: boolean }) {
  const [progress] = useState(() => new Animated.Value(0));
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!animate || reduced) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.delay(400),
      Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]), { iterations: 3 });
    animation.start();
    return () => animation.stop();
  }, [animate, progress, reduced]);
  return <View accessible accessibilityRole="image" accessibilityLabel="Heo tiết kiệm hồng nhận đồng xu yêu thương" style={s.pigArt}>
    <View style={s.pigGlow} />
    <View style={s.pigEar} />
    <View style={[s.pigFoot, { left: 67 }]} /><View style={[s.pigFoot, { left: 146 }]} />
    <LinearGradient colors={['#FFD4E8', '#F28CB7']} style={s.pigBody}>
      <View style={s.slot} /><View style={s.eye} />
      <View style={s.snout}><View style={s.nostril} /><View style={s.nostril} /></View>
      <Ionicons name="heart" size={28} color="#FFF4FA" style={{ position: 'absolute', left: 35, top: 48 }} />
    </LinearGradient>
    <Animated.View style={[s.coin, { opacity: progress.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }), transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 75] }) },
      { rotateY: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
    ] }]}><Text style={{ color: '#AE7415', fontSize: 19, fontWeight: '800' }}>N</Text></Animated.View>
  </View>;
}

export function CompanionScreen() {
  const s = useGivingStyles();
  const [amount, setAmount] = useState('50000');
  const [preview, setPreview] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  const endFireworks = useCallback(() => setFireworks(false), []);
  const value = Number(amount);
  const valid = /^\d+$/.test(amount) && Number.isSafeInteger(value) && value >= 10000 && value <= 100000000;

  if (preview) return <Frame key="thanks" title="Lời cảm ơn" onBack={() => setPreview(false)}>
    <View style={s.hero}>
      <Text style={s.eyebrow}>CÙNG NOI LAN TỎA ĐIỀU TỐT</Text>
      <PiggyBank animate />

      <Text style={[s.title, { textAlign: 'center' }]}>Một chút yêu thương.{ '\n' }<Text style={s.accent}>Thêm nhiều kết nối.</Text></Text>
      <Text style={s.centerBody}>Cảm ơn bạn đã chọn đồng hành cùng NOI.</Text>
    </View>
    <Card><View style={s.row}><Text style={[s.body, s.flex]}>Mức ủng hộ đang chọn</Text><Text style={[s.heading, { color: pink }]}>{money(value)}</Text></View></Card>
    <Button title="Quay lại chọn mức ủng hộ" onPress={() => setPreview(false)} />
    {fireworks && <CelebrationFireworks onFinish={endFireworks} />}
  </Frame>;
  return <Frame key="companion" title="Thùng đồng hành NOI">
    <LinearGradient colors={['#FFE5F0', '#E8EEFF']} style={s.fundHero}>
      <Text style={s.eyebrow}>GÓP NHỎ • ĐỒNG HÀNH DÀI LÂU</Text>
      <Text style={[s.title, { textAlign: 'center' }]}>Nuôi dưỡng những{ '\n' }<Text style={s.accent}>kết nối tốt đẹp.</Text></Text>
      <PiggyBank />
      <Text style={s.centerBody}>Cùng NOI duy trì máy chủ và chăm sóc ứng dụng mỗi ngày.</Text>
    </LinearGradient>
    <View style={s.fundPanel}>
      <View style={s.row}><Text style={[s.heading, s.flex]}>Bạn muốn góp bao nhiêu?</Text><Ionicons name="heart-outline" size={23} color={pink} /></View>
      <View style={s.amounts}>{[20000, 50000, 100000, 200000].map(n => <Pressable key={n} accessibilityRole="button" accessibilityState={{ selected: value === n }} onPress={() => setAmount(String(n))} style={[s.amount, value === n && s.selected]}><Text style={[s.amountText, value === n && { color: pink }]}>{money(n)}</Text></Pressable>)}</View>
      <View style={s.search}><TextInput accessibilityLabel="Số tiền ủng hộ" keyboardType="number-pad" value={amount} onChangeText={setAmount} maxLength={10} style={s.searchInput} placeholder="Số tiền khác" /><Text style={s.small}>VNĐ</Text></View>
      {!valid && <Text accessibilityRole="alert" style={s.error}>Nhập từ 10.000đ đến 100.000.000đ.</Text>}
      <Button title="Xem trước lời cảm ơn" disabled={!valid} onPress={() => { setPreview(true); setFireworks(true); }} />
      
    </View>
    <Text style={s.heading}>Mỗi đồng đều có một ý nghĩa</Text>
    <View style={s.purposeGrid}>
      {([
        ['cloud-outline', 'Máy chủ', 'Duy trì kết nối'],
        ['construct-outline', 'Bảo trì', 'Cải thiện ứng dụng'],
        ['people-outline', 'Cộng đồng', 'Hỗ trợ người dùng'],
      ] as const).map(([icon, title, subtitle]) => <View key={title} style={s.purpose}><Ionicons name={icon} size={24} color={pink} /><Text style={s.purposeTitle}>{title}</Text><Text style={s.purposeCopy}>{subtitle}</Text></View>)}
    </View>
    <View style={s.note}><Ionicons name="receipt-outline" size={22} color={pink} /><View style={s.flex}><Text style={s.entryTitle}>Rõ ràng để cùng đi xa</Text><Text style={s.small}>Khoản ủng hộ vận hành được tách riêng khỏi quyên góp cho các hoàn cảnh.</Text></View></View>
  </Frame>;
}


export function EmergencyMedicalScreen() {
  const s = useGivingStyles();
  const [filter, setFilter] = useState('Cần hỗ trợ');
  const [search, setSearch] = useState('');
  const [showProcess, setShowProcess] = useState(false);
  return <Frame title="Y tế khẩn cấp">
    <View style={s.medicalIntro}>
      <View style={s.flex}><Text style={s.medicalEyebrow}>CÙNG TRAO CƠ HỘI CHỮA LÀNH</Text><Text style={s.title}>Kịp thời sẻ chia.{ '\n' }<Text style={s.accent}>Nối dài hy vọng.</Text></Text></View>
      <View style={s.medicalBadge}><Ionicons name="medkit-outline" size={30} color="#427CB1" /></View>
    </View>
    <Text style={s.body}>Hỗ trợ người bệnh khó khăn qua hồ sơ điều trị được đối chiếu với bệnh viện.</Text>
    <View style={s.search}><Ionicons name="search-outline" size={20} color="#7185A3" /><TextInput accessibilityLabel="Tìm hồ sơ y tế" value={search} onChangeText={setSearch} placeholder="Mã hồ sơ hoặc bệnh viện…" style={s.searchInput} /></View>
    <ScrollView horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{['Cần hỗ trợ', 'Đủ kinh phí', 'Đã giải ngân'].map(label => <Pressable accessibilityRole="button" accessibilityState={{ selected: filter === label }} key={label} onPress={() => setFilter(label)} style={[s.amount, filter === label && s.selected]}><Text style={s.amountText}>{label}</Text></Pressable>)}</ScrollView>
    <View style={s.row}><Text style={[s.heading, s.flex]}>Hồ sơ hỗ trợ</Text><Text style={s.small}>0 hồ sơ</Text></View>
    <Card>
      <View style={s.emptyArt}><Ionicons name="folder-open-outline" size={32} color="#839BC0" /></View>
      <Text style={[s.entryTitle, { textAlign: 'center' }]}>{search.trim() ? 'Chưa tìm thấy hồ sơ phù hợp' : filter === 'Cần hỗ trợ' ? 'Chưa có hồ sơ được xác minh' : filter === 'Đủ kinh phí' ? 'Chưa có hồ sơ đủ kinh phí' : 'Chưa có hồ sơ đã giải ngân'}</Text>
      <Text style={s.centerBody}>Hồ sơ sẽ hiển thị sau khi minh chứng và xác nhận bệnh viện được kiểm tra.</Text>
    </Card>
    <LinearGradient colors={['#E5F0FF', '#F6E8F5']} style={s.requestBanner}>
      <View style={s.row}><View style={s.round}><Ionicons name="document-text-outline" size={23} color="#527DAA" /></View><View style={s.flex}><Text style={s.entryTitle}>Cần hỗ trợ cho người thân?</Text><Text style={s.small}>Chuẩn bị thông tin và minh chứng.</Text></View></View>
      <Button title="Chuẩn bị hồ sơ" onPress={() => router.push('/contributions/medical-request')} />
    </LinearGradient>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: showProcess }} onPress={() => setShowProcess(v => !v)} style={s.processToggle}><Ionicons name="shield-checkmark-outline" size={22} color="#547BA3" /><Text style={[s.entryTitle, s.flex]}>Hồ sơ được xác minh thế nào?</Text><Ionicons name={showProcess ? 'chevron-up' : 'chevron-down'} size={18} color="#547BA3" /></Pressable>
    {showProcess && <Card>
      {['Tiếp nhận minh chứng điều trị', 'Đối chiếu xác nhận bệnh viện', 'Công khai nhu cầu đã xác minh', 'Cập nhật giải ngân và chứng từ'].map((label, index) => <View key={label} style={s.row}><View style={s.step}><Text style={s.stepText}>{index + 1}</Text></View><Text style={[s.body, s.flex]}>{label}</Text></View>)}
      <Text style={s.small}>Thời gian xử lý phụ thuộc việc xác minh và phối hợp với bệnh viện; không tự động giải ngân chỉ từ thao tác gửi hồ sơ.</Text>
    </Card>}
    
  </Frame>;
}

export function MedicalRequestScreen() {
  const s = useGivingStyles();
  const [form, setForm] = useState({ contact: '', phone: '', relationship: '', hospital: '', cost: '', summary: '' });
  const [checked, setChecked] = useState<string[]>([]);
  const [review, setReview] = useState(false);
  const fields = [
    ['contact', 'Họ tên người liên hệ', 'Người bệnh hoặc người đại diện'],
    ['phone', 'Số điện thoại liên hệ', 'Số điện thoại tại Việt Nam'],
    ['relationship', 'Quan hệ với người bệnh', 'Bản thân, cha/mẹ, người thân…'],
    ['hospital', 'Bệnh viện đang điều trị', 'Nhập tên bệnh viện'],
    ['cost', 'Chi phí cần hỗ trợ (VNĐ)', 'Theo dự toán từ bệnh viện'],
    ['summary', 'Nội dung cần hỗ trợ', 'Mô tả ngắn gọn nhu cầu hỗ trợ'],
  ] as const;
  const valid = form.contact.trim().length > 1 && /^(0\d{9}|\+84\d{9})$/.test(form.phone.replace(/\s/g, '')) && form.hospital.trim().length > 2 && form.relationship.trim().length > 0 && /^\d+$/.test(form.cost) && Number(form.cost) > 0 && form.summary.trim().length >= 10;
  return <Frame title="Chuẩn bị hồ sơ">
    <Text style={s.title}>Bắt đầu từ{'\n'}<Text style={s.accent}>thông tin rõ ràng.</Text></Text>
    <Text style={s.body}>Chuẩn bị thông tin liên hệ, chi phí điều trị và các minh chứng cần thiết.</Text>
    <Card>
      {fields.map(([key, label, placeholder]) => <View key={key} style={{ gap: 7 }}>
        <Text style={s.label}>{label}</Text>
        <TextInput accessibilityLabel={label} placeholder={placeholder} placeholderTextColor="#8A97AA" value={form[key]} onChangeText={text => { setReview(false); setForm(previous => ({ ...previous, [key]: text })); }} keyboardType={key === 'phone' ? 'phone-pad' : key === 'cost' ? 'number-pad' : 'default'} multiline={key === 'summary'} maxLength={key === 'summary' ? 500 : key === 'cost' ? 12 : 100} style={[s.input, key === 'summary' && { minHeight: 96, textAlignVertical: 'top' }]} />
      </View>)}
    </Card>
    <Card>
      <Text style={s.heading}>Minh chứng cần chuẩn bị</Text>
      <Text style={s.small}>Đánh dấu các tài liệu bạn đã chuẩn bị.</Text>
      {['Chỉ định điều trị / phẫu thuật', 'Dự toán chi phí từ bệnh viện', 'Đầu mối xác nhận tại bệnh viện', 'Sự đồng ý của người bệnh / đại diện'].map(label => <Pressable key={label} accessibilityRole="checkbox" accessibilityState={{ checked: checked.includes(label) }} onPress={() => setChecked(previous => previous.includes(label) ? previous.filter(item => item !== label) : [...previous, label])} style={s.row}><Ionicons name={checked.includes(label) ? 'checkbox' : 'square-outline'} color={pink} size={24} /><Text style={[s.body, s.flex]}>{label}</Text></Pressable>)}
      
    </Card>
    <Button title="Kiểm tra thông tin" onPress={() => setReview(true)} />
    {review && <Card><Text accessibilityRole="alert" style={[s.entryTitle, { color: valid ? '#287C65' : '#B24160' }]}>{valid ? 'Thông tin cơ bản đã đầy đủ' : 'Vui lòng kiểm tra lại thông tin'}</Text><Text style={s.body}>{valid ? `Đã chuẩn bị ${checked.length}/4 loại minh chứng. Bạn có thể rà soát lại thông tin trước khi gửi.` : 'Cần đủ tên, số điện thoại hợp lệ, quan hệ, bệnh viện, chi phí bằng số và mô tả ít nhất 10 ký tự.'}</Text></Card>}
  </Frame>;
}

const s = StyleSheet.create({
  compactButton: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  compactButtonText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center' },
  fundHero: { padding: 16, paddingBottom: 24, gap: 8, borderRadius: 26 },
  fundPanel: { marginTop: -24, marginHorizontal: 4, borderRadius: 22, padding: 16, gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F5E4F0' },
  purposeGrid: { flexDirection: 'row', gap: 8 },
  purpose: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 5, gap: 7, backgroundColor: '#FFFFFFBB', borderRadius: 18 },
  purposeTitle: { fontSize: 13, fontWeight: '700', color: navy, textAlign: 'center' },
  purposeCopy: { fontSize: 11, lineHeight: 16, color: '#697C97', textAlign: 'center' },
  medicalIntro: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  medicalEyebrow: { color: '#6B86A8', fontSize: 9, fontWeight: '700', letterSpacing: 0.4, marginBottom: 9 },
  medicalBadge: { width: 50, height: 62, borderRadius: 20, backgroundColor: '#E4F0FF', alignItems: 'center', justifyContent: 'center' },
  requestBanner: { padding: 16, borderRadius: 22, gap: 14 },
  processToggle: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  fill: { flex: 1 }, flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, gap: 8 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF88' },
  headerText: { flex: 1, fontSize: 19, fontWeight: '700', textAlign: 'center', color: navy },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 4 },
  eyebrow: { color: '#8E6190', fontSize: 11, fontWeight: '700', letterSpacing: 1.3, textAlign: 'center' },
  title: { color: navy, fontSize: 26, lineHeight: 34, fontWeight: '800' },
  heading: { color: navy, fontSize: 20, lineHeight: 27, fontWeight: '700' },
  body: { color: '#607392', fontSize: 15, lineHeight: 23 },
  centerBody: { color: '#607392', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  small: { color: '#697C97', fontSize: 13, lineHeight: 20 },
  card: { backgroundColor: '#FFFFFFD9', borderRadius: 24, borderWidth: 1, borderColor: '#FFFFFF', padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F7' },
  entry: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 21, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: '#FFFFFFC9' },
  entryIcon: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  entryTitle: { fontSize: 16, lineHeight: 23, fontWeight: '700', color: navy },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amount: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3E5F3' },
  amountText: { fontSize: 14, color: navy, fontWeight: '600' },
  selected: { borderColor: '#EC93C0', backgroundColor: '#FFEAF5' },
  label: { color: navy, fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#DEE4F1', backgroundColor: '#FAFBFF', borderRadius: 14, padding: 13, color: navy, fontSize: 15, minHeight: 48 },
  error: { fontSize: 13, color: '#B24160' },
  note: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, backgroundColor: '#EEF2FB' },
  medicalHero: { padding: 22, gap: 14, borderRadius: 26, overflow: 'hidden' },
  medicalSeal: { width: 64, height: 64, backgroundColor: '#FFFFFFAA', borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  step: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EAF1FC', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontWeight: '700', color: '#527CA7' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, backgroundColor: '#FFFFFFDD', paddingHorizontal: 14 },
  searchInput: { flex: 1, minWidth: 0, minHeight: 50, fontSize: 14, color: navy },
  emptyArt: { alignSelf: 'center', width: 74, height: 74, borderRadius: 37, backgroundColor: '#F0F4FC', alignItems: 'center', justifyContent: 'center' },
  pigArt: { width: 240, height: 205, alignSelf: 'center' },
  pigGlow: { position: 'absolute', width: 200, height: 170, borderRadius: 95, backgroundColor: '#F9DFF277', top: 30, left: 20 },
  pigBody: { position: 'absolute', width: 160, height: 106, left: 40, top: 83, borderRadius: 50, borderWidth: 2, borderColor: '#F4B2CF' },
  pigEar: { position: 'absolute', top: 72, left: 156, width: 30, height: 38, borderRadius: 10, transform: [{ rotate: '18deg' }], backgroundColor: '#F3A0C1' },
  pigFoot: { position: 'absolute', top: 177, width: 24, height: 24, borderRadius: 7, backgroundColor: '#E880AC' },
  slot: { position: 'absolute', top: 5, left: 54, width: 42, height: 5, borderRadius: 3, backgroundColor: '#BE6291' },
  eye: { position: 'absolute', right: 28, top: 30, width: 7, height: 8, backgroundColor: '#624568', borderRadius: 4 },
  snout: { position: 'absolute', right: -9, top: 46, width: 44, height: 31, borderRadius: 15, backgroundColor: '#E782B0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nostril: { width: 4, height: 7, borderRadius: 3, backgroundColor: '#B74E82' },
  coin: { position: 'absolute', top: 0, left: 96, width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: '#EABB5C', backgroundColor: '#FFE19C', alignItems: 'center', justifyContent: 'center' },
});
