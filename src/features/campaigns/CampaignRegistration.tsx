import { theme } from '../../theme/tokens';
import { CelebrationFireworks } from "../../components/CelebrationFireworks";
import { useCallback, useRef, useState, type ComponentProps } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Campaign } from './data';
import type { CampaignDetail } from './details';
import { emptyRegistration, toggleRole, validateContact, validateRegistration, type RegistrationErrors, type RegistrationForm } from './registration';

type Icon = ComponentProps<typeof Ionicons>['name'];
const ink = '#081B55';
const muted = '#62739A';
const accents = ['#50669C', '#50669C', '#50669C', '#F39A26'];
const skills = [
  { label: 'Từng tham gia tình nguyện', icon: 'heart-circle-outline' },
  { label: 'Tổ chức sự kiện', icon: 'calendar-outline' },
  { label: 'Chụp ảnh / Quay phim', icon: 'camera-outline' },
  { label: 'Hoạt náo', icon: 'happy-outline' },
  { label: 'Sơ cứu cơ bản', icon: 'medkit-outline' },
  { label: 'Khác', icon: 'ellipsis-horizontal' },
] as const;

function Heading({ icon, title, edit }: { icon: Icon; title: string; edit?: () => void }) {
  return <View style={s.section}><Ionicons name={icon} size={23} color="#FF168D" /><Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text>{edit && <Pressable accessibilityRole="button" accessibilityLabel={'Chỉnh sửa ' + title} onPress={edit} style={s.edit}><Ionicons name="create-outline" size={17} color="#2475F5" /><Text style={s.editLabel}>Chỉnh sửa</Text></Pressable>}</View>;
}
function Action({ label, onPress, secondary = false, inline = false }: { label: string; onPress: () => void; secondary?: boolean; inline?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.action, inline && { flex: 1 }, pressed && { opacity: secondary ? 0.8 : 1 }]}>
{({ pressed }) => <>
{secondary ? <View style={s.secondary}><Text style={s.secondaryText}>{label}</Text></View> : <LinearGradient colors={(pressed ? theme.buttons.pressedGradient : theme.buttons.gradient)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primary}><Text style={s.primaryText}>{label}</Text><Ionicons name="chevron-forward" size={18} color={theme.buttons.primaryText} /></LinearGradient>}
</>}
</Pressable>;
}

export function CampaignRegistration({ visible, campaign, detail, photo, available, onClose, onSubmitted, onCancel }: {
  visible: boolean; campaign: Campaign; detail: CampaignDetail; photo: number; available: boolean;
  onClose: () => void; onSubmitted: () => void; onCancel: () => void;
}) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [form, setForm] = useState<RegistrationForm>({ ...emptyRegistration });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [consent, setConsent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const finishCelebration = useCallback(() => setCelebrating(false), []);
  const scroll = useRef<ScrollView>(null);
  const nameInput = useRef<TextInput>(null);
  const phoneInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 350 || fontScale > 1.25;
  const changeStep = (next: typeof step) => { Keyboard.dismiss(); setStep(next); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const edit = (next: 0 | 1) => { setEditing(true); setConsent(false); changeStep(next); };
  const back = () => {
    if (step === 4) { changeStep(3); return; }
    if (editing) { setEditing(false); changeStep(2); return; }
    if (step === 3 || step === 0) { setCelebrating(false); onClose(); return; }
    changeStep(step === 2 ? 1 : 0);
  };
  const setContact = (key: 'name' | 'phone' | 'email', value: string) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    setConsent(false);
  };
  const validateFirst = () => {
    const next = validateContact(form); setErrors(next);
    if (next.name) nameInput.current?.focus();
    else if (next.phone) phoneInput.current?.focus();
    else if (next.email) emailInput.current?.focus();
    else { changeStep(editing ? 2 : 1); setEditing(false); }
  };
  const next = () => {
    if (step === 0) { validateFirst(); return; }
    if (step === 1) {
      if (!form.roles.length) { setErrors({ roles: 'Chọn ít nhất một vai trò hoặc Không có ưu tiên.' }); scroll.current?.scrollTo({ y: 0, animated: true }); return; }
      setErrors({}); setEditing(false); changeStep(2); return;
    }
    const nextErrors = validateRegistration(form, consent, available);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.name || nextErrors.phone || nextErrors.email) changeStep(0);
      else if (nextErrors.roles || nextErrors.message) changeStep(1);
      return;
    }
    onSubmitted(); setCelebrating(true); changeStep(3);
  };
  const cancel = () => Alert.alert('Hủy đăng ký demo?', 'Bạn có thể đăng ký lại sau khi hủy.', [
    { text: 'Giữ đăng ký', style: 'cancel' },
    { text: 'Hủy đăng ký', style: 'destructive', onPress: () => { onCancel(); setConsent(false); setErrors({}); setEditing(false); changeStep(0); onClose(); } },
  ]);
  const showRules = () => Alert.alert('Quy định tham gia (minh họa)', '• Có mặt đúng thời gian đã đăng ký.\n• Làm theo hướng dẫn của điều phối viên.\n• Tôn trọng người tham gia và giữ gìn khu vực hoạt động.\n• Báo lại ban tổ chức nếu lịch tham gia thay đổi.\n\nBản demo chưa gửi đăng ký hoặc giữ chỗ thực tế.');
  const summary = <View style={[s.summary, compact && { flexDirection: 'column' }]}>
    <View style={[s.photoFrame, compact && { width: '100%', aspectRatio: 2.3 }]}><Image source={photo} resizeMode="cover" style={s.photo} /></View>
    <View style={s.summaryCopy}><Text style={s.badge}>Tình nguyện viên</Text><Text style={s.campaignTitle}>{campaign.title}</Text>
      <View style={s.detailRow}><Ionicons name="calendar-outline" size={15} color={accents[0]} /><Text style={s.detailText}>{campaign.dateLabel}</Text></View>
      <View style={s.detailRow}><Ionicons name="time-outline" size={15} color={accents[2]} /><Text style={s.detailText}>{campaign.timeLabel}</Text></View>
      <View style={s.detailRow}><Ionicons name="location-outline" size={15} color={accents[1]} /><Text style={s.detailText}>{campaign.location}, {campaign.city}</Text></View>
    </View>
  </View>;
  const tags = (items: string[]) => <View style={s.tags}>{items.length ? items.map(text => <View key={text} style={[s.tag, { backgroundColor: '#FFF0F8' }]}><Text style={[s.tagText, { color: '#F5168B' }]}>{text}</Text></View>) : <Text style={s.body}>Chưa chọn kỹ năng</Text>}</View>;
  const review = (editable: boolean) => <>
    <Heading icon="person-circle-outline" title="Thông tin của bạn" edit={editable ? () => edit(0) : undefined} />
    <View style={s.card}>{([{ label: 'Họ tên', value: form.name.trim(), icon: 'person-outline' }, { label: 'Số điện thoại', value: form.phone.trim(), icon: 'call-outline' }, { label: 'Email', value: form.email.trim(), icon: 'mail-outline' }] as const).map(item => <View key={item.label} style={s.reviewRow}><Ionicons name={item.icon} size={21} color={accents[0]} /><View style={s.grow}><Text style={s.small}>{item.label}</Text><Text style={s.value}>{item.value}</Text></View></View>)}</View>
    <Heading icon="people-outline" title="Vai trò mong muốn" edit={editable ? () => edit(1) : undefined} />{tags(form.roles)}
    <Heading icon="star-outline" title="Kỹ năng / Kinh nghiệm" edit={editable ? () => edit(1) : undefined} />{tags(form.skills)}
    <Heading icon="chatbox-outline" title="Lời nhắn cho Ban tổ chức" edit={editable ? () => edit(1) : undefined} />
    <View style={s.card}><Text style={s.body}>{form.message.trim() || 'Không có lời nhắn.'}</Text></View>
  </>;
  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent navigationBarTranslucent onRequestClose={back}>
    <SafeAreaProvider style={s.fill}>
    <LinearGradient colors={['#FFFCFF', '#FFFFFF', '#F8FCFF']} style={s.fill}>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={s.fill}>
        <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={back} style={s.back}><Ionicons name="chevron-back" size={25} color={ink} /></Pressable><Text accessibilityRole="header" style={s.headerTitle}>{step === 2 ? 'Xác nhận đăng ký' : step === 3 ? 'Kết quả đăng ký' : step === 4 ? 'Đăng ký của tôi' : 'Đăng ký tham gia'}</Text><View style={{ width: 44 }} /></View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.fill}>
          <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
            {step === 3 && <View style={s.success}>
              <View style={s.successHalo}><LinearGradient colors={['#FF5FB9', '#9626EB']} style={s.successMark}><Ionicons name="checkmark" size={46} color="white" /></LinearGradient></View>
              <Text accessibilityRole="header" style={s.successTitle}>Đăng ký thành công!</Text>
              <Text style={s.successText}>Đã ghi nhận thao tác đăng ký demo. Thông tin chưa được gửi đến Ban tổ chức.</Text>
            </View>}
            {summary}
            {step < 3 && <View style={s.steps}>{['Thông tin', 'Bổ sung', 'Xác nhận'].map((label, index) => <View key={label} style={s.stepItem}><View style={[s.stepCircle, index <= step && s.stepActive]}>{index < step ? <Ionicons name="checkmark" size={15} color="white" /> : <Text style={{ color: index <= step ? 'white' : muted, fontWeight: '700' }}>{index + 1}</Text>}</View><Text style={[s.stepLabel, index === step && { color: ink, fontWeight: '700' }]}>{label}</Text></View>)}</View>}
            {step === 0 && <>
              <Heading icon="person-outline" title="Thông tin của bạn" />
              <Text style={s.body}>Nhập thông tin để xem trước đơn đăng ký. Dữ liệu chỉ dùng trong phiên demo này.</Text>
              <Text style={s.label}>Họ và tên <Text style={s.required}>*</Text></Text>
              <View style={[s.inputRow, errors.name && s.invalid]}><Ionicons name="person-outline" size={21} color={accents[0]} /><TextInput ref={nameInput} accessibilityLabel="Họ và tên, bắt buộc" value={form.name} onChangeText={value => setContact('name', value)} placeholder="Nhập họ và tên" placeholderTextColor="#8792A8" autoCapitalize="words" autoComplete="name" maxLength={100} returnKeyType="next" onSubmitEditing={() => phoneInput.current?.focus()} style={s.input} /></View>
              {errors.name && <Text accessibilityLiveRegion="polite" style={s.error}>{errors.name}</Text>}
              <Text style={s.label}>Số điện thoại <Text style={s.required}>*</Text></Text>
              <View style={[s.inputRow, errors.phone && s.invalid]}><Ionicons name="call-outline" size={21} color={accents[1]} /><TextInput ref={phoneInput} accessibilityLabel="Số điện thoại, bắt buộc" value={form.phone} onChangeText={value => setContact('phone', value)} placeholder="Nhập số điện thoại" placeholderTextColor="#8792A8" keyboardType="phone-pad" autoComplete="tel" maxLength={24} style={s.input} /></View>
              {errors.phone && <Text accessibilityLiveRegion="polite" style={s.error}>{errors.phone}</Text>}
              <Text style={s.label}>Email <Text style={s.required}>*</Text></Text>
              <View style={[s.inputRow, errors.email && s.invalid]}><Ionicons name="mail-outline" size={21} color={accents[2]} /><TextInput ref={emailInput} accessibilityLabel="Email, bắt buộc" value={form.email} onChangeText={value => setContact('email', value)} placeholder="Nhập địa chỉ email" placeholderTextColor="#8792A8" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} returnKeyType="done" onSubmitEditing={validateFirst} style={s.input} /></View>
              {errors.email && <Text accessibilityLiveRegion="polite" style={s.error}>{errors.email}</Text>}
           
</>}
            {step === 1 && <>
              <Heading icon="people-outline" title="Vai trò mong muốn" /><Text style={s.body}>Bạn có thể chọn nhiều vai trò phù hợp.</Text>
              <View style={s.options}>{[...detail.tasks.map(task => task.title), 'Không có ưu tiên'].map((role, index) => {
                const checked = form.roles.includes(role); const color = checked ? '#F5168B' : '#50669C';
                return <Pressable key={role} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => { setForm(current => ({ ...current, roles: toggleRole(current.roles, role) })); setErrors({}); setConsent(false); }} style={[s.option, compact && { width: '100%' }, { borderColor: checked ? color : '#E6EBF4', backgroundColor: checked ? '#FFF2F9' : '#F7F9FE' }]}><Ionicons name={(['cube-outline', 'hand-left-outline', 'people-outline', 'flag-outline', 'ellipsis-horizontal'] as const)[index]} size={22} color={color} /><Text style={s.optionLabel}>{role}</Text>{checked && <Ionicons name="checkmark-circle" size={17} color={color} />}</Pressable>;
              })}</View>
              {errors.roles && <Text accessibilityLiveRegion="polite" style={s.error}>{errors.roles}</Text>}
              <Heading icon="ribbon-outline" title="Kinh nghiệm / Kỹ năng" /><Text style={s.body}>Chọn các kỹ năng bạn có (không bắt buộc).</Text>
              <View style={s.options}>{skills.map(skill => {
                const checked = form.skills.includes(skill.label); const color = checked ? '#F5168B' : '#50669C';
                return <Pressable key={skill.label} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => { setForm(current => ({ ...current, skills: checked ? current.skills.filter(value => value !== skill.label) : [...current.skills, skill.label] })); setConsent(false); }} style={[s.option, compact && { width: '100%' }, { borderColor: checked ? color : '#E6EBF4', backgroundColor: checked ? '#FFF2F9' : '#F7F9FE' }]}><Ionicons name={skill.icon} size={22} color={color} /><Text style={s.optionLabel}>{skill.label}</Text>{checked && <Ionicons name="checkmark-circle" size={17} color={color} />}</Pressable>;
              })}</View>
              <Heading icon="chatbubble-outline" title="Lời nhắn cho Ban tổ chức" /><Text style={s.small}>Không bắt buộc</Text>
              <TextInput accessibilityLabel="Lời nhắn cho Ban tổ chức" value={form.message} onChangeText={message => { setForm(current => ({ ...current, message })); setConsent(false); }} multiline maxLength={300} textAlignVertical="top" placeholder="Bạn có điều gì muốn Ban tổ chức biết?" placeholderTextColor="#8792A8" style={s.message} />
              <Text style={s.counter}>{form.message.length}/300</Text>
           
</>}
            {step === 2 && <>
              {review(true)}
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => { setConsent(!consent); setErrors(current => ({ ...current, consent: undefined })); }} style={s.consent}><Ionicons name={consent ? 'checkbox' : 'square-outline'} size={25} color="#FF168D" /><Text style={[s.body, s.grow]}>Tôi xác nhận có thể tham gia trong thời gian trên và đồng ý với quy định của chiến dịch.</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={showRules} style={s.rules}><Text style={s.editLabel}>Xem quy định</Text></Pressable>
              {(errors.consent || errors.capacity) && <Text accessibilityLiveRegion="polite" style={s.error}>{errors.consent || errors.capacity}</Text>}
              <Text style={s.demo}>Bản demo · Chưa gửi thông tin hoặc giữ chỗ thực tế.</Text>
           
</>}
            {(step === 3 || step === 4) && <>
              <View style={s.statusCard}><Ionicons name="time-outline" size={27} color={accents[3]} /><View style={s.grow}><Text style={s.itemTitle}>Trạng thái đăng ký</Text><Text style={s.pending}>Chờ duyệt · Demo</Text><Text style={s.body}>Trạng thái minh họa, chưa có hồ sơ được gửi đến Ban tổ chức.</Text></View></View>
              {step === 3 ? <View style={s.card}><Heading icon="bulb-outline" title="Lưu ý" /><Text style={s.body}>Bạn có thể xem lại thông tin vừa nhập tại “Xem đăng ký của tôi”. Dữ liệu sẽ mất khi rời trang chi tiết hoặc khởi động lại app.</Text></View> : review(false)}
           
</>}
          </ScrollView>
          <View style={s.footer}>
            {step < 3 ? <View style={[s.buttons, compact && { flexDirection: 'column' }]}>{step === 2 && <Action inline={!compact} label="Quay lại" secondary onPress={back} />}<Action inline={!compact} label={step === 2 ? 'Xác nhận đăng ký' : editing ? 'Lưu chỉnh sửa' : 'Tiếp tục'} onPress={next} /></View> : <>
              {step === 3 ? <Action label="Xem đăng ký của tôi" onPress={() => { setCelebrating(false); changeStep(4); }} /> : <Action label="Hủy đăng ký demo" secondary onPress={cancel} />}
              <Action label="Về trang chiến dịch" secondary onPress={() => { setCelebrating(false); onClose(); }} />
           
</>}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {visible && step === 3 && celebrating && <CelebrationFireworks onFinish={finishCelebration} />}
    </LinearGradient>
    </SafeAreaProvider>
  </Modal>;
}

const s = StyleSheet.create({
  fill: { flex: 1 }, grow: { flex: 1 }, header: { flexShrink: 0, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, width: '100%', maxWidth: 680, alignSelf: 'center' }, back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }, headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, lineHeight: 24, fontWeight: '700', color: ink },
  content: { padding: 16, gap: 12, width: '100%', maxWidth: 680, alignSelf: 'center', paddingBottom: 24 },
  summary: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: 16, backgroundColor: '#F4F7FE' }, photoFrame: { width: 92, aspectRatio: 0.8, borderRadius: 12, overflow: 'hidden', alignSelf: 'flex-start' }, photo: { width: '100%', height: '100%' }, summaryCopy: { flex: 1, gap: 7 }, badge: { alignSelf: 'flex-start', color: '#F5168B', backgroundColor: '#FFF0F8', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }, campaignTitle: { fontSize: 15, lineHeight: 21, fontWeight: '800', color: ink }, detailRow: { flexDirection: 'row', gap: 7, alignItems: 'flex-start' }, detailText: { flex: 1, fontSize: 10, lineHeight: 16, color: ink },
  steps: { flexDirection: 'row', gap: 7, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E8EDF5' }, stepItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }, stepCircle: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#E9EDF5', alignItems: 'center', justifyContent: 'center' }, stepActive: { backgroundColor: '#F5168B' }, stepLabel: { flexShrink: 1, color: muted, fontSize: 10, lineHeight: 15 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }, sectionTitle: { flex: 1, fontSize: 15, lineHeight: 22, fontWeight: '700', color: ink }, body: { fontSize: 12, lineHeight: 19, color: muted }, small: { fontSize: 11, lineHeight: 17, color: muted }, label: { fontSize: 12, fontWeight: '600', color: ink, marginTop: 8 }, required: { color: '#B44C4C' }, inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#D1DBEA', borderRadius: 12, paddingHorizontal: 12, backgroundColor: 'white' }, input: { flex: 1, minHeight: 48, paddingVertical: 12, fontSize: 14, color: ink }, invalid: { borderColor: '#C24F4F' }, error: { color: '#AC303F', fontSize: 11, lineHeight: 17 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }, option: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 13, padding: 10, minHeight: 54 }, optionLabel: { flex: 1, fontSize: 11, lineHeight: 16, color: ink }, message: { minHeight: 100, borderWidth: 1, borderColor: '#D7DFEC', borderRadius: 13, backgroundColor: 'white', padding: 12, fontSize: 12, lineHeight: 20, color: ink }, counter: { textAlign: 'right', fontSize: 11, color: muted },
  card: { backgroundColor: '#F5F7FE', borderRadius: 15, padding: 14, gap: 12 }, reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, value: { fontSize: 13, lineHeight: 20, color: ink }, edit: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }, editLabel: { color: '#2475F5', fontSize: 11, fontWeight: '600' }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tag: { borderRadius: 12, paddingHorizontal: 11, paddingVertical: 8 }, tagText: { fontSize: 11, lineHeight: 17 }, consent: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingTop: 10 }, rules: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' }, demo: { textAlign: 'center', fontSize: 10, color: muted, lineHeight: 16 },
  footer: { padding: 14, gap: 8, width: '100%', maxWidth: 680, alignSelf: 'center', backgroundColor: '#FFFFFFE8' }, buttons: { flexDirection: 'row', gap: 9 }, action: { minHeight: 50 }, primary: { minHeight: 50, borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: theme.buttons.primaryText, fontSize: 13, lineHeight: 20, fontWeight: '700', flexShrink: 1 }, secondary: { minHeight: 50, borderRadius: 14, padding: 12, backgroundColor: theme.buttons.secondaryBackground, alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: theme.buttons.text, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  success: { alignItems: 'center', gap: 14, paddingVertical: 18 }, successHalo: { padding: 13, borderRadius: 65, backgroundColor: '#FCDFFF' }, successMark: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' }, successTitle: { color: ink, fontSize: 25, lineHeight: 33, fontWeight: '800', textAlign: 'center' }, successText: { fontSize: 13, lineHeight: 21, color: muted, textAlign: 'center' }, statusCard: { flexDirection: 'row', gap: 12, backgroundColor: '#FFF8EE', borderWidth: 1, borderColor: '#F5E8D0', padding: 14, borderRadius: 16 }, itemTitle: { fontSize: 13, fontWeight: '700', color: ink }, pending: { fontSize: 12, color: '#E98013', marginVertical: 8, fontWeight: '600', alignSelf: 'flex-start', backgroundColor: '#FFF0CC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
});




