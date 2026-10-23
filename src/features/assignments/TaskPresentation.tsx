import { LinearGradient } from 'expo-linear-gradient';
import { ActionBackground as BrandActionBackground } from '../../components/ui';
import { theme as buttonTheme } from '../../theme/tokens';
import { type ComponentProps, type PropsWithChildren } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { allowedActions, context, displayStatus, labels, type Assignment, type Snapshot, type Person } from './model';

type Icon = ComponentProps<typeof Ionicons>['name'];
const navy = '#081747';
const pink = '#F0168C';
const tones = {
  DA_PHAN_CONG: ['#F4EDFF', '#8724D8', 'hourglass-outline'],
  DANG_THUC_HIEN: ['#FFF5E9', '#F56A12', 'pulse'],
  CHO_XAC_NHAN: ['#EAF3FF', '#1685F5', 'people'],
  HOAN_THANH: ['#E6F6EC', '#299E61', 'checkmark-circle'],
  CAN_THUC_HIEN_LAI: ['#FFF0F6', '#D82E77', 'refresh'],
  QUA_HAN: ['#FFF0E7', '#DF661B', 'alarm-outline'],
} as const;
function Badge({ data, assignment, compact = false }: { data: Snapshot; assignment: Assignment; compact?: boolean }) {
  const status = displayStatus(assignment, context(data, assignment).task);
  const tone = tones[status];
  return <View style={[s.badge, compact && { paddingVertical: 5, paddingHorizontal: 7 }, { backgroundColor: tone[0] }]}><Ionicons name={tone[2]} size={compact ? 14 : 17} color={tone[1]}/><Text style={[s.badgeText, compact && { fontSize: 10 }, { color: tone[1] }]}>{labels[status]}</Text></View>;
}
function Campaign({ data, assignment, compact = false }: { data: Snapshot; assignment: Assignment; compact?: boolean }) {
  const { group } = context(data, assignment);
  const green = group.campaign_id === 'mam-xanh';
  const color = green ? '#08756E' : '#ED178E';
  return <View style={[s.campaign, compact && { minWidth: 130, gap: 7 }]}><View style={[s.campaignIcon, compact && { width: 30, height: 30 }, { backgroundColor: green ? '#E9F7EF' : '#FFF0F7' }]}><Ionicons name={green ? 'leaf' : 'book'} color={green ? '#27813A' : pink} size={compact ? 18 : 23}/></View><Text style={[s.campaignName, compact && { fontSize: 12, lineHeight: 17 }, { color }]}>{data.campaigns.find(c => c.id === group.campaign_id)?.title ?? 'Chiến dịch'}</Text></View>;
}
export function TaskAction({ title, onPress, secondary = false, compact = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; compact?: boolean; disabled?: boolean }) {
  const muted = secondary && compact;
  const color = disabled ? '#7C8290' : muted ? '#39578F' : buttonTheme.buttons.primaryText;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.action, compact && { minHeight: 40, borderRadius: 11 }, { opacity: pressed ? 0.7 : 1 }]}>
    {disabled ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#E3E5E9' }]} /> : muted ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#E7EFFC', borderWidth: 1, borderColor: '#BED0EE', borderRadius: 11 }]} /> : <BrandActionBackground disabled={disabled} radius={13} />}
    <View style={[s.primary, compact && { padding: 8, gap: 5 }]}>
      <Ionicons name={secondary ? 'time-outline' : title === 'Bắt đầu' ? 'play-circle-outline' : 'checkmark-circle'} size={compact ? 19 : 24} color={color}/>
      <Text style={[s.primaryText, compact && { fontSize: 12 }, { color }]}>{title}</Text>
      {secondary && <Ionicons name="chevron-forward" size={16} color={color}/>}
    </View>
  </Pressable>;
}
export function TaskCard({ data, assignment, actor, open, compact = false }: { data: Snapshot; assignment: Assignment; actor: Person; open: () => void; compact?: boolean }) {
  const { task } = context(data, assignment);
  const actions = allowedActions(data, actor, assignment);
  return <View style={[s.card, compact && { padding: 12, gap: 9, borderRadius: 17 }]}><View style={s.top}><Campaign data={data} assignment={assignment} compact={compact}/><Badge data={data} assignment={assignment} compact={compact}/></View><Text style={[s.taskTitle, compact && { fontSize: 19, lineHeight: 25 }]}>{task.title}</Text><View style={s.location}><Ionicons name="location-outline" size={19} color="#7B8DAF"/><Text style={[s.copy, compact && { fontSize: 12, lineHeight: 18 }]}>{task.location}</Text></View><View style={s.actions}>{compact || actions.includes('start') || actions.includes('submit') ? <TaskAction compact={compact} title={assignment.status === 'CHO_XAC_NHAN' ? 'Chờ xét duyệt' : assignment.status === 'HOAN_THANH' ? 'Đã hoàn thành' : compact || actions.includes('start') ? 'Bắt đầu' : 'Gửi hoàn thành'} disabled={!actions.includes('start') && !actions.includes('submit')} onPress={open}/> : null}<TaskAction compact={compact} title="Xem chi tiết" secondary onPress={open}/></View></View>;
}
function Info({ icon, label, children, tint = '#778CC5' }: PropsWithChildren<{ icon: Icon; label: string; tint?: string }>) {
  return <View style={s.info}><View style={[s.infoIcon, { backgroundColor: tint + '12' }]}><Ionicons name={icon} size={20} color={tint}/></View><Text style={s.infoLabel}>{label}</Text><Text style={s.infoValue}>{children}</Text></View>;
}
const date = (v: string) => new Date(v).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
function DetailPanel({ children, blue = false }: PropsWithChildren<{ blue?: boolean }>) {
  return <View style={[s.card, s.decoratedCard]}>
    <LinearGradient pointerEvents="none" colors={blue ? ['#F0F7FF', '#FFFFFF', '#F7F0FF'] : ['#FFF1F8', '#FFFFFF', '#F0F6FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <View style={s.petals}><View style={s.petalOne}/><View style={s.petalTwo}/><View style={s.petalThree}/></View>
      <View style={s.cornerRing}/>
    </View>
    {children}
  </View>;
}
export function TaskDetail({ data, assignment, children }: PropsWithChildren<{ data: Snapshot; assignment: Assignment }>) {
  const { task, group } = context(data, assignment);
  const campaign = data.campaigns.find(c => c.id === group.campaign_id)?.title ?? 'Chiến dịch';
  const leader = data.people.find(p => p.id === group.leader_id)?.name ?? 'Người phụ trách';
  return <View style={s.detail}>
    <DetailPanel><View style={s.top}><Text style={s.sectionText}>{campaign}</Text><Badge data={data} assignment={assignment}/></View><Text style={s.taskTitle}>{task.title}</Text><Info icon="document-text-outline" label="Chiến dịch">{campaign}</Info><Info icon="location-outline" label="Địa điểm">{task.location}</Info><Info icon="time-outline" label="Thời gian">{date(task.starts_at)} – {date(task.ends_at)}</Info>{task.deadline && <Info icon="alarm-outline" label="Hạn gửi">{date(task.deadline)}</Info>}{task.requirements ? <Info icon="reader-outline" label="Ghi chú">{task.requirements}</Info> : null}</DetailPanel>
    <DetailPanel blue><View style={s.sectionTitle}><Text style={s.sectionText}>Công việc cần làm</Text></View>{task.description.split(/\n+/).filter(Boolean).map((line, i) => <View key={i} style={[s.instruction, i > 0 && s.divider]}><Ionicons name="ellipse-outline" size={21} color="#8B9BC2"/><Text style={s.instructionText}>{line}</Text></View>)}</DetailPanel>
    {assignment.rework_reason && <View style={s.rework}><Text style={s.sectionText}>Yêu cầu thực hiện lại</Text><Text style={s.copy}>{assignment.rework_reason}</Text></View>}
    {assignment.confirmed_at && <View style={s.notice}><Ionicons name="checkmark-circle" size={22} color="#299E61"/><Text style={s.copy}>Đã xác nhận bởi {data.people.find(p => p.id === assignment.confirmed_by)?.name ?? 'Người phụ trách'} · {date(assignment.confirmed_at)}</Text></View>}
    <DetailPanel><View style={s.leader}><View style={s.leaderCopy}><Text style={s.sectionText}>Người phụ trách</Text><Text style={s.leaderName}>{leader}</Text><Text style={s.copy}>{group.name}</Text><Text style={s.copy}>0123456789</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Thông tin liên hệ người phụ trách" onPress={() => { void Linking.openURL('tel:0123456789').catch(() => Alert.alert('Liên hệ người phụ trách', 'Vui lòng gọi 0123456789.')); }} style={s.contact}><Ionicons name="call-outline" size={23} color="#5363A6"/></Pressable></View></DetailPanel>
    <View style={s.detailActions}>{children}</View>
  </View>;
}
const s = StyleSheet.create({
  decoratedCard: { overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF', shadowColor: '#B5A5D2', shadowOpacity: 0.09, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  petals: { position: 'absolute', right: -22, top: -22, width: 100, height: 100, opacity: 0.55, transform: [{ rotate: '25deg' }] },
  petalOne: { position: 'absolute', width: 42, height: 76, borderRadius: 35, backgroundColor: '#F9D9ED', left: 22, top: 4, transform: [{ rotate: '-30deg' }] },
  petalTwo: { position: 'absolute', width: 42, height: 76, borderRadius: 35, backgroundColor: '#DCEAFF', left: 49, top: 12, transform: [{ rotate: '32deg' }] },
  petalThree: { position: 'absolute', width: 42, height: 76, borderRadius: 35, backgroundColor: '#EEE0FF', left: 30, top: 32, transform: [{ rotate: '75deg' }] },
  cornerRing: { position: 'absolute', width: 94, height: 94, borderRadius: 47, borderWidth: 12, borderColor: '#DDEAFF55', bottom: -61, left: -35 },
  card: { backgroundColor: '#FFFFFFEE', borderRadius: 20, padding: 15, gap: 12 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }, campaign: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1, minWidth: 155 }, campaignIcon: { width: 38, height: 38, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }, campaignName: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: '600' }, badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingVertical: 8, paddingHorizontal: 10, gap: 5 }, badgeText: { fontSize: 12, fontWeight: '600' }, taskTitle: { color: '#111111', fontSize: 20, lineHeight: 27, fontWeight: '700' }, location: { flexDirection: 'row', gap: 7, alignItems: 'flex-start' }, copy: { flexShrink: 1, fontSize: 14, lineHeight: 21, color: '#7789AF' }, actions: { flexDirection: 'row', gap: 9, marginTop: 4 }, action: { flex: 1, minHeight: 46, borderRadius: 13, overflow: 'hidden' }, primary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 11, gap: 7 }, primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flexShrink: 1 }, secondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 7, borderWidth: 1, borderColor: '#C2D9FF', borderRadius: 13, backgroundColor: '#F6F9FF' }, secondaryText: { color: '#4B5DA6', fontSize: 14, fontWeight: '600', flexShrink: 1 }, detail: { gap: 12 }, info: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 }, infoIcon: { width: 34, height: 34, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, infoLabel: { width: 72, fontSize: 13, lineHeight: 20, color: '#788CAF', paddingTop: 6 }, infoValue: { flex: 1, color: navy, fontSize: 14, lineHeight: 21, paddingTop: 5 }, sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 }, pinkCircle: { width: 36, height: 36, borderRadius: 20, backgroundColor: '#FFF0F8', alignItems: 'center', justifyContent: 'center' }, sectionText: { color: '#111111', fontSize: 20, lineHeight: 27, fontWeight: '700' }, instruction: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 9 }, instructionText: { flex: 1, fontSize: 15, lineHeight: 23, color: navy }, divider: { borderTopColor: '#ECF0F9', borderTopWidth: 1 }, leader: { flexDirection: 'row', gap: 12, alignItems: 'center' }, leaderIcon: { width: 47, height: 47, backgroundColor: '#F5ECFF', borderRadius: 28, alignItems: 'center', justifyContent: 'center' }, leaderCopy: { flex: 1, gap: 5 }, leaderName: { color: navy, fontSize: 17, fontWeight: '700' }, contact: { width: 44, height: 44, borderRadius: 23, backgroundColor: '#EFF5FF', alignItems: 'center', justifyContent: 'center' }, detailActions: { gap: 10 }, rework: { padding: 14, borderRadius: 15, backgroundColor: '#FFEAF1', gap: 8 }, notice: { padding: 14, borderRadius: 15, backgroundColor: '#F0F7FF', flexDirection: 'row', gap: 10 }, scrim: { flex: 1, padding: 24, backgroundColor: '#08174766', justifyContent: 'center' }, contactSheet: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22, gap: 20 },
});


