import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Action, Heading, Icon, Layout, type IconName } from './AccountScreenShared';
import { openAccount } from './navigation';
import { sections, type Section } from './model';

function Copy({ children }: PropsWithChildren) { return <Text style={s.copy}>{children}</Text>; }
function Panel({ children }: PropsWithChildren) { return <View style={s.panel}>{children}</View>; }
type Utility = 'password' | 'security' | 'devices' | 'terms' | 'privacy';
const content: Record<Utility, { icon: IconName; eyebrow: string; title: string; description: string }> = {
  security: { icon: 'shield-checkmark-outline', eyebrow: 'AN TÂM ĐỒNG HÀNH', title: 'Bảo vệ tài khoản của bạn', description: 'Thông tin đăng nhập và quyền riêng tư, được sắp xếp ở một nơi.' },
  password: { icon: 'key-outline', eyebrow: 'BẢO MẬT TÀI KHOẢN', title: 'Một lớp bảo vệ cho hành trình của bạn', description: 'Quản lý mật khẩu để yên tâm tham gia cùng NOI.' },
  devices: { icon: 'phone-portrait-outline', eyebrow: 'KẾT NỐI CỦA BẠN', title: 'Thiết bị đăng nhập', description: 'Theo dõi nơi tài khoản của bạn đang được sử dụng.' },
  terms: { icon: 'document-text-outline', eyebrow: 'CÙNG NHAU RÕ RÀNG', title: 'Điều khoản sử dụng NOI', description: 'Nơi tra cứu các điều khoản được NOI công bố.' },
  privacy: { icon: 'finger-print-outline', eyebrow: 'QUYỀN RIÊNG TƯ', title: 'Thông tin của bạn xứng đáng được bảo vệ', description: 'Tìm hiểu về quyền truy cập và quản lý thông tin cá nhân.' },
};
function Destination({ icon, title, description, target }: { icon: IconName; title: string; description: string; target: Section }) {
  return <Pressable accessibilityRole="button" onPress={() => openAccount(target)} style={({ pressed }) => [s.destination, { opacity: pressed ? 0.65 : 1 }]}>
    <View style={s.smallIcon}><Icon name={icon} color="#8263B7" /></View><View style={s.grow}><Text style={s.label}>{title}</Text><Copy>{description}</Copy></View><Icon name="chevron-forward" size={18}/>
  </Pressable>;
}
export default function AccountUtilityScreen({ section }: { section: Utility }) {
  const item = content[section];
  const [expanded, setExpanded] = useState<string | null>(null);
  const legal = section === 'terms' || section === 'privacy';
  const topics = section === 'terms' ? ['Tài khoản và việc tham gia', 'Đóng góp và xác nhận', 'Quy tắc cộng đồng'] : ['Thông tin cá nhân', 'Ảnh và vị trí điểm danh', 'Yêu cầu về dữ liệu'];
  return <Layout title={sections[section]}>
    <LinearGradient colors={['#FFF0F8', '#F3EEFF', '#E5F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
      <View pointerEvents="none" style={s.orbit}/><View style={s.heroIcon}><Icon name={item.icon} size={28} color="#BC458B"/></View>
      <Text style={s.eyebrow}>{item.eyebrow}</Text><Text accessibilityRole="header" style={s.heroTitle}>{item.title}</Text><Copy>{item.description}</Copy>
    </LinearGradient>
    {section === 'security' ? <Panel><Heading>Quản lý bảo mật</Heading><Destination icon="key-outline" title="Mật khẩu" description="Thông tin và cách bảo vệ mật khẩu" target="password"/><Destination icon="phone-portrait-outline" title="Thiết bị đăng nhập" description="Kiểm tra các phiên truy cập" target="devices"/><Destination icon="finger-print-outline" title="Quyền riêng tư" description="Thông tin về dữ liệu cá nhân" target="privacy"/></Panel> : null}
    {section === 'password' ? <>
      <Panel><Heading>Thay đổi mật khẩu</Heading><View style={s.notice}><Icon name="information-circle-outline" color="#6386BA"/><Copy>Chức năng đổi mật khẩu sẽ mở khi tài khoản được kết nối dịch vụ đăng nhập.</Copy></View>
        {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Nhập lại mật khẩu mới'].map(label => <View key={label} style={s.field}><Text style={s.fieldLabel}>{label}</Text><View accessibilityLabel={`${label}, chưa khả dụng`} style={s.disabledField}><Icon name="lock-closed-outline" size={18} color="#9AA8BC"/><Text style={s.placeholder}>Chưa kết nối đăng nhập</Text></View></View>)}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: true }} disabled style={s.disabledButton}><Text style={s.disabledText}>Cập nhật mật khẩu</Text></Pressable>
      </Panel><Panel><Heading>Giữ tài khoản an toàn</Heading>{['Dùng mật khẩu riêng cho tài khoản NOI.', 'Không chia sẻ mật khẩu hoặc mã xác nhận.', 'Kiểm tra thiết bị khi phát hiện truy cập lạ.'].map((text, i) => <View key={text} style={s.tip}><Text style={s.number}>0{i + 1}</Text><Copy>{text}</Copy></View>)}</Panel>
    </> : null}
    {section === 'devices' ? <Panel><View style={s.empty}><View style={s.emptyIcon}><Icon name="laptop-outline" size={42} color="#7798CE"/></View><Heading>Chưa có phiên đăng nhập</Heading><Text style={s.centerCopy}>Danh sách thiết bị sẽ xuất hiện khi bạn sử dụng tài khoản đã kết nối dịch vụ đăng nhập.</Text></View><View style={s.notice}><Icon name="shield-checkmark-outline" color="#6386BA"/><Copy>Tại đây, bạn sẽ có thể kiểm tra và đăng xuất các thiết bị không còn sử dụng.</Copy></View></Panel> : null}
    {legal ? <><Panel><View style={s.documentHead}><Heading>{section === 'terms' ? 'Văn bản điều khoản' : 'Văn bản bảo mật'}</Heading><View style={s.badge}><Text style={s.badgeText}>Chờ công bố</Text></View></View><Copy>NOI chưa cung cấp văn bản chính thức trong ứng dụng. Nội dung sẽ được hiển thị tại đây khi được công bố.</Copy></Panel>
      <Panel><Heading>Nội dung tra cứu</Heading>{topics.map((topic, i) => <View key={topic} style={s.topic}><Pressable accessibilityRole="button" accessibilityState={{ expanded: expanded === topic }} onPress={() => setExpanded(expanded === topic ? null : topic)} style={s.topicButton}><Text style={s.number}>0{i + 1}</Text><Text style={[s.label, s.grow]}>{topic}</Text><Icon name={expanded === topic ? 'chevron-up' : 'chevron-down'} size={18}/></Pressable>{expanded === topic ? <Text style={s.topicCopy}>Mục này chưa có nội dung được công bố. Bạn có thể liên hệ hỗ trợ để hỏi thêm về {topic.toLowerCase()}.</Text> : null}</View>)}</Panel>
      <Panel><Destination icon={section === 'terms' ? 'finger-print-outline' : 'document-text-outline'} title={section === 'terms' ? 'Chính sách bảo mật' : 'Điều khoản sử dụng'} description="Xem thông tin liên quan" target={section === 'terms' ? 'privacy' : 'terms'}/>{section === 'privacy' ? <Destination icon="person-outline" title="Thông tin cá nhân của bạn" description="Xem và chỉnh sửa hồ sơ" target="profile"/> : null}</Panel></> : null}
    <Panel><Heading>Cần NOI hỗ trợ?</Heading><Copy>Truy cập trung tâm trợ giúp để tìm câu trả lời và gửi phản hồi.</Copy><Action title="Trung tâm hỗ trợ" icon="chatbubble-ellipses-outline" onPress={() => openAccount('support')}/></Panel>
  </Layout>;
}
const s = StyleSheet.create({
  copy: { color: '#627696', fontSize: 14, lineHeight: 21, flexShrink: 1 },
  panel: { backgroundColor: '#FFFFFFE8', borderRadius: 19, padding: 14, gap: 10 },
  hero: { padding: 18, borderRadius: 24, gap: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF' }, orbit: { position: 'absolute', width: 180, height: 180, right: -70, top: -65, borderRadius: 90, borderWidth: 24, borderColor: '#FFFFFF66' }, heroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#FFFFFFBB', alignItems: 'center', justifyContent: 'center' }, eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', color: '#9B5F9F' }, heroTitle: { fontSize: 24, lineHeight: 31, fontWeight: '700', color: '#14264F' }, destination: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E9EAF4' }, grow: { flex: 1, minWidth: 0 }, smallIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#F2EAFE', alignItems: 'center', justifyContent: 'center' }, label: { fontSize: 15, lineHeight: 22, fontWeight: '600', color: '#172B50' }, notice: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, backgroundColor: '#EDF4FF' }, field: { gap: 6, marginTop: 2 }, fieldLabel: { fontSize: 13, color: '#627596' }, disabledField: { flexDirection: 'row', gap: 10, padding: 13, borderRadius: 13, borderWidth: 1, borderColor: '#E5E9F1', backgroundColor: '#F7F8FC' }, placeholder: { flex: 1, color: '#8997AB', fontSize: 13 }, disabledButton: { padding: 15, marginTop: 10, alignItems: 'center', borderRadius: 13, backgroundColor: '#E6E8F0' }, disabledText: { color: '#78849A', fontWeight: '600' }, tip: { flexDirection: 'row', gap: 12, paddingVertical: 7 }, number: { color: '#C768A1', fontSize: 12, fontWeight: '700', paddingTop: 3 }, empty: { alignItems: 'center', paddingVertical: 14, gap: 12 }, emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#EDF2FE', justifyContent: 'center', alignItems: 'center' }, centerCopy: { textAlign: 'center', color: '#7184A4', fontSize: 14, lineHeight: 22 }, documentHead: { gap: 10, alignItems: 'flex-start' }, badge: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FFF1DE', borderRadius: 20 }, badgeText: { color: '#A77937', fontSize: 11, fontWeight: '600' }, topic: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E9EAF4' }, topicButton: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54 }, topicCopy: { color: '#7184A4', fontSize: 13, lineHeight: 21, paddingBottom: 14, paddingLeft: 28 },
});
