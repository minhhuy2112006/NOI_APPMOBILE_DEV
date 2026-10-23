import { Alert, Linking } from 'react-native';
import { demoSession } from '../assignments/demo';
import { takeEvidence } from './device';
import { PermissionError } from './captureFlow';
import { eligibility, type Activity, type Kind } from './model';
import { loadActivities, loadRecords, saveAttendance } from './store';

let active = false;
export async function directAttendance(campaignId: string, user: string) {
  if (active) return;
  active = true;
  try {
    const [activities, records] = await Promise.all([loadActivities(), loadRecords(user)]);
    const candidates: { activity: Activity; kind: Kind }[] = [];
    let reason = 'Chiến dịch chưa có lịch điểm danh.';
    for (const activity of activities.filter(a => a.campaignId === campaignId)) {
      const record = records.find(r => r.activity.id === activity.id);
      const kind = record ? 'out' : 'in';
      try {
        eligibility(activity, demoSession.read().applications, user, kind, record, Date.now());
        candidates.push({ activity, kind });
      } catch (error) { reason = error instanceof Error ? error.message : reason; }
    }
    if (!candidates.length) throw Error(reason);
    let selected = candidates[0];
    // Never silently record attendance for a different simultaneous activity.
    if (candidates.length > 1) {
      const index = await new Promise<number>(resolve => {
        const show = (i: number) => Alert.alert('Chọn hoạt động điểm danh', `${i + 1}/${candidates.length} · ${candidates[i].activity.title}\n${candidates[i].activity.location}`, [
          { text: 'Hủy', style: 'cancel', onPress: () => resolve(-1) },
          { text: 'Hoạt động tiếp', onPress: () => setTimeout(() => show((i + 1) % candidates.length), 250) },
          { text: 'Chụp ảnh', onPress: () => resolve(i) },
        ], { cancelable: true, onDismiss: () => resolve(-1) });
        show(0);
      });
      if (index < 0) return;
      selected = candidates[index];
    }
    const capture = await takeEvidence();
    if (!capture) return;
    if (demoSession.actor() !== user) throw Error('Tài khoản đã thay đổi. Vui lòng điểm danh lại.');
    await saveAttendance(selected.activity, user, selected.kind, capture);
    Alert.alert('Điểm danh thành công', `${selected.activity.title}\n${selected.kind === 'in' ? 'Đã check-in' : 'Đã check-out'}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể điểm danh. Vui lòng thử lại.';
    Alert.alert('Điểm danh', message, error instanceof PermissionError && !error.canAskAgain ? [
      { text: 'Đóng', style: 'cancel' },
      { text: 'Mở cài đặt', onPress: () => { void Linking.openSettings().catch(() => Alert.alert('Quyền truy cập', 'Vui lòng mở Cài đặt của điện thoại để cấp quyền cho NOI.')); } },
    ] : [{ text: 'Đóng' }]);
  } finally { active = false; }
}
