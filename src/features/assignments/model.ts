export type Status = 'DA_PHAN_CONG' | 'DANG_THUC_HIEN' | 'CHO_XAC_NHAN' | 'HOAN_THANH' | 'CAN_THUC_HIEN_LAI';
export type DisplayStatus = Status | 'QUA_HAN';
export const labels: Record<DisplayStatus, string> = { DA_PHAN_CONG: 'Đã phân công', DANG_THUC_HIEN: 'Đang thực hiện', CHO_XAC_NHAN: 'Chờ xác nhận', HOAN_THANH: 'Hoàn thành', CAN_THUC_HIEN_LAI: 'Cần thực hiện lại', QUA_HAN: 'Quá hạn' };
// IDs map to existing profiles / campaigns / applications when connected.
export type Person = { id: string; name: string; role: 'volunteer' | 'organizer' | 'admin'; organization_id: string | null };
export type CampaignRef = { id: string; title: string; organization_id: string };
export type ApplicationRef = { id: string; user_id: string; campaign_id: string; status: string };
export type Group = { id: string; campaign_id: string; name: string; leader_id: string; member_ids: string[] };
export type Task = { id: string; group_id: string; title: string; description: string; starts_at: string; ends_at: string; location: string; deadline: string | null; requirements: string };
export type Assignment = { id: string; task_id: string; member_id: string; application_id: string; assigned_by: string; assigned_at: string; status: Status; version: number; submitted_at: string | null; confirmed_by: string | null; confirmed_at: string | null; rework_reason: string | null; source: 'manual' | 'excel'; source_key: string | null };
export type Event = { assignment_id: string; actor_id: string; at: string; from: Status; to: Status; reason: string | null };
export type Snapshot = { people: Person[]; campaigns: CampaignRef[]; applications: ApplicationRef[]; groups: Group[]; tasks: Task[]; assignments: Assignment[]; events: Event[] };
export type Command = { assignment_id: string; expected_version: number } & ({ action: 'start' | 'submit' | 'confirm' } | { action: 'rework'; reason: string });
export type TaskDraft = Omit<Task, 'id'> & { member_ids: string[] };

export function canManage(s: Snapshot, actor: Person, group: Group) {
  const campaign = s.campaigns.find(c => c.id === group.campaign_id);
  return !!campaign && (group.leader_id === actor.id || (actor.role === 'organizer' && actor.organization_id === campaign.organization_id));
}
export function displayStatus(a: Assignment, task: Task, now = Date.now()): DisplayStatus {
  return task.deadline && Date.parse(task.deadline) < now && ['DA_PHAN_CONG', 'DANG_THUC_HIEN', 'CAN_THUC_HIEN_LAI'].includes(a.status) ? 'QUA_HAN' : a.status;
}
export function context(s: Snapshot, a: Assignment) {
  const task = s.tasks.find(t => t.id === a.task_id);
  const group = s.groups.find(g => g.id === task?.group_id);
  if (!task || !group) throw Error('Không tìm thấy công việc hoặc nhóm.');
  return { task, group };
}
export function allowedActions(s: Snapshot, actor: Person, a: Assignment): Command['action'][] {
  const { group } = context(s, a);
  if (actor.id === a.member_id) {
    if (a.status === 'DA_PHAN_CONG' || a.status === 'CAN_THUC_HIEN_LAI') return ['start'];
    if (a.status === 'DANG_THUC_HIEN') return ['submit'];
    return [];
  }
  return canManage(s, actor, group) && a.status === 'CHO_XAC_NHAN' ? ['confirm', 'rework'] : [];
}
export function transition(s: Snapshot, actor: Person, cmd: Command, now: string): Snapshot {
  const a = s.assignments.find(x => x.id === cmd.assignment_id);
  if (!a) throw Error('Không tìm thấy phân công.');
  if (a.version !== cmd.expected_version) throw Error('Công việc đã thay đổi. Vui lòng tải lại.');
  if (!allowedActions(s, actor, a).includes(cmd.action)) throw Error('Bạn không có quyền thực hiện thao tác này ở trạng thái hiện tại.');
  const reason = cmd.action === 'rework' ? cmd.reason.trim() : null;
  if (cmd.action === 'rework' && (!reason || reason.length > 2000)) throw Error('Nhập lý do thực hiện lại (1–2000 ký tự).');
  const status: Status = { start: 'DANG_THUC_HIEN', submit: 'CHO_XAC_NHAN', confirm: 'HOAN_THANH', rework: 'CAN_THUC_HIEN_LAI' }[cmd.action] as Status;
  const next: Assignment = { ...a, status, version: a.version + 1, submitted_at: cmd.action === 'submit' ? now : a.submitted_at, confirmed_by: cmd.action === 'confirm' ? actor.id : null, confirmed_at: cmd.action === 'confirm' ? now : null, rework_reason: cmd.action === 'rework' ? reason : a.rework_reason };
  return { ...s, assignments: s.assignments.map(x => x.id === a.id ? next : x), events: [...s.events, { assignment_id: a.id, actor_id: actor.id, at: now, from: a.status, to: status, reason }] };
}
export function createGroup(s: Snapshot, actor: Person, group: Group): Snapshot {
  const c = s.campaigns.find(c => c.id === group.campaign_id);
  if (!c || actor.role !== 'organizer' || actor.organization_id !== c.organization_id) throw Error('Chỉ tổ chức sở hữu chiến dịch được tạo nhóm.');
  if (!group.name.trim() || group.name.trim().length > 100 || s.groups.some(g => g.id === group.id)) throw Error('Tên nhóm không hợp lệ hoặc nhóm đã tồn tại.');
  const members = [...new Set([...group.member_ids, group.leader_id])];
  if (members.some(id => !s.people.some(p => p.id === id) || !s.applications.some(a => a.user_id === id && a.campaign_id === c.id && a.status === 'confirmed'))) throw Error('Trưởng nhóm và thành viên phải có đăng ký đã xác nhận.');
  return { ...s, groups: [...s.groups, { ...group, name: group.name.trim(), member_ids: members }] };
}
export function assignTask(s: Snapshot, actor: Person, draft: TaskDraft, id: string, now: string): Snapshot {
  const group = s.groups.find(g => g.id === draft.group_id);
  if (!group || !canManage(s, actor, group)) throw Error('Bạn không có quyền phân công cho nhóm này.');
  if (!draft.title.trim() || draft.title.length > 150 || !draft.description.trim() || draft.description.length > 5000 || !draft.location.trim() || draft.location.length > 500 || draft.requirements.length > 2000) throw Error('Nhập tên, mô tả và địa điểm hợp lệ.');
  const start = Date.parse(draft.starts_at), end = Date.parse(draft.ends_at);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || (draft.deadline !== null && (!Number.isFinite(Date.parse(draft.deadline)) || Date.parse(draft.deadline) < start))) throw Error('Thời gian không hợp lệ; kết thúc phải sau bắt đầu, deadline không trước bắt đầu.');
  const members = [...new Set(draft.member_ids)];
  if (!members.length || s.tasks.some(t => t.id === id)) throw Error('Chọn ít nhất một thành viên; công việc không được trùng.');
  const assignments = members.map((member_id, index): Assignment => {
    const application = s.applications.find(a => a.user_id === member_id && a.campaign_id === group.campaign_id && a.status === 'confirmed');
    if (!group.member_ids.includes(member_id) || !application) throw Error('Thành viên không thuộc nhóm hoặc chưa xác nhận tham gia.');
    return { id: `${id}-${index}`, task_id: id, member_id, application_id: application.id, assigned_by: actor.id, assigned_at: now, status: 'DA_PHAN_CONG', version: 1, submitted_at: null, confirmed_at: null, confirmed_by: null, rework_reason: null, source: 'manual', source_key: null };
  });
  const { member_ids: _, ...task } = draft;
  return { ...s, tasks: [...s.tasks, { ...task, id, title: task.title.trim() }], assignments: [...s.assignments, ...assignments] };
}
