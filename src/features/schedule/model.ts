import type { Person, Snapshot } from '../assignments/model';
export type MilestoneStatus = 'SAP_DIEN_RA' | 'DANG_DIEN_RA' | 'CHO_CAP_NHAT_KET_QUA' | 'HOAN_THANH';
export type Milestone = {
  id: string; campaignId: string; groupId: string | null; title: string;
  date: string; startTime: string; endTime: string; location: string; description: string;
  responsibleId: string; volunteerCount: number; taskIds: string[];
  completedAt: string | null; completedBy: string | null; version: number;
};
export const statusLabels: Record<MilestoneStatus, string> = { SAP_DIEN_RA: 'Sắp diễn ra', DANG_DIEN_RA: 'Đang diễn ra', CHO_CAP_NHAT_KET_QUA: 'Chờ cập nhật kết quả', HOAN_THANH: 'Hoàn thành' };
// startTime/endTime are full ISO timestamps (including offset), also supporting overnight activities.
export function milestoneStatus(m: Milestone, now = Date.now()): MilestoneStatus {
  if (m.completedAt && m.completedBy) return 'HOAN_THANH';
  if (now < Date.parse(m.startTime)) return 'SAP_DIEN_RA';
  return now < Date.parse(m.endTime) ? 'DANG_DIEN_RA' : 'CHO_CAP_NHAT_KET_QUA';
}
export function byDay(items: Milestone[]) {
  const days: { date: string; items: Milestone[] }[] = [];
  for (const item of [...items].sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime) || a.id.localeCompare(b.id))) {
    let day = days.find(d => d.date === item.date);
    if (!day) { day = { date: item.date, items: [] }; days.push(day); }
    day.items.push(item);
  }
  return days;
}
export function linkedAssignments(m: Milestone, data: Snapshot) {
  const taskIds = new Set(data.tasks.filter(t => m.taskIds.includes(t.id) && data.groups.some(g => g.id === t.group_id && g.campaign_id === m.campaignId)).map(t => t.id));
  return data.assignments.filter(a => taskIds.has(a.task_id));
}
export function progress(m: Milestone, data: Snapshot) {
  const assignments = linkedAssignments(m, data);
  return { total: assignments.length, completed: assignments.filter(a => a.status === 'HOAN_THANH').length };
}
export function canComplete(m: Milestone, actor: Person, data: Snapshot, now = Date.now()) {
  const group = data.groups.find(g => g.id === m.groupId && g.campaign_id === m.campaignId);
  return !m.completedAt && !m.completedBy && now >= Date.parse(m.startTime) && (actor.id === m.responsibleId || group?.leader_id === actor.id);
}
export function completeMilestone(m: Milestone, actor: Person, data: Snapshot, version: number, now: string): Milestone {
  if (version !== m.version) throw Error('Hoạt động đã thay đổi. Vui lòng tải lại.');
  if (!Number.isFinite(Date.parse(now)) || !canComplete(m, actor, data, Date.parse(now))) throw Error('Bạn không có quyền xác nhận hoặc hoạt động chưa bắt đầu/đã hoàn thành.');
  return { ...m, completedAt: now, completedBy: actor.id, version: m.version + 1 };
}
