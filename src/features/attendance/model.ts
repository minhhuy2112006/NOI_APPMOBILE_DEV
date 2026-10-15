export type Activity = { id: string; campaignId: string; campaignTitle: string; title: string; start: string; end: string; location: string; latitude: number | null; longitude: number | null; campaignStatus: string };
export type Registration = { user_id: string; campaign_id: string; status: string };
export type Evidence = { photo: string; latitude: number; longitude: number; accuracy: number; distance: number; time: string; capturedAt: number; locationAt: number };
export type Attendance = { activity: Activity; userId: string; checkIn: Evidence; checkOut: Evidence | null; actualDuration: number | null };
export type Capture = { photo: string; capturedAt: number; latitude: number; longitude: number; accuracy: number | null; locationAt: number; mocked?: boolean };
export type Kind = 'in' | 'out';
export type AttendanceStatus = 'CHUA_CHECK_IN' | 'DA_CHECK_IN' | 'DANG_THAM_GIA' | 'CHO_CHECK_OUT' | 'HOAN_TAT';
export const labels: Record<AttendanceStatus, string> = { CHUA_CHECK_IN: 'Chưa check-in', DA_CHECK_IN: 'Đã check-in', DANG_THAM_GIA: 'Đang tham gia', CHO_CHECK_OUT: 'Chờ check-out', HOAN_TAT: 'Hoàn tất' };
export function approved(activities: Activity[], applications: Registration[], userId: string) { return activities.filter(a => applications.some(r => r.user_id === userId && r.campaign_id === a.campaignId && r.status === 'confirmed')); }
export function distanceMeters(lat: number, lng: number, targetLat: number, targetLng: number) {
  const rad = Math.PI / 180;
  const h = Math.sin((targetLat - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(targetLat * rad) * Math.sin((targetLng - lng) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}
export function status(a: Activity, record: Attendance | undefined, now: number): AttendanceStatus {
  if (record?.checkOut) return 'HOAN_TAT';
  if (!record) return 'CHUA_CHECK_IN';
  if (now < Date.parse(a.start)) return 'DA_CHECK_IN';
  return now < Date.parse(a.end) ? 'DANG_THAM_GIA' : 'CHO_CHECK_OUT';
}
export function eligibility(a: Activity, registrations: Registration[], userId: string, kind: Kind, record: Attendance | undefined, now: number) {
  if (!approved([a], registrations, userId).length) throw Error('Bạn chưa được tổ chức xác nhận tham gia.');
  if (!['published', 'active'].includes(a.campaignStatus)) throw Error('Chiến dịch chưa mở điểm danh.');
  if (!Number.isFinite(Date.parse(a.start)) || !Number.isFinite(Date.parse(a.end)) || now < Date.parse(a.start) - 3600000 || now > Date.parse(a.end) + 7200000) throw Error('Ngoài khung giờ điểm danh: mở trước 60 phút, đóng sau hoạt động 2 giờ.');
  if (kind === 'in' && record) throw Error('Bạn đã check-in.');
  if (kind === 'out' && (!record || record.checkOut)) throw Error('Cần check-in trước hoặc bạn đã check-out.');
  if (record && (record.userId !== userId || record.activity.id !== a.id)) throw Error('Thông tin điểm danh không khớp.');
  if (a.latitude === null || a.longitude === null || !validCoordinate(a.latitude, a.longitude)) throw Error('Hoạt động chưa có tọa độ địa điểm được xác nhận.');
}
function validCoordinate(lat: number, lng: number) { return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180; }
export function validateCapture(a: Activity, capture: Capture, now: number, record?: Attendance) {
  if (!capture.photo || !Number.isFinite(capture.capturedAt) || capture.capturedAt > now || now - capture.capturedAt > 120000) throw Error('Ảnh đã hết hạn. Vui lòng chụp lại.');
  if (!Number.isFinite(capture.locationAt) || capture.locationAt < capture.capturedAt || capture.locationAt > now || now - capture.locationAt > 60000) throw Error('GPS không còn mới. Vui lòng chụp ảnh và lấy lại vị trí.');
  if (record && (capture.locationAt <= record.checkIn.locationAt || capture.capturedAt <= record.checkIn.capturedAt || capture.photo === record.checkIn.photo)) throw Error('Check-out cần ảnh và GPS mới, không sử dụng dữ liệu check-in.');
  if (capture.mocked || !validCoordinate(capture.latitude, capture.longitude) || capture.accuracy === null || !Number.isFinite(capture.accuracy) || capture.accuracy < 0 || capture.accuracy > 100) throw Error('GPS chưa đủ chính xác. Hãy ra nơi thoáng và thử lại.');
  if (a.latitude === null || a.longitude === null || !validCoordinate(a.latitude, a.longitude)) throw Error('Hoạt động chưa có tọa độ địa điểm được xác nhận.');
  const distance = distanceMeters(capture.latitude, capture.longitude, a.latitude, a.longitude);
  if (distance > 100) throw Error('Bạn chưa ở trong khu vực diễn ra hoạt động.');
  return distance;
}
export function confirm(a: Activity, registrations: Registration[], userId: string, kind: Kind, capture: Capture, record: Attendance | undefined, now: number): Attendance {
  eligibility(a, registrations, userId, kind, record, now);
  const distance = validateCapture(a, capture, now, kind === 'out' ? record : undefined);
  const evidence: Evidence = { ...capture, accuracy: capture.accuracy!, distance, time: new Date(now).toISOString() };
  if (kind === 'in') return { activity: a, userId, checkIn: evidence, checkOut: null, actualDuration: null };
  const duration = now - Date.parse(record!.checkIn.time);
  if (duration < 0) throw Error('Thời gian check-out không hợp lệ.');
  return { ...record!, checkOut: evidence, actualDuration: duration };
}
export const dayKey = (time: number) => new Date(time + 7 * 3600000).toISOString().slice(0, 10);
export function durationLabel(ms: number) { const minutes = Math.floor(ms / 60000); return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`; }
export function monthCells(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: Math.ceil(((start + 6) % 7 + count) / 7) * 7 }, (_, i) => { const day = i - (start + 6) % 7 + 1; return day >= 1 && day <= count ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null; });
}
