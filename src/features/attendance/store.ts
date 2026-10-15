import Storage from 'expo-sqlite/kv-store';
import { Directory, File, Paths } from 'expo-file-system';
import { demoSession } from '../assignments/demo';
import { scheduleSession } from '../schedule/demo';
import { confirm, type Activity, type Attendance, type Capture, type Kind } from './model';

export const sampleActivityId = 'mam-xanh-milestone-0';
export const sampleAddress = '540 Lã Xuân Oai, Long Trường, Thủ Đức, Thành phố Hồ Chí Minh';
type Venue = { latitude: number; longitude: number };
const key = (user: string) => `noi.attendance.local.v1.${user}`;
export async function loadRecords(user: string): Promise<Attendance[]> { const value = await Storage.getItem(key(user)); return value ? JSON.parse(value) : []; }
export async function loadActivities(): Promise<Activity[]> {
  const value = await Storage.getItem('noi.attendance.sampleVenue.v1');
  const venue: Venue | null = value ? JSON.parse(value) : null;
  return scheduleSession.read().map(m => ({ id: m.id, campaignId: m.campaignId, campaignTitle: demoSession.read().campaigns.find(c => c.id === m.campaignId)?.title ?? m.campaignId, title: m.title, start: m.startTime, end: m.endTime, location: m.id === sampleActivityId ? sampleAddress : m.location, latitude: m.id === sampleActivityId ? venue?.latitude ?? null : null, longitude: m.id === sampleActivityId ? venue?.longitude ?? null : null, campaignStatus: 'published' }));
}
export async function saveSampleVenue(venue: Venue) {
  if (!Number.isFinite(venue.latitude) || !Number.isFinite(venue.longitude) || Math.abs(venue.latitude) > 90 || Math.abs(venue.longitude) > 180) throw Error('Tọa độ không hợp lệ.');
  await Storage.setItem('noi.attendance.sampleVenue.v1', JSON.stringify(venue));
}
let saving = false;
export async function saveAttendance(activity: Activity, user: string, kind: Kind, capture: Capture) {
  if (saving) throw Error('Đang lưu điểm danh.');
  saving = true;
  let savedPhoto: File | null = null;
  try {
    const records = await loadRecords(user);
    const current = (await loadActivities()).find(a => a.id === activity.id);
    if (!current) throw Error('Hoạt động không còn tồn tại.');
    const next = confirm(current, demoSession.read().applications, user, kind, capture, records.find(r => r.activity.id === activity.id), Date.now());
    const folder = new Directory(Paths.document, 'attendance-evidence');
    folder.create({ intermediates: true, idempotent: true });
    savedPhoto = new File(folder, `${user}-${activity.id}-${kind}-${Date.now()}.jpg`);
    await new File(capture.photo).copy(savedPhoto);
    if (kind === 'in') next.checkIn.photo = savedPhoto.uri; else next.checkOut!.photo = savedPhoto.uri;
    const updated = [...records.filter(r => r.activity.id !== activity.id), next];
    await Storage.setItem(key(user), JSON.stringify(updated));
    return updated;
  } catch (e) { if (savedPhoto?.exists) savedPhoto.delete(); throw e; }
  finally { saving = false; }
}

