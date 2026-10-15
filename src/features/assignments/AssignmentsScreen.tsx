import { ActivityPhoto, StatusPill } from '../../components/ActivityPresentation';
import { useAssistantContext } from '../assistant/Assistant';
import { scheduleSession } from '../schedule/demo';
import { linkedAssignments } from '../schedule/model';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Chip, typography } from '../../components/ui';
import { theme } from '../../theme/tokens';
import { allowedActions, assignTask, canManage, context, createGroup, displayStatus, labels, transition, type Assignment, type Command, type Snapshot, type TaskDraft } from './model';
import { demoSession } from './demo';

type Mode = 'mine' | 'review' | 'progress' | 'assign' | 'group';
const date = (value: string) => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const parseDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) return '';
  const parsed = new Date(value.replace(' ', 'T') + ':00+07:00');
  if (!Number.isFinite(parsed.getTime())) return '';
  const roundTrip = new Date(parsed.getTime() + 7 * 3600000).toISOString().slice(0, 16).replace('T', ' ');
  return roundTrip === value ? parsed.toISOString() : '';
};
export default function AssignmentsScreen() {
  const { milestoneId, campaignId: filterCampaign, assignmentId } = useLocalSearchParams<{ milestoneId?: string; campaignId?: string; assignmentId?: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(() => demoSession.read().assignments.some(a => a.id === assignmentId && a.member_id === demoSession.actor()) ? assignmentId ?? null : null);
  const [showDemo, setShowDemo] = useState(false);
  const milestone = scheduleSession.read().find(m => m.id === milestoneId);
  const [data, setData] = useState(demoSession.read);
  const [actorId, setActorId] = useState(demoSession.actor);
  const [mode, setMode] = useState<Mode>('mine');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [groupId, setGroupId] = useState(data.groups[0]?.id ?? '');
  const [members, setMembers] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [deadline, setDeadline] = useState('');
  const [campaignId, setCampaignId] = useState(data.campaigns[0]?.id ?? '');
  const [groupName, setGroupName] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const actor = data.people.find(p => p.id === actorId)!;
  const managed = data.groups.filter(g => canManage(data, actor, g));
  const group = managed.find(g => g.id === groupId);
  const name = (id: string) => data.people.find(p => p.id === id)?.name ?? id;
  const toggle = (values: string[], id: string) => values.includes(id) ? values.filter(x => x !== id) : [...values, id];
  const commit = (operation: (current: Snapshot) => Snapshot, message: string) => {
    try { const next = operation(demoSession.read()); demoSession.save(next); setData(next); setError(''); setNotice(message); return true; }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể cập nhật.'); setNotice(''); return false; }
  };
  const act = (a: Assignment, action: Command['action']) => {
    const cmd: Command = action === 'rework' ? { assignment_id: a.id, expected_version: a.version, action, reason } : { assignment_id: a.id, expected_version: a.version, action };
    if (commit(s => transition(s, actor, cmd, new Date().toISOString()), action === 'submit' ? 'Đã gửi, chờ trưởng nhóm xác nhận.' : 'Đã cập nhật công việc.')) { setReasonId(null); setReason(''); }
  };
  const field = (label: string, value: string, change: (v: string) => void, multiline = false) => <View style={s.field}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={change} style={[s.input, multiline && s.multiline]} multiline={multiline} maxLength={multiline ? 2000 : 500} /></View>;
  const card = (a: Assignment, detailed = false) => {
    const { task, group: taskGroup } = context(data, a);
    const status = displayStatus(a, task);
    const actions = allowedActions(data, actor, a);
    if (!detailed) return <Card key={a.id}><View style={{ flexDirection: 'row', gap: 12 }}><ActivityPhoto campaignId={taskGroup.campaign_id} compact /><View style={{ flex: 1, gap: 6 }}><Text style={s.label}>{task.title}</Text><Text style={s.body}>{task.location}</Text><Text style={s.body}>{date(task.starts_at)}</Text></View></View><StatusPill label={labels[status]} tone={a.status === 'HOAN_THANH' ? 'success' : status === 'QUA_HAN' || a.status === 'CHO_XAC_NHAN' ? 'warning' : a.status === 'CAN_THUC_HIEN_LAI' ? 'error' : 'info'} /><Button title="Xem chi tiết công việc" onPress={() => setSelectedId(a.id)} /></Card>;
    return <Card key={a.id}>
      <ActivityPhoto campaignId={taskGroup.campaign_id} />
      <Text style={typography.heading}>{task.title}</Text>
      <Text style={[s.status, a.status === 'HOAN_THANH' && s.success, status === 'QUA_HAN' && s.warning]}>{labels[status]}{status === 'QUA_HAN' ? ` · ${labels[a.status]}` : ''}</Text>
      <Text style={s.body}>{data.campaigns.find(c => c.id === taskGroup.campaign_id)?.title}</Text>
      <Text style={s.body}>{taskGroup.name} · Trưởng nhóm: {name(taskGroup.leader_id)}</Text>
      <Text style={s.body}>Thành viên: {name(a.member_id)}</Text>
      <Text style={s.body}>{task.description}</Text>
      <Text style={s.body}>Thời gian: {date(task.starts_at)} – {date(task.ends_at)}</Text>
      <Text style={s.body}>Địa điểm: {task.location}</Text>
      <Text style={s.body}>Deadline: {task.deadline ? date(task.deadline) : 'Không có'}</Text>
      {task.requirements ? <Text style={s.body}>Yêu cầu: {task.requirements}</Text> : null}
      {a.rework_reason ? <Text style={s.warning}>Lý do yêu cầu làm lại gần nhất: {a.rework_reason}</Text> : null}
      {a.confirmed_by && a.confirmed_at ? <Text style={s.success}>Xác nhận bởi {name(a.confirmed_by)} · {date(a.confirmed_at)}</Text> : null}
      {actions.includes('start') && <Button title={a.status === 'CAN_THUC_HIEN_LAI' ? 'Bắt đầu thực hiện lại' : 'Bắt đầu công việc'} onPress={() => act(a, 'start')} />}
      {actions.includes('submit') && <Button title="Gửi xác nhận hoàn thành" onPress={() => act(a, 'submit')} />}
      {actions.includes('confirm') && <Button title="Xác nhận hoàn thành" onPress={() => act(a, 'confirm')} />}
      {actions.includes('rework') && <Button title="Yêu cầu thực hiện lại" onPress={() => { setReasonId(a.id); setReason(''); setError(''); }} />}
      {reasonId === a.id && actions.includes('rework') && <View style={s.field}>
        {field('Lý do thực hiện lại (bắt buộc)', reason, setReason, true)}
        <Button title="Gửi yêu cầu làm lại" disabled={!reason.trim()} onPress={() => act(a, 'rework')} />
        <Button title="Hủy" onPress={() => setReasonId(null)} />
      </View>}
    </Card>;
  };
  const visible = data.assignments.filter(a => mode === 'mine' ? a.member_id === actor.id && (!filterCampaign || context(data, a).group.campaign_id === filterCampaign) && (!milestoneId || (!!milestone && linkedAssignments(milestone, data).some(item => item.id === a.id))) : allowedActions(data, actor, a).includes('confirm'));
  useAssistantContext('Công việc', { view: mode, activity: milestone?.title ?? null, tasks: (mode === 'progress' ? data.assignments.filter(a => canManage(data, actor, context(data, a).group)) : mode === 'mine' || mode === 'review' ? visible : []).slice(0, 30).map(a => { const { task, group } = context(data, a); return { id: a.id, taskId: task.id, title: task.title, status: a.status, deadline: task.deadline, leader: name(group.leader_id) }; }) });
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={s.fill}>
    <Stack.Screen options={{ title: 'Công việc của tôi', headerShown: true, headerTintColor: theme.colors.text, headerBackButtonDisplayMode: 'minimal' }} />
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.body}>Các nhiệm vụ được giao trong chiến dịch bạn tham gia.</Text>
      {filterCampaign ? <Card><Text style={s.label}>{data.campaigns.find(c => c.id === filterCampaign)?.title ?? 'Công việc theo chiến dịch'}</Text><Button title="Xem tất cả chiến dịch" onPress={() => router.setParams({ campaignId: '' })} /></Card> : null}
      {milestoneId ? <Card><Text style={s.label}>{milestone ? `Công việc trong hoạt động: ${milestone.title}` : 'Không tìm thấy hoạt động.'}</Text><Button title="Xem tất cả công việc của tôi" onPress={() => router.setParams({ milestoneId: '' })} /></Card> : null}
      <Text style={s.body}>Trải nghiệm dữ liệu mẫu · Chưa kết nối backend. Thay đổi giữ trong phiên app, mất khi khởi động lại.</Text>
      <Button title={showDemo ? "Ẩn lựa chọn hồ sơ mẫu" : "Lựa chọn hồ sơ mẫu"} onPress={() => setShowDemo(!showDemo)} />
      {showDemo && <View style={s.row}>{data.people.map(p => <Chip key={p.id} label={p.name} selected={actorId === p.id} onPress={() => { demoSession.selectActor(p.id); setActorId(p.id); setSelectedId(null); setMode('mine'); setError(''); setNotice(''); setReasonId(null); setMembers([]); setGroupMembers([]); setLeaderId(''); }} />)}</View>}
      <View style={s.row}>
        <Chip label="Công việc của tôi" selected={mode === 'mine'} onPress={() => setMode('mine')} />
        {managed.length > 0 && <><Chip label="Chờ xác nhận" selected={mode === 'review'} onPress={() => setMode('review')} /><Chip label="Tiến độ nhóm" selected={mode === 'progress'} onPress={() => setMode('progress')} /><Chip label="Phân công" selected={mode === 'assign'} onPress={() => { setMode('assign'); setGroupId(managed[0].id); setMembers([]); }} /></>}
        {actor.role === 'organizer' && <Chip label="Tạo nhóm" selected={mode === 'group'} onPress={() => setMode('group')} />}
      </View>
      {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
      {notice ? <Text accessibilityLiveRegion="polite" style={s.success}>{notice}</Text> : null}
      {(mode === 'mine' || mode === 'review') && (visible.length ? visible.map(a => card(a)) : <Card><Text style={s.body}>{mode === 'mine' ? 'Chưa có công việc được phân công.' : 'Không có công việc đang chờ bạn xác nhận.'}</Text></Card>)}
      {mode === 'progress' && data.campaigns.map(c => {
        const groups = managed.filter(g => g.campaign_id === c.id);
        return groups.length ? <View key={c.id} style={s.field}><Text style={typography.heading}>{c.title}</Text>{groups.map(g => {
          const assignments = data.assignments.filter(a => context(data, a).group.id === g.id);
          return <View key={g.id} style={s.field}><Text style={s.label}>{g.name} · {name(g.leader_id)}</Text><Text style={s.body}>{assignments.filter(a => a.status === 'HOAN_THANH').length}/{assignments.length} phân công hoàn thành</Text>{g.member_ids.map(id => <View key={id} style={s.field}><Text style={s.label}>{name(id)}</Text>{assignments.filter(a => a.member_id === id).length ? assignments.filter(a => a.member_id === id).map(a => card(a)) : <Text style={s.body}>Chưa có công việc.</Text>}</View>)}</View>;
        })}</View> : null;
      })}
      {mode === 'assign' && <Card>
        <Text style={typography.heading}>Phân công trực tiếp</Text>
        <View style={s.row}>{managed.map(g => <Chip key={g.id} label={`${data.campaigns.find(c => c.id === g.campaign_id)?.title} · ${g.name}`} selected={groupId === g.id} onPress={() => { setGroupId(g.id); setMembers([]); }} />)}</View>
        <Text style={s.label}>Thành viên nhận việc</Text>
        <View style={s.row}>{group?.member_ids.map(id => <Chip key={id} label={name(id)} selected={members.includes(id)} onPress={() => setMembers(toggle(members, id))} />)}</View>
        {field('Tên công việc', title, setTitle)}{field('Mô tả', description, setDescription, true)}{field('Địa điểm', location, setLocation)}
        <Text style={s.body}>Nhập thời gian theo YYYY-MM-DD HH:mm (giờ Việt Nam).</Text>
        {field('Bắt đầu', start, setStart)}{field('Kết thúc', end, setEnd)}{field('Deadline (không bắt buộc)', deadline, setDeadline)}{field('Ghi chú / yêu cầu', requirements, setRequirements, true)}
        <Button title="Giao công việc" disabled={!group || !members.length} onPress={() => {
          const draft: TaskDraft = { group_id: groupId, title, description, location, requirements, starts_at: parseDate(start), ends_at: parseDate(end), deadline: deadline.trim() ? parseDate(deadline) : null, member_ids: members };
          if (commit(s => assignTask(s, actor, draft, `demo-task-${Date.now()}`, new Date().toISOString()), 'Đã phân công trực tiếp cho thành viên.')) { setTitle(''); setDescription(''); setMembers([]); setMode('progress'); }
        }} />
      </Card>}
      {mode === 'group' && <Card>
        <Text style={typography.heading}>Tạo nhóm trong chiến dịch</Text>
        <View style={s.row}>{data.campaigns.filter(c => c.organization_id === actor.organization_id).map(c => <Chip key={c.id} label={c.title} selected={campaignId === c.id} onPress={() => { setCampaignId(c.id); setLeaderId(''); setGroupMembers([]); }} />)}</View>
        {field('Tên nhóm', groupName, setGroupName)}
        <Text style={s.label}>Trưởng nhóm (đăng ký đã xác nhận)</Text>
        <View style={s.row}>{data.applications.filter(a => a.campaign_id === campaignId && a.status === 'confirmed').map(a => <Chip key={a.id} label={name(a.user_id)} selected={leaderId === a.user_id} onPress={() => setLeaderId(a.user_id)} />)}</View>
        <Text style={s.label}>Thành viên</Text>
        <View style={s.row}>{data.applications.filter(a => a.campaign_id === campaignId && a.status === 'confirmed').map(a => <Chip key={a.id} label={name(a.user_id)} selected={groupMembers.includes(a.user_id) || leaderId === a.user_id} onPress={() => setGroupMembers(toggle(groupMembers, a.user_id))} />)}</View>
        <Button title="Tạo nhóm" disabled={!leaderId || !groupName.trim()} onPress={() => {
          if (commit(s => createGroup(s, actor, { id: `demo-group-${Date.now()}`, campaign_id: campaignId, name: groupName, leader_id: leaderId, member_ids: groupMembers }), 'Đã tạo nhóm. Bạn có thể phân công công việc.')) { setGroupName(''); setMode('progress'); }
        }} />
      </Card>}
    </ScrollView>
    <Modal visible={selectedId !== null} animationType="slide" onRequestClose={() => setSelectedId(null)}><SafeAreaProvider><SafeAreaView style={s.fill}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}><Button title="Quay lại danh sách" onPress={() => setSelectedId(null)} /><Text style={typography.heading}>Chi tiết công việc</Text>{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}{notice ? <Text accessibilityLiveRegion="polite" style={s.success}>{notice}</Text> : null}{data.assignments.filter(a => a.id === selectedId && (a.member_id === actor.id || canManage(data, actor, context(data, a).group))).map(a => card(a, true))}</ScrollView></SafeAreaView></SafeAreaProvider></Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 84, gap: 16, width: '100%', maxWidth: 680, alignSelf: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, field: { gap: 10 },
  label: { fontSize: 14, fontWeight: '700', color: theme.colors.text }, body: { fontSize: 14, lineHeight: 21, color: theme.colors.muted },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, minHeight: 48, color: theme.colors.text, backgroundColor: theme.colors.surface },
  multiline: { minHeight: 88, textAlignVertical: 'top' }, status: { color: theme.buttons.primaryText, fontWeight: '700' },
  success: { color: '#267050', lineHeight: 21 }, warning: { color: '#915F16', lineHeight: 21 }, error: { color: '#B12E46', lineHeight: 21 },
});


