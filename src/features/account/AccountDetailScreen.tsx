import { openAccount } from './navigation';
import { useCallback, useState, type PropsWithChildren } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import { Button, Card, Chip } from '../../components/ui';
import { theme } from '../../theme/tokens';
import { useAssistant, useAssistantContext } from '../assistant/Assistant';
import { campaigns, normalizeSearch } from '../campaigns/data';
import { demoSession } from '../assignments/demo';
import { context, displayStatus, labels as taskLabels } from '../assignments/model';
import { ActivityPhoto, StatusPill } from '../../components/ActivityPresentation';
import { donationSession } from '../contributions/session';
import { walletSession } from '../store/session';
import { accountSession, notificationSession, profileSession, sampleJourney, supportDraft } from './session';
import { donationLabels, donationMatches, paidTotal, faqs, goalPercent, registrationLabels, registrationMatches, sections, type Section } from './model';


const money = (value: number) => value.toLocaleString('vi-VN') + 'đ';
function Copy({ children }: PropsWithChildren) { return <Text style={s.body}>{children}</Text>; }
function Heading({ children }: PropsWithChildren) { return <Text accessibilityRole="header" style={s.heading}>{children}</Text>; }
function Field({ label, value, onChangeText, multiline = false, numeric = false }: { label: string; value: string; onChangeText: (text: string) => void; multiline?: boolean; numeric?: boolean }) {
  return <View style={s.group}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} multiline={multiline} keyboardType={numeric ? 'number-pad' : 'default'} maxLength={multiline ? 1000 : 100} style={[s.input, multiline && { minHeight: 90, textAlignVertical: 'top' }]} /></View>;
}
function Row({ title, detail, onPress }: { title: string; detail?: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.row, pressed && { opacity: 0.65 }]}><View style={s.rowCopy}><Text style={s.label}>{title}</Text>{detail ? <Copy>{detail}</Copy> : null}</View><Text style={s.chevron}>›</Text></Pressable>; }
function Filters({ values, value, onChange }: { values: string[]; value: string; onChange: (value: string) => void }) { return <View style={s.filters}>{values.map(label => <Chip key={label} label={label} selected={label === value} onPress={() => onChange(label)} />)}</View>; }
function Value({ label, value }: { label: string; value: string }) { return <View style={s.group}><Text style={s.label}>{label}</Text><Copy>{value || 'Chưa cập nhật'}</Copy></View>; }

function Profile() {
  const profile = profileSession.useValue();
  const wallet = walletSession.useValue();
  const percent = goalPercent(sampleJourney.hours, Number(profile.goalHours));
  return <>
    <Card><View style={s.identity}><Image source={require('../../../assets/profile-avatar.png')} style={s.avatar} /><View style={s.rowCopy}><Heading>{profile.name}</Heading><Copy>Tình nguyện viên</Copy></View></View><Button title="Chỉnh sửa" onPress={() => openAccount('edit')} /></Card>
    <Card><Heading>Thông tin cá nhân</Heading><Value label="Tên hiển thị" value={profile.name} /><Value label="Ngày sinh" value={profile.birthday} /><Value label="Địa phương" value={profile.city} /></Card>
    <Card><Heading>Thông tin liên hệ</Heading><Value label="Email" value={profile.email} /><Value label="Số điện thoại" value={profile.phone} /></Card>
    <Card><Heading>Giới thiệu bản thân</Heading><Copy>{profile.quote || 'Chưa cập nhật'}</Copy></Card>
    <Card><Heading>Kỹ năng & sở thích</Heading><Value label="Kỹ năng" value={profile.skills} /><Value label="Sở thích" value={profile.interests} /></Card>
    <Card><Heading>Mục tiêu thiện nguyện</Heading><Copy>{profile.purpose || 'Bạn muốn tạo nên thay đổi gì cho cộng đồng? Hãy bổ sung trong Chỉnh sửa.'}</Copy></Card>
    <Card><Heading>Hành trình thiện nguyện</Heading><Copy>Dữ liệu mẫu để trải nghiệm giao diện.</Copy><View style={s.filters}><Value label="Hoạt động" value={String(sampleJourney.activities)} /><Value label="Giờ tình nguyện" value={String(sampleJourney.hours)} /><Value label="Điểm Phước" value={wallet.balance.toLocaleString('vi-VN')} /></View></Card>
    <Card><Heading>Mục tiêu của tôi</Heading><Copy>{profile.goalHours} giờ tình nguyện năm {profile.goalYear}</Copy><Text style={s.label}>{sampleJourney.hours}/{profile.goalHours} giờ · {percent}%</Text><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }} style={s.track}><View style={[s.progress, { width: `${percent}%` }]} /></View><Copy>Tiến độ dùng số giờ mẫu; chưa đồng bộ với lịch sử điểm danh.</Copy></Card>
  </>;
}
function EditProfile() {
  const [draft, setDraft] = useState(profileSession.read);
  const [error, setError] = useState('');
  const fields: { key: keyof typeof draft; label: string; multiline?: boolean; numeric?: boolean }[] = [
    { key: 'name', label: 'Tên hiển thị' }, { key: 'birthday', label: 'Ngày sinh' }, { key: 'city', label: 'Địa phương' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Số điện thoại' }, { key: 'quote', label: 'Giới thiệu bản thân', multiline: true }, { key: 'skills', label: 'Kỹ năng', multiline: true }, { key: 'interests', label: 'Sở thích', multiline: true }, { key: 'purpose', label: 'Mục tiêu thiện nguyện', multiline: true }, { key: 'goalHours', label: 'Mục tiêu số giờ', numeric: true }, { key: 'goalYear', label: 'Năm', numeric: true },
  ];
  const save = () => {
    if (!draft.name.trim()) { setError('Vui lòng nhập tên hiển thị.'); return; }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) { setError('Email chưa hợp lệ.'); return; }
    if (!/^\d+$/.test(draft.goalHours) || Number(draft.goalHours) < 1 || Number(draft.goalHours) > 10000 || !/^\d{4}$/.test(draft.goalYear)) { setError('Nhập mục tiêu 1–10.000 giờ và năm gồm 4 chữ số.'); return; }
    profileSession.set({ ...draft, name: draft.name.trim(), email: draft.email.trim() });
    if (router.canGoBack()) router.back(); else router.replace({ pathname: '/account/[section]', params: { section: 'profile' } });
  };
  return <><Copy>Thay đổi chỉ lưu trong phiên demo hiện tại.</Copy><Card>{fields.map(field => <Field key={field.key} label={field.label} multiline={field.multiline} numeric={field.numeric} value={draft[field.key]} onChangeText={value => setDraft(current => ({ ...current, [field.key]: value }))} />)}</Card>{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}<Button title="Lưu hồ sơ demo" onPress={save} /></>;
}

function Registrations() {
  const [tab, setTab] = useState<'registrations' | 'tasks'>('registrations');
  const [filter, setFilter] = useState('Tất cả');
  const [snapshot, setSnapshot] = useState(demoSession.read);
  const [actor, setActor] = useState(demoSession.actor);
  useFocusEffect(useCallback(() => { setSnapshot(demoSession.read()); setActor(demoSession.actor()); }, []));
  const items = snapshot.applications.filter(item => item.user_id === actor && registrationMatches(item.status, filter));
  const tasks = snapshot.assignments.filter(item => item.member_id === actor);
  return <>
    <View style={s.segment}>{([{ id: 'registrations', title: 'Đăng ký' }, { id: 'tasks', title: 'Công việc' }] as const).map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: tab === item.id }} onPress={() => setTab(item.id)} style={[s.segmentItem, tab === item.id && s.segmentSelected]}><Text style={s.label}>{item.title}</Text></Pressable>)}</View>
    <Copy>Dữ liệu mẫu · {snapshot.people.find(p => p.id === actor)?.name ?? 'Người dùng hiện tại'}</Copy>
    {tab === 'registrations' ? <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}><Filters values={['Tất cả', 'Đã đăng ký/đã xác nhận', 'Đang chờ', 'Đã tham gia', 'Đã hủy']} value={filter} onChange={setFilter} /></ScrollView>
      {!items.length && <Card><Copy>Chưa có đăng ký trong mục này.</Copy></Card>}
      {items.map(item => { const campaign = campaigns.find(c => c.id === item.campaign_id); const count = tasks.filter(a => context(snapshot, a).group.campaign_id === item.campaign_id).length; return <Card key={item.id}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Xem ${campaign?.title ?? 'chiến dịch'}`} disabled={!campaign} onPress={() => campaign && router.push({ pathname: '/campaigns/[id]', params: { id: campaign.id } })} style={s.registrationRow}>
          <ActivityPhoto campaignId={item.campaign_id} compact /><View style={s.rowCopy}><Text style={s.label}>{campaign?.title ?? 'Chiến dịch chưa có thông tin'}</Text><StatusPill label={registrationLabels[item.status] ?? item.status} tone={item.status === 'confirmed' || item.status === 'completed' ? 'success' : item.status === 'cancelled' ? 'info' : 'warning'} /><Copy>{campaign?.schedule ?? 'Chưa có lịch'}</Copy><Copy>{campaign?.location ?? 'Chưa có địa điểm'}</Copy></View>
        </Pressable>
        {item.status === 'confirmed' || item.status === 'completed' ? <View style={s.taskStrip}><Copy>{count ? `${count} công việc được giao` : 'Đang chờ phân công công việc'}</Copy><Button title="Xem công việc" onPress={() => router.push({ pathname: '/assignments', params: { campaignId: item.campaign_id } })} /></View> : <Copy>{['submitted', 'waitlisted'].includes(item.status) ? 'Đang chờ xác nhận từ tổ chức.' : registrationLabels[item.status] ?? item.status}</Copy>}
      </Card>; })}
    </> : <>
      <Copy>Công việc được giao trong các chiến dịch bạn tham gia.</Copy>
      {!tasks.length && <Card><Copy>Bạn chưa được phân công công việc.</Copy></Card>}
      {tasks.map(a => { const { task, group } = context(snapshot, a); const status = displayStatus(a, task); return <Card key={a.id}><View style={s.registrationRow}><ActivityPhoto campaignId={group.campaign_id} compact /><View style={s.rowCopy}><Text style={s.label}>{task.title}</Text><Copy>{snapshot.campaigns.find(c => c.id === group.campaign_id)?.title}</Copy><StatusPill label={taskLabels[status]} tone={status === 'HOAN_THANH' ? 'success' : status === 'QUA_HAN' || status === 'CAN_THUC_HIEN_LAI' ? 'warning' : 'info'} /></View></View><Copy>{task.location}</Copy><Button title="Xem công việc" onPress={() => router.push({ pathname: '/assignments', params: { campaignId: group.campaign_id, assignmentId: a.id } })} /></Card>; })}
      <Button title="Mở quản lý công việc" onPress={() => router.push('/assignments')} />
    </>}
  </>;
}
function Donations() {
  const entries = donationSession.useValue();
  const [filter, setFilter] = useState('Tất cả');
  const total = paidTotal(entries);
  const visible = entries.filter(e => donationMatches(e, filter));
  return <>
    <Card><Heading>Tổng số đã quyên góp</Heading><Text style={s.total}>{money(total)}</Text><Copy>Chỉ tính giao dịch được hệ thống xác nhận. Thao tác demo không cộng vào tổng thực tế.</Copy></Card>
    <Heading>Lịch sử đóng góp</Heading><Filters values={['Tất cả', 'Đã thanh toán', 'Đang chờ', 'Đã hủy']} value={filter} onChange={setFilter} />
    {!visible.length && <Card><Copy>Chưa có giao dịch trong mục này.</Copy></Card>}
    {visible.map(e => <Card key={e.id}><Heading>{e.target}</Heading><Text style={s.label}>{money(e.amount)}</Text><Copy>{e.date}</Copy><Copy>{e.status ? donationLabels[e.status] : 'Thao tác demo · Chưa có thanh toán'}</Copy><Copy>{e.id}</Copy>{e.method ? <Copy>{e.method}</Copy> : null}</Card>)}
    <Card><Heading>Phương thức thanh toán</Heading><Copy>Chuyển khoản ngân hàng · VietQR · MoMo</Copy><Copy>Các phương thức đang có trong luồng đóng góp mẫu. Chưa liên kết ví, thẻ hoặc tài khoản thanh toán thật.</Copy><Button title="Khám phá chiến dịch đóng góp" onPress={() => router.navigate('/contributions')} /></Card>
  </>;
}
function Points() {
  const wallet = walletSession.useValue();
  return <>
    <Card><Heading>Tổng Điểm Phước</Heading><Text style={s.total}>{wallet.balance.toLocaleString('vi-VN')}</Text><Copy>Điểm khả dụng trong phiên demo · Không có giá trị tiền tệ.</Copy><Value label="Hạng của tôi" value="Mầm xanh · Hạng minh họa hiện tại" /></Card>
    <Heading>Lịch sử tích điểm</Heading><Card><Value label="Điểm khởi tạo demo" value="+1.250" />{wallet.history.map((entry, index) => <Value key={`${entry.title}-${index}`} label={entry.title} value={`−${entry.points.toLocaleString('vi-VN')} · Đổi quà mẫu`} />)}</Card>
    <Card><Heading>Cách nhận Điểm Phước</Heading><Copy>Điểm Phước ghi nhận đóng góp của bạn. Quy tắc cộng điểm chính thức chưa được kết nối trong mobile; chưa có tỷ lệ quy đổi theo giờ hoặc tiền để áp dụng.</Copy><Button title="Xem quà tại Cửa hàng" onPress={() => router.navigate('/store')} /></Card>
  </>;
}
function Support() {
  const assistant = useAssistant();
  const draft = supportDraft.useValue();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState('');
  const items = faqs.filter(faq => normalizeSearch(faq.question + ' ' + faq.answer).includes(normalizeSearch(query)));
  return <>
    <Field label="Tìm câu hỏi thường gặp" value={query} onChangeText={setQuery} />
    <Heading>Câu hỏi thường gặp</Heading>{!items.length && <Copy>Không tìm thấy câu hỏi phù hợp.</Copy>}
    {items.map(faq => <Card key={faq.question}><Pressable accessibilityRole="button" accessibilityState={{ expanded: expanded === faq.question }} onPress={() => setExpanded(current => current === faq.question ? '' : faq.question)} style={s.faq}><Text style={s.label}>{faq.question}</Text></Pressable>{expanded === faq.question && <Copy>{faq.answer}</Copy>}</Card>)}
    <Card><Heading>NOI AI</Heading><Copy>Hỏi đáp nhanh với trợ lý AI của NOI</Copy><Copy>Trợ lý AI khác với Ban tổ chức và Trưởng nhóm. Các quyết định cần người phụ trách vẫn do con người xử lý.</Copy><Button title="Mở NOI AI" onPress={assistant.open} /></Card>
    <Card><Heading>Gửi yêu cầu hỗ trợ</Heading><Field label="Chủ đề" value={draft.subject} onChangeText={subject => supportDraft.set(current => ({ ...current, subject }))} /><Field label="Nội dung yêu cầu" value={draft.message} onChangeText={message => supportDraft.set(current => ({ ...current, message }))} multiline /><Copy>Bản nháp giữ trong phiên này, chưa gửi đến NOI. Mobile chưa kết nối hệ thống tiếp nhận yêu cầu.</Copy><Button title="Gửi yêu cầu · Chưa khả dụng" disabled onPress={() => {}} /></Card>
    <Card><Heading>Email hỗ trợ</Heading><Copy>Chưa có email hỗ trợ chính thức được cấu hình. NOI sẽ hiển thị địa chỉ sau khi xác nhận kênh liên hệ.</Copy></Card>
  </>;
}
function Settings() {
  const preferences = notificationSession.useValue();
  const notificationLabels = { campaign: 'Chiến dịch', attendance: 'Điểm danh', donation: 'Quyên góp', noi: 'NOI' };
  return <>
    <Card><Heading>Tài khoản</Heading><Row title="Đổi mật khẩu" detail="Chưa kết nối xác thực" onPress={() => openAccount('password')} /><Row title="Bảo mật tài khoản" onPress={() => openAccount('security')} /><Row title="Quản lý thiết bị đăng nhập" onPress={() => openAccount('devices')} /></Card>
    <Card><Heading>Thông báo</Heading><Copy>Tùy chọn dùng trong phiên demo. Chưa đăng ký nhận push và chưa đồng bộ máy chủ.</Copy>{(Object.keys(notificationLabels) as (keyof typeof preferences)[]).map(key => <View key={key} style={s.row}><Text style={[s.label, s.rowCopy]}>{notificationLabels[key]}</Text><Switch accessibilityLabel={`Thông báo ${notificationLabels[key]}`} value={preferences[key]} onValueChange={value => notificationSession.set(current => ({ ...current, [key]: value }))} trackColor={{ true: '#B7D1FF', false: '#DCE0E8' }} /></View>)}</Card>
    <Card><Heading>Ngôn ngữ</Heading><Value label="Ngôn ngữ ứng dụng" value="Tiếng Việt" /><Copy>Hiện ứng dụng chỉ hỗ trợ tiếng Việt.</Copy></Card>
    <Card><Heading>Khác</Heading><Row title="Điều khoản sử dụng" onPress={() => openAccount('terms')} /><Row title="Chính sách bảo mật" onPress={() => openAccount('privacy')} /><Value label="Thông tin phiên bản" value={Constants.expoConfig?.version ?? 'Chưa có thông tin'} /></Card>
  </>;
}
function Unavailable({ section }: { section: Section }) {
  const copy: Partial<Record<Section, string>> = {
    password: 'Đổi mật khẩu cần phiên đăng nhập thật và dịch vụ xác thực. Hồ sơ demo không có mật khẩu để thay đổi.',
    security: 'Mobile chưa kết nối xác thực tài khoản. Chưa thể quản lý xác thực hai bước hoặc phiên đăng nhập.',
    devices: 'Chưa có dữ liệu phiên đăng nhập từ máy chủ. Không hiển thị thiết bị giả hoặc mô phỏng thao tác thu hồi phiên.',
    terms: 'Điều khoản sử dụng chính thức chưa được cấu hình trong mobile. Nội dung sẽ được bổ sung khi có văn bản đã công bố.',
    privacy: 'Chính sách bảo mật chính thức chưa được cấu hình trong mobile. Trang này chưa thay thế văn bản pháp lý của NOI.',
  };
  return <Card><Heading>Chưa khả dụng</Heading><Copy>{copy[section]}</Copy></Card>;
}
export default function AccountDetailScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const section = typeof params.section === 'string' && Object.hasOwn(sections, params.section) ? params.section as Section : null;
  const session = accountSession.useValue();
  useAssistantContext('Tài khoản', { section: section ? sections[section] : 'Không tìm thấy', source: 'demo' });
  const title = section ? sections[section] : 'Không tìm thấy trang';
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.page}>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace('/account')} style={s.back}><Text style={s.backText}>‹</Text></Pressable><Text accessibilityRole="header" style={s.title}>{title}</Text></View>
    <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
      {!session.active ? <Card><Copy>Bạn đã thoát hồ sơ demo.</Copy><Button title="Về Tài khoản" onPress={() => router.replace('/account')} /></Card> : !section ? <Card><Copy>Trang không tồn tại.</Copy><Button title="Về Tài khoản" onPress={() => router.replace('/account')} /></Card> : section === 'profile' ? <Profile /> : section === 'edit' ? <EditProfile /> : section === 'registrations' ? <Registrations /> : section === 'donations' ? <Donations /> : section === 'points' ? <Points /> : section === 'support' ? <Support /> : section === 'settings' ? <Settings /> : <Unavailable section={section} />}
    </ScrollView></KeyboardAvoidingView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  segment: { flexDirection: 'row', backgroundColor: '#ECEEF6', borderRadius: 14, padding: 4 },
  segmentItem: { flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 11 },
  segmentSelected: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C9D6FF' },
  registrationRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  taskStrip: { backgroundColor: '#F3F0FD', borderRadius: 12, padding: 10, gap: 8 },
  fill: { flex: 1 }, page: { flex: 1, backgroundColor: '#F8F7FC' }, header: { flexDirection: 'row', alignItems: 'center', paddingRight: 16 }, back: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, backText: { fontSize: 34, color: theme.colors.text }, title: { flex: 1, color: theme.colors.text, fontSize: 21, fontWeight: '700', paddingVertical: 10 },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 14, paddingBottom: 20 }, heading: { fontSize: 19, lineHeight: 27, color: theme.colors.text, fontWeight: '700' }, body: { fontSize: 14, lineHeight: 22, color: theme.colors.muted }, label: { fontSize: 15, lineHeight: 23, color: theme.colors.text, fontWeight: '600' }, group: { gap: 6 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }, rowCopy: { flex: 1 }, chevron: { fontSize: 24, color: theme.colors.muted }, input: { padding: 12, minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, backgroundColor: '#FFFFFF', color: theme.colors.text, fontSize: 16 }, identity: { flexDirection: 'row', gap: 16, alignItems: 'center' }, avatar: { width: 76, height: 76, borderRadius: 38 }, photo: { width: '100%', aspectRatio: 2, borderRadius: 12 }, total: { fontSize: 28, fontWeight: '700', color: theme.colors.text }, track: { height: 8, backgroundColor: '#EBEAF2', borderRadius: 4, overflow: 'hidden' }, progress: { height: '100%', backgroundColor: '#B7D1FF' }, error: { color: '#AD3045' }, faq: { minHeight: 44, justifyContent: 'center' },
});
