export const sections = { profile: 'Hồ sơ cá nhân', edit: 'Chỉnh sửa hồ sơ', registrations: 'Đăng ký của tôi', donations: 'Quyên góp', points: 'Điểm Phước', support: 'Hỗ trợ', settings: 'Cài đặt', security: 'Bảo mật tài khoản', password: 'Đổi mật khẩu', devices: 'Thiết bị đăng nhập', terms: 'Điều khoản sử dụng', privacy: 'Chính sách bảo mật' } as const;
export type Section = keyof typeof sections;
export const registrationLabels: Record<string, string> = { submitted: 'Đang chờ', selected: 'Đã đăng ký', confirmed: 'Đã xác nhận', waitlisted: 'Danh sách chờ', completed: 'Đã tham gia', cancelled: 'Đã hủy', rejected: 'Không được duyệt' };
export function registrationMatches(status: string, filter: string) { return filter === 'Tất cả' || (filter === 'Đã đăng ký/đã xác nhận' ? ['selected', 'confirmed'].includes(status) : filter === 'Đang chờ' ? ['submitted', 'waitlisted'].includes(status) : filter === 'Đã tham gia' ? status === 'completed' : status === 'cancelled'); }
export function goalPercent(current: number, goal: number) { return goal > 0 ? Math.min(100, Math.max(0, Math.round(current / goal * 100))) : 0; }
export const faqs = [
  { question: 'Khi nào hoạt động xuất hiện trong Điểm danh?', answer: 'Khi đăng ký của bạn đã được tổ chức xác nhận. Đăng ký đang chờ chưa thể điểm danh.' },
  { question: 'Vì sao tôi chưa thể check-in?', answer: 'Cần quyền camera, vị trí mới và ảnh chụp tại hoạt động. Bạn phải trong bán kính 100 m, đúng khung giờ và địa điểm đã có tọa độ xác nhận.' },
  { question: 'Điểm Phước có đổi thành tiền không?', answer: 'Không. Điểm Phước ghi nhận đóng góp và khuyến khích tham gia. Quy tắc cộng điểm sẽ theo chính sách được công bố.' },
  { question: 'Giao dịch chưa được xác nhận thì làm gì?', answer: 'Kiểm tra lịch sử và mã giao dịch. Liên hệ Hỗ trợ NOI qua kênh chính thức khi được công bố. NOI AI không thể xác nhận thanh toán thay hệ thống.' },
];

export type DonationSummary = { amount: number; status?: 'paid' | 'pending' | 'cancelled'; source?: 'demo' | 'backend' };
export const donationLabels = { paid: 'Đã thanh toán', pending: 'Đang chờ', cancelled: 'Đã hủy' };
export function paidTotal(entries: DonationSummary[]) { return entries.filter(e => e.source === 'backend' && e.status === 'paid').reduce((sum, e) => sum + e.amount, 0); }
export function donationMatches(entry: DonationSummary, filter: string) { return filter === 'Tất cả' || (!!entry.status && donationLabels[entry.status] === filter); }
