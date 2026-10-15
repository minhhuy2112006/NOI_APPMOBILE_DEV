import { campaigns } from '../campaigns/data';
import { assignTask, type Snapshot } from './model';

// Explicit local fixtures, never sent to Supabase. Shared during this app session.
export function createDemo(): Snapshot {
  let s: Snapshot = {
    people: [
      { id: 'demo-huy', name: 'Huy', role: 'volunteer', organization_id: null },
      { id: 'demo-lan', name: 'Lan · Trưởng nhóm', role: 'volunteer', organization_id: null },
      { id: 'demo-minh', name: 'Minh', role: 'volunteer', organization_id: null },
      { id: 'demo-org', name: 'Tổ chức NOI mẫu', role: 'organizer', organization_id: 'demo-org' },
    ],
    campaigns: campaigns.slice(0, 2).map(c => ({ id: c.id, title: c.title, organization_id: 'demo-org' })),
    applications: [], groups: [], tasks: [], assignments: [], events: [],
  };
  s.applications = s.campaigns.flatMap(c => s.people.filter(p => p.role === 'volunteer').map(p => ({ id: `${c.id}-${p.id}`, user_id: p.id, campaign_id: c.id, status: 'confirmed' })));
  s.groups = s.campaigns.map((c, index) => ({ id: `demo-group-${index}`, campaign_id: c.id, name: index ? 'Nhóm hỗ trợ' : 'Nhóm hậu cần', leader_id: 'demo-lan', member_ids: ['demo-huy', 'demo-lan', 'demo-minh'] }));
  const now = Date.now();
  const at = (hours: number) => new Date(now + hours * 3600000).toISOString();
  const states = ['DA_PHAN_CONG', 'DANG_THUC_HIEN', 'CHO_XAC_NHAN', 'CAN_THUC_HIEN_LAI', 'HOAN_THANH', 'DA_PHAN_CONG'] as const;
  const titles = ['Chuẩn bị dụng cụ', 'Đón tiếp tình nguyện viên', 'Kiểm kê vật tư', 'Sắp xếp khu vực hoạt động', 'Thu gom vật liệu', 'Bàn giao dụng cụ'];
  states.forEach((status, i) => {
    s = assignTask(s, s.people[3], { group_id: s.groups[i % s.groups.length].id, title: titles[i], description: 'Phối hợp với các thành viên trong nhóm và báo lại trưởng nhóm khi hoàn tất.', starts_at: at(-24), ends_at: at(24), deadline: at(i === 5 ? -1 : 48), location: 'Điểm tập trung của chiến dịch', requirements: 'Kiểm tra số lượng, giữ khu vực sạch và an toàn.', member_ids: ['demo-huy'] }, `demo-task-${i}`, at(-25));
    const a = s.assignments[s.assignments.length - 1];
    a.status = status;
    if (status === 'CHO_XAC_NHAN' || status === 'HOAN_THANH') a.submitted_at = at(-2);
    if (status === 'HOAN_THANH') { a.confirmed_by = 'demo-lan'; a.confirmed_at = at(-1); }
    if (status === 'CAN_THUC_HIEN_LAI') a.rework_reason = 'Sắp xếp lại lối đi và kiểm tra đủ dụng cụ trước khi gửi lại.';
  });
  return s;
}
let snapshot = createDemo();
let actorId = 'demo-huy';
export const demoSession = { read: () => snapshot, save: (next: Snapshot) => { snapshot = next; }, actor: () => actorId, selectActor: (id: string) => { if (snapshot.people.some(p => p.id === id)) actorId = id; } };
