// Local presentation fixtures, not a Supabase schema or real campaigns.
export type Campaign = {
  id: string; title: string; category: string; city: string; organization: string;
  dateLabel: string; timeLabel: string; schedule: string; location: string; description: string; preparation: string;
  capacity: number; registered: number; featured: boolean;
};

export const campaigns: Campaign[] = [
  { id: 'mam-xanh', title: 'Gieo mầm xanh, thêm một khoảng lành', category: 'Môi trường', city: 'TP. Hồ Chí Minh', organization: 'Nhóm Mầm Xanh (mẫu)', dateLabel: 'Chủ nhật, 04/10/2026', timeLabel: '07:00–10:00', schedule: 'Chủ nhật, 04/10/2026 · 07:00–10:00', location: 'Công viên cộng đồng · địa điểm minh họa', description: 'Cùng chăm sóc cây xanh và thu gom rác trong khu vực công viên. Hoạt động phù hợp với người mới bắt đầu tình nguyện.', preparation: 'Mang nước uống, mũ và giày kín mũi. Dụng cụ làm vườn được chuẩn bị tại điểm tập trung.', capacity: 40, registered: 28, featured: true },
  { id: 'trang-sach', title: 'Một trang sách, nhiều ước mơ', category: 'Giáo dục', city: 'Hà Nội', organization: 'Nhóm Sách Cho Em (mẫu)', dateLabel: 'Thứ bảy, 03/10/2026', timeLabel: '08:30–11:30', schedule: 'Thứ bảy, 03/10/2026 · 08:30–11:30', location: 'Thư viện cộng đồng · địa điểm minh họa', description: 'Phân loại sách và tổ chức buổi đọc sách cùng các em nhỏ. Bạn có thể hỗ trợ hậu cần hoặc hướng dẫn hoạt động đọc.', preparation: 'Chuẩn bị một câu chuyện yêu thích và tham gia buổi hướng dẫn trước hoạt động.', capacity: 25, registered: 18, featured: true },
  { id: 'bua-com', title: 'Gửi một bữa cơm, trao một nụ cười', category: 'Cộng đồng', city: 'TP. Hồ Chí Minh', organization: 'Bếp Chia Sẻ (mẫu)', dateLabel: 'Thứ bảy, 03/10/2026', timeLabel: '09:00–12:00', schedule: 'Thứ bảy, 03/10/2026 · 09:00–12:00', location: 'Bếp cộng đồng · địa điểm minh họa', description: 'Hỗ trợ sơ chế, đóng gói và trao các suất ăn trong hoạt động bếp cộng đồng.', preparation: 'Mặc trang phục gọn gàng, buộc tóc và tuân thủ hướng dẫn vệ sinh của điều phối viên.', capacity: 20, registered: 20, featured: false },
  { id: 'bien-xanh', title: 'Hẹn nhau bên một bờ biển sạch', category: 'Môi trường', city: 'Đà Nẵng', organization: 'Nhóm Mầm Xanh (mẫu)', dateLabel: 'Chủ nhật, 04/10/2026', timeLabel: '06:00–09:00', schedule: 'Chủ nhật, 04/10/2026 · 06:00–09:00', location: 'Bãi biển cộng đồng · địa điểm minh họa', description: 'Thu gom và phân loại rác trên bãi biển, cùng tìm hiểu cách giảm rác thải nhựa trong sinh hoạt.', preparation: 'Mang mũ, nước uống và giày phù hợp. Không tự xử lý các vật sắc nhọn.', capacity: 60, registered: 36, featured: false },
];

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

export function filterCampaigns(items: Campaign[], query: string, category: string, city: string, featuredOnly: boolean) {
  const term = normalizeSearch(query);
  return items.filter(item =>
    (!category || item.category === category) && (!city || item.city === city) &&
    (!featuredOnly || item.featured) &&
    normalizeSearch(`${item.title} ${item.organization} ${item.city} ${item.category}`).includes(term));
}

