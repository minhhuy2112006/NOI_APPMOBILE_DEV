import { ActivityPhoto, StatusPill } from '../../components/ActivityPresentation';
import { useAssistantContext } from '../assistant/Assistant';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Button, Card, typography } from '../../components/ui';
import { theme } from '../../theme/tokens';
import { demoSession } from '../assignments/demo';
import { byDay, canComplete, completeMilestone, linkedAssignments, milestoneStatus, progress, statusLabels } from './model';
import { scheduleSession } from './demo';

const time = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
export default function CampaignTimeline({ campaignId }: { campaignId: string }) {
  const [now, setNow] = useState(Date.now);
  const [data, setData] = useState(demoSession.read);
  const [actorId, setActorId] = useState(demoSession.actor);
  const [items, setItems] = useState(() => [...scheduleSession.read()]);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  useFocusEffect(useCallback(() => { setData(demoSession.read()); setActorId(demoSession.actor()); setItems([...scheduleSession.read()]); setNow(Date.now()); }, []));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const actor = data.people.find(p => p.id === actorId)!;
  const name = (id: string) => data.people.find(p => p.id === id)?.name ?? 'Chưa có thông tin';
  const days = byDay(items.filter(m => m.campaignId === campaignId));
  useAssistantContext('Lịch trình', { campaignId, milestones: days.flatMap(d => d.items).map(m => ({ id: m.id, title: m.title, startTime: m.startTime, endTime: m.endTime, status: milestoneStatus(m, now), leader: name(m.responsibleId), progress: progress(m, data) })) }, 30);
  return <View style={s.list}>
    <Text style={typography.heading}>Lịch trình chiến dịch</Text>
    <Text style={s.body}>Dữ liệu mẫu · Thời gian Việt Nam. Kết quả hoạt động do người phụ trách xác nhận, độc lập với tiến độ công việc.</Text>

    {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    {!days.length && <Text style={s.body}>Chiến dịch chưa có lịch trình.</Text>}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.people}>{days.map((day, index) => { const selected = day.date === (days.some(d => d.date === selectedDay) ? selectedDay : days[0]?.date); return <Pressable key={day.date} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setSelectedDay(day.date)} style={[s.dayTab, selected && s.daySelected]}><Text style={s.time}>{day.date.split('-').reverse().slice(0, 2).join('/')}</Text><Text style={s.body}>Ngày {index + 1}</Text></Pressable>; })}</ScrollView>
    {days.filter(day => day.date === (days.some(d => d.date === selectedDay) ? selectedDay : days[0]?.date)).map(day => <View key={day.date} style={s.list}>
      <Text style={s.day}>{day.date.split('-').reverse().join('/')}</Text>
      {day.items.map(m => {
        const status = milestoneStatus(m, now), count = progress(m, data);
        const mine = linkedAssignments(m, data).filter(a => a.member_id === actor.id);
        return <View key={m.id} style={s.timeline}>
          <View style={s.track}><View style={[s.dot, { backgroundColor: status === 'HOAN_THANH' ? '#43A578' : status === 'DANG_DIEN_RA' ? '#608AFF' : '#B0B8CD' }]} /><View style={s.line} /></View>
          <View style={s.card}><Card>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: expandedId === m.id }} onPress={() => setExpandedId(expandedId === m.id ? null : m.id)} style={s.summary}>
              <View style={{ flex: 1, gap: 6 }}><Text style={s.time}>{time(m.startTime)}–{time(m.endTime)}</Text><Text style={s.activityTitle}>{m.title}</Text><Text style={s.body}>{statusLabels[status]} · {count.completed}/{count.total} công việc</Text></View><Text style={s.time}>{expandedId === m.id ? '⌃' : '⌄'}</Text>
            </Pressable>
            {expandedId === m.id && <>
              <StatusPill label={statusLabels[status]} tone={status === 'HOAN_THANH' ? 'success' : status === 'CHO_CAP_NHAT_KET_QUA' ? 'warning' : 'info'} /><Text style={s.body}>{m.location}</Text><Text style={s.body}>Phụ trách: {name(m.responsibleId)}</Text>
              {count.total > 0 && <View style={s.list}><Text style={s.body}>{count.completed}/{count.total} công việc hoàn thành · {Math.round(count.completed / count.total * 100)}%</Text><View style={s.progressTrack}><View style={[s.progressFill, { width: `${Math.round(count.completed / count.total * 100)}%` }]} /></View></View>}
              {mine.length > 0 && <View style={s.taskNotice}><Text style={s.body}>Bạn có công việc trong hoạt động này</Text><Button title="Xem công việc" onPress={() => router.push({ pathname: '/assignments', params: { milestoneId: m.id } })} /></View>}
              <Pressable accessibilityRole="button" onPress={() => setSelectedId(m.id)} style={{ paddingVertical: 10 }}><Text style={s.time}>Xem chi tiết hoạt động →</Text></Pressable>
            </>}

          </Card></View>
          <Modal visible={selectedId === m.id} animationType="slide" onRequestClose={() => { setSelectedId(null); setConfirmId(null); }}><SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: '#F8F7FC' }}><ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}><Button title="Quay lại lịch trình" onPress={() => { setSelectedId(null); setConfirmId(null); }} /><ActivityPhoto campaignId={m.campaignId} /><Card>
            <Text style={s.time}>{time(m.startTime)}–{time(m.endTime)}{m.startTime.slice(0, 10) !== m.endTime.slice(0, 10) ? ` · kết thúc ${dateTime(m.endTime)}` : ''}</Text>
            <Text style={typography.heading}>{m.title}</Text>
            <Text style={[s.status, status === 'HOAN_THANH' && s.success, status === 'CHO_CAP_NHAT_KET_QUA' && s.warning]}>{statusLabels[status]}</Text>
            <Text style={s.body}>{m.location}</Text><Text style={s.body}>{m.description}</Text>
            <Text style={s.body}>Phụ trách: {name(m.responsibleId)}</Text>
            <Text style={s.body}>{m.volunteerCount} tình nguyện viên</Text>
            {count.total > 0 ? <View style={s.list}><Text style={s.time}>{count.completed}/{count.total} công việc hoàn thành</Text><View style={{ height: 6, borderRadius: 3, backgroundColor: theme.buttons.secondaryBackground, overflow: 'hidden' }}><View style={{ height: 6, width: `${Math.round(count.completed / count.total * 100)}%`, backgroundColor: theme.buttons.gradient[1] }} /></View></View> : <Text style={s.body}>Chưa liên kết công việc.</Text>}
            {mine.length > 0 && <><Text style={s.body}>Bạn có công việc trong hoạt động này</Text><Button title="Xem công việc" onPress={() => { setSelectedId(null); router.push({ pathname: '/assignments', params: { milestoneId: m.id } }); }} /></>}
            {m.completedAt && m.completedBy ? <Text style={s.success}>Xác nhận bởi {name(m.completedBy)} · {dateTime(m.completedAt)}</Text> : null}
            {canComplete(m, actor, data, now) && (confirmId === m.id ? <View style={s.list}>
              <Text style={s.body}>Xác nhận hoạt động đã hoàn thành? Thao tác này chỉ ghi nhận kết quả hoạt động, không thay đổi task.</Text>
              <Button title="Xác nhận kết quả hoạt động" onPress={() => {
                try {
                  const current = scheduleSession.read().find(x => x.id === m.id);
                  if (!current) throw Error('Không tìm thấy hoạt động.');
                  scheduleSession.save(completeMilestone(current, actor, demoSession.read(), m.version, new Date().toISOString()));
                  setItems([...scheduleSession.read()]); setConfirmId(null); setError('');
                } catch (e) { setError(e instanceof Error ? e.message : 'Không thể xác nhận.'); }
              }} />
              <Button title="Hủy" onPress={() => setConfirmId(null)} />
            </View> : <Button title="Xác nhận hoạt động hoàn thành" onPress={() => setConfirmId(m.id)} />)}
          </Card>{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}</ScrollView></SafeAreaView></SafeAreaProvider></Modal>
        </View>;
      })}
    </View>)}
  </View>;
}
const s = StyleSheet.create({ dayTab: { minWidth: 94, padding: 12, gap: 4, alignItems: 'center', borderRadius: 13, borderWidth: 1, borderColor: '#E4E8F3', backgroundColor: '#FFFFFF' }, daySelected: { borderColor: '#8DABF1', backgroundColor: '#EEF2FF' }, summary: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 64 }, activityTitle: { fontSize: 16, lineHeight: 23, fontWeight: '700', color: '#122453' }, progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden', backgroundColor: '#E7EDFA' }, progressFill: { height: 7, backgroundColor: '#7BAAFF' }, taskNotice: { padding: 10, gap: 8, backgroundColor: '#F3F0FD', borderRadius: 12 }, list: { gap: 14 }, people: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, body: { fontSize: 14, lineHeight: 21, color: theme.colors.muted }, day: { fontSize: 18, fontWeight: '700', color: theme.colors.text }, timeline: { flexDirection: 'row', gap: 10 }, track: { width: 12, alignItems: 'center' }, dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.buttons.primaryText, marginTop: 8 }, line: { width: 1, flex: 1, backgroundColor: theme.colors.border, marginTop: 5 }, card: { flex: 1 }, time: { fontSize: 14, fontWeight: '700', color: theme.colors.text }, status: { color: theme.buttons.primaryText, fontWeight: '600' }, success: { color: '#267050', lineHeight: 21 }, warning: { color: '#915F16' }, error: { color: '#B12E46' } });
