import { ActivityPhoto, CaptureSteps, StatusPill } from '../../components/ActivityPresentation';
import { useAssistantContext } from '../assistant/Assistant';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { Button, Card, Chip, typography } from '../../components/ui';
import { theme } from '../../theme/tokens';
import { demoSession } from '../assignments/demo';
import { approved, dayKey, durationLabel, eligibility, labels, monthCells, status, validateCapture, type Activity, type Attendance, type Capture, type Kind } from './model';
import { PermissionError } from './captureFlow';
import { takeEvidence } from './device';
import { loadActivities, loadRecords, sampleAddress, sampleActivityId, saveAttendance, saveSampleVenue } from './store';

const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
type Filter = 'all' | 'today' | 'upcoming' | 'active' | 'history';
export default function AttendanceScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [user, setUser] = useState(demoSession.actor);
  const [now, setNow] = useState(Date.now);
  const [month, setMonth] = useState(() => dayKey(Date.now()).slice(0, 7));
  const [day, setDay] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [permission, setPermission] = useState(false);
  const [pending, setPending] = useState<{ activity: Activity; kind: Kind; capture: Capture; distance: number } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [result, setResult] = useState<Attendance | null>(null);
  const [showVenue, setShowVenue] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [venues, setVenues] = useState<Location.LocationGeocodedLocation[]>([]);
  const lock = useRef(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const token = ++generation.current;
    setReady(false);
    try {
      const id = demoSession.actor();
      const [nextActivities, nextRecords] = await Promise.all([loadActivities(), loadRecords(id)]);
      if (token !== generation.current) return;
      setUser(id); setActivities(nextActivities); setRecords(nextRecords); setReady(true); setError(''); setNow(Date.now());
    } catch (e) { if (token === generation.current) setError(e instanceof Error ? e.message : 'Không tải được điểm danh.'); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); return () => { generation.current++; }; }, [refresh]));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice(''); setPermission(false);
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể thực hiện. Hãy thử lại.'); setPermission(e instanceof PermissionError); }
    finally { lock.current = false; setBusy(false); }
  };
  const begin = (activity: Activity) => void run(async () => {
    setPending(null);
    const record = records.find(r => r.activity.id === activity.id);
    const kind: Kind = record ? 'out' : 'in';
    eligibility(activity, demoSession.read().applications, user, kind, record, Date.now());
    const capture = await takeEvidence();
    if (!capture) return;
    const distance = validateCapture(activity, capture, Date.now(), kind === 'out' ? record : undefined);
    setPending({ activity, kind, capture, distance });
  });
  const allowed = approved(activities, demoSession.read().applications, user);
  const items = [...allowed, ...records.filter(r => !allowed.some(a => a.id === r.activity.id)).map(r => r.activity)].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const [year, monthNumber] = month.split('-').map(Number);
  const sections: [string, Activity[]][] = [['Hoạt động hôm nay', []], ['Hoạt động đang tham gia', []], ['Hoạt động sắp tới', []], ['Đã hoàn thành / lịch sử', []]];
  for (const activity of items) {
    const record = records.find(r => r.activity.id === activity.id);
    const today = dayKey(Date.parse(activity.start)) <= dayKey(now) && dayKey(Date.parse(activity.end)) >= dayKey(now);
    const active = !!record && !record.checkOut;
    const upcoming = Date.parse(activity.start) > now && !record;
    if (day && !(dayKey(Date.parse(activity.start)) <= day && dayKey(Date.parse(activity.end)) >= day)) continue;
    if (filter === 'today' && !today || filter === 'upcoming' && !upcoming || filter === 'active' && !active || filter === 'history' && !record?.checkOut) continue;
    const section = record?.checkOut ? 3 : active ? 1 : today ? 0 : upcoming ? 2 : 3;
    sections[section][1].push(activity);
  }
  const shiftMonth = (step: number) => { const d = new Date(Date.UTC(year, monthNumber - 1 + step, 1)); setMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`); setDay(null); };
  useAssistantContext('Điểm danh', { filter, selectedActivity: pending?.activity.id ?? null, hasAttendanceError: !!error, rules: { radiusMeters: 100, requiresCamera: true, requiresFreshGPS: true }, activities: items.slice(0, 30).map(a => { const r = records.find(r => r.activity.id === a.id); return { id: a.id, title: a.title, status: status(a, r, now), checkedIn: !!r, checkedOut: !!r?.checkOut, start: a.start, end: a.end }; }) });
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={s.fill}>
    <Stack.Screen options={{ title: 'Điểm danh', headerShown: true, headerTintColor: '#122453', headerBackButtonDisplayMode: 'minimal' }} />
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.body}>Hồ sơ mẫu: {demoSession.read().people.find(p => p.id === user)?.name}. Ảnh và GPS dùng thiết bị thật; kết quả chỉ lưu trên máy, chưa gửi tổ chức.</Text>
      {!ready && <Button title="Tải lại dữ liệu" onPress={() => void refresh()} />}
      {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
      {permission && <><Text style={s.body}>Bạn có thể cấp quyền trong Cài đặt rồi thử lại thao tác chụp ảnh.</Text><Button title="Mở cài đặt quyền" onPress={() => void Linking.openSettings().catch(() => setError('Không mở được Cài đặt. Vui lòng mở thủ công.'))} /></>}
      {notice ? <Text accessibilityLiveRegion="polite" style={s.success}>{notice}</Text> : null}
      <Card>
        <View style={s.row}><Pressable accessibilityRole="button" accessibilityLabel="Tháng trước" onPress={() => shiftMonth(-1)} style={s.monthArrow}><Text style={s.title}>‹</Text></Pressable><Text style={s.title}>Tháng {monthNumber}, {year}</Text><Pressable accessibilityRole="button" accessibilityLabel="Tháng sau" onPress={() => shiftMonth(1)} style={s.monthArrow}><Text style={s.title}>›</Text></Pressable></View>
        <View style={s.calendar}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <Text key={d} style={s.weekday}>{d}</Text>)}{monthCells(year, monthNumber - 1).map((d, index) => {
          const hasActivity = d && items.some(a => dayKey(Date.parse(a.start)) <= d && dayKey(Date.parse(a.end)) >= d);
          return <Pressable key={d ?? `blank-${index}`} disabled={!d} accessibilityRole="button" accessibilityLabel={d ? `${d}${hasActivity ? ', có hoạt động' : ''}` : undefined} accessibilityState={{ selected: day === d && !!d }} onPress={() => setDay(day === d ? null : d)} style={[s.cell, day === d && !!d && s.selected]}><Text style={[s.calendarDay, day === d && !!d && { color: '#FFFFFF' }]}>{d ? Number(d.slice(-2)) : ''}</Text>{hasActivity ? <View style={s.dot} /> : null}</Pressable>;
        })}</View>
        {day ? <Button title={`Bỏ lọc ngày ${day}`} onPress={() => setDay(null)} /> : null}
      </Card>
      <View style={s.row}>{([['all', 'Tất cả'], ['today', 'Hôm nay'], ['upcoming', 'Sắp tới'], ['active', 'Đang tham gia'], ['history', 'Đã hoàn thành']] as const).map(([value, label]) => <Chip key={value} label={label} selected={filter === value} onPress={() => setFilter(value)} />)}</View>
      {ready && sections.every(([, list]) => list.length === 0) && <Text style={s.body}>Không có hoạt động phù hợp. Chỉ đăng ký được tổ chức xác nhận mới có thể điểm danh.</Text>}
      {sections.map(([heading, list]) => list.length ? <View key={heading} style={s.section}><Text style={typography.heading}>{heading}</Text>{list.map(activity => {
        const record = records.find(r => r.activity.id === activity.id);
        let blocked = '';
        try { eligibility(activity, demoSession.read().applications, user, record ? 'out' : 'in', record, now); } catch (e) { blocked = e instanceof Error ? e.message : 'Chưa thể điểm danh.'; }
        return <Card key={activity.id}>
          <View style={{ flexDirection: 'row', gap: 12 }}><ActivityPhoto campaignId={activity.campaignId} compact /><View style={{ flex: 1, gap: 6 }}><Text style={s.title}>{activity.title}</Text><Text style={s.body}>{activity.campaignTitle}</Text></View></View>
          <Text style={s.body}>{dateTime(activity.start)} → {dateTime(activity.end)}</Text><Text style={s.body}>{activity.location}</Text>
          <StatusPill label={labels[status(activity, record, now)]} tone={record?.checkOut ? 'success' : record ? 'info' : 'warning'} /><Button title={selectedActivity === activity.id ? "Thu gọn" : "Xem chi tiết hoạt động"} onPress={() => setSelectedActivity(selectedActivity === activity.id ? null : activity.id)} />
          {record && <View style={s.attendanceTrack}>
            <View style={s.attendanceStep}><Text style={s.stepDone}>✓</Text><Text style={s.stepLabel}>Check-in</Text><Text style={s.stepLabel}>{new Date(record.checkIn.time).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })}</Text></View>
            <View style={s.stepLine} /><View style={s.attendanceStep}><Text style={record.checkOut ? s.stepDone : s.stepActive}>●</Text><Text style={s.stepLabel}>{record.checkOut ? 'Hoàn tất' : 'Đang tham gia'}</Text></View><View style={s.stepLine} />
            <View style={s.attendanceStep}><Text style={record.checkOut ? s.stepDone : s.stepIdle}>{record.checkOut ? '✓' : '○'}</Text><Text style={s.stepLabel}>Check-out</Text>{record.checkOut && <Text style={s.stepLabel}>{new Date(record.checkOut.time).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })}</Text>}</View>
          </View>}
          {!record?.checkOut && !blocked && <><Button title={record ? 'Chụp ảnh check-out' : 'Chụp ảnh check-in'} disabled={busy || !ready} loading={busy} onPress={() => begin(activity)} /><Text style={s.stepLabel}>Ảnh mới và GPS trong bán kính 100 m</Text></>}
          {record?.checkOut && <Text style={s.success}>Tổng thời gian: {durationLabel(record.actualDuration ?? 0)}</Text>}
          {selectedActivity === activity.id && <>
          {record && <Text style={s.body}>Check-in: {dateTime(record.checkIn.time)}</Text>}
          {record?.checkOut && <><Text style={s.body}>Check-out: {dateTime(record.checkOut.time)}</Text><Text style={s.success}>{durationLabel(record.actualDuration ?? 0)}</Text></>}
          {record && <Button title="Xem ảnh check-in" onPress={() => setPhoto(record.checkIn.photo)} />}
          {record?.checkOut && <Button title="Xem ảnh check-out" onPress={() => setPhoto(record.checkOut!.photo)} />}
          {!record?.checkOut && !!blocked && <><Text style={s.body}>{blocked || 'Chụp ảnh tại hoạt động và xác nhận GPS trong bán kính 100 m.'}</Text><Button title={record ? 'Check-out' : 'Check-in'} disabled={!!blocked || busy || !ready} loading={busy} onPress={() => begin(activity)} /></>}
          </>}
        </Card>;
      })}</View> : null)}
      <Button title={showVenue ? "Ẩn cấu hình địa điểm mẫu" : "Cấu hình địa điểm mẫu"} onPress={() => setShowVenue(!showVenue)} />
      {showVenue && <Card>
        <Text style={s.title}>Địa điểm thử nghiệm Mầm Xanh</Text><Text style={s.body}>{sampleAddress}. Cấu hình chỉ dành cho dữ liệu mẫu; kiểm tra đúng ghim trước khi lưu.</Text>
        <Button title="Tra tọa độ địa chỉ mẫu" disabled={busy} onPress={() => void run(async () => {
          const p = await Location.requestForegroundPermissionsAsync(); if (!p.granted) throw new PermissionError('location', p.canAskAgain);
          const results = await Location.geocodeAsync(sampleAddress); setVenues(results);
          if (!results.length) throw Error('Không tìm thấy tọa độ. Cần ghim bản đồ chính xác từ tổ chức.');
        })} />
        {venues.map((v, index) => <View key={index} style={s.section}><Text style={s.body}>{v.latitude.toFixed(6)}, {v.longitude.toFixed(6)}</Text><Button title="Kiểm tra ghim trên bản đồ" onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${v.latitude},${v.longitude}`).catch(() => setError('Không mở được bản đồ.'))} /><Button title="Đúng địa điểm mẫu — lưu tọa độ" disabled={busy || records.some(r => r.activity.id === sampleActivityId)} onPress={() => void run(async () => { await saveSampleVenue(v); setActivities(await loadActivities()); setVenues([]); setNotice('Đã lưu tọa độ địa điểm mẫu. Khung giờ hoạt động vẫn được giữ nguyên.'); })} /></View>)}
      </Card>}
    </ScrollView>
    <Modal visible={!!pending || !!photo || !!result} animationType="slide" onRequestClose={() => { if (!busy) { setPending(null); setPhoto(null); setResult(null); } }}>
      <SafeAreaProvider><SafeAreaView style={s.fill}><ScrollView contentContainerStyle={s.content}>
        <Button title="Đóng" disabled={busy} onPress={() => { setPending(null); setPhoto(null); setResult(null); }} />
        {pending && <CaptureSteps step={2} />}
        {(pending?.capture.photo || photo) && <Image source={{ uri: pending?.capture.photo ?? photo! }} resizeMode="contain" style={s.photo} />}
        {pending && <><Text style={s.title}>{pending.kind === 'in' ? 'Xác nhận check-in' : 'Xác nhận check-out'}</Text><Text style={s.body}>Khoảng cách: {pending.distance.toFixed(1)} m · Sai số GPS: {pending.capture.accuracy?.toFixed(0)} m</Text><Text style={s.body}>Ảnh/GPS chỉ có hiệu lực trong thời gian ngắn. Nếu quá hạn, hãy đóng và chụp lại.</Text><Button title="Xác nhận điểm danh" loading={busy} onPress={() => void run(async () => { const next = await saveAttendance(pending.activity, user, pending.kind, pending.capture); setRecords(next); setResult(next.find(r => r.activity.id === pending.activity.id) ?? null); setPending(null); setNotice('Đã lưu điểm danh trên thiết bị.'); setNow(Date.now()); })} /></>}
        {result && <><CaptureSteps step={3} /><Text style={typography.heading}>{result.checkOut ? 'Hoàn tất điểm danh!' : 'Check-in thành công!'}</Text><StatusPill label="Đã lưu trên thiết bị" tone="success" /><Text style={s.title}>{result.activity.title}</Text><Card><Text style={s.body}>{result.activity.location}</Text><Text style={s.body}>Check-in: {dateTime(result.checkIn.time)}</Text>{result.checkOut ? <><Text style={s.body}>Check-out: {dateTime(result.checkOut.time)}</Text><Text style={s.success}>{durationLabel(result.actualDuration ?? 0)}</Text></> : null}<Text style={s.body}>Khoảng cách: {(result.checkOut ?? result.checkIn).distance.toFixed(1)} m</Text><Image source={{ uri: (result.checkOut ?? result.checkIn).photo }} resizeMode="contain" style={{ width: '100%', height: 160 }} /></Card><Text style={s.body}>Kết quả chưa gửi lên tổ chức vì chưa kết nối backend.</Text><Button title="Quay về điểm danh" onPress={() => setResult(null)} /></>}
        {error ? <Text style={s.error}>{error}</Text> : null}
      </ScrollView></SafeAreaView></SafeAreaProvider>
    </Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({ monthArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, calendarDay: { fontSize: 13, color: '#122453' }, attendanceTrack: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 }, attendanceStep: { alignItems: 'center', gap: 4, flex: 1 }, stepLine: { height: 1, width: 20, marginTop: 13, backgroundColor: '#C9D5E8' }, stepLabel: { fontSize: 11, lineHeight: 16, color: '#62708A', textAlign: 'center' }, stepDone: { fontSize: 18, color: '#329968' }, stepActive: { fontSize: 18, color: '#7871E8' }, stepIdle: { fontSize: 18, color: '#B6BED0' }, fill: { flex: 1, backgroundColor: '#F8FAFF' }, content: { padding: 16, paddingBottom: 84, gap: 16, maxWidth: 680, width: '100%', alignSelf: 'center' }, section: { gap: 12 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }, title: { fontSize: 15, fontWeight: '700', color: '#122453' }, body: { fontSize: 14, lineHeight: 21, color: theme.colors.muted }, calendar: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.2857%', textAlign: 'center', paddingVertical: 8, color: '#122453' }, cell: { width: '14.2857%', minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }, selected: { backgroundColor: '#6B9FF7' }, dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#41466B' }, error: { color: '#B12E46', lineHeight: 21 }, success: { color: '#267050', lineHeight: 21 }, photo: { width: '100%', height: 400 } });

