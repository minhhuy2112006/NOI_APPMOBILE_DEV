export type Activity = { title: string; text: string };
export type TimelineEntry = { time: string; title: string; text: string };
export type CampaignDetail = { deadline: string; audience: string; tasks: Activity[]; timeline: TimelineEntry[] };

// Presentation fixtures only. Confirm dates, requirements and benefits with organizers before launch.
export const campaignDetails: Record<string, CampaignDetail> = {
  'mam-xanh': {
    deadline: '02/10/2026', audience: 'Yêu thiên nhiên, sẵn sàng hoạt động ngoài trời.',
    tasks: [
      { title: 'Chuẩn bị cây và dụng cụ', text: 'Nhận cây giống, kiểm tra dụng cụ cùng điều phối viên.' },
      { title: 'Trồng và chăm sóc cây', text: 'Trồng cây, tưới nước và chăm sóc khu vực được phân công.' },
      { title: 'Thu gom rác', text: 'Làm sạch lối đi và phân loại rác trong công viên.' },
      { title: 'Bàn giao khu vực', text: 'Thu dọn dụng cụ, kiểm tra và chụp ảnh tổng kết.' },
    ],
    timeline: [
      { time: '07:00 – 07:30', title: 'Tập trung & hướng dẫn', text: 'Điểm danh, chia nhóm và nhận dụng cụ.' },
      { time: '07:30 – 09:00', title: 'Trồng cây xanh', text: 'Thực hiện theo hướng dẫn của nhóm phụ trách.' },
      { time: '09:00 – 09:40', title: 'Chăm sóc & vệ sinh', text: 'Tưới cây và thu gom rác trong khu vực.' },
      { time: '09:40 – 10:00', title: 'Tổng kết', text: 'Bàn giao dụng cụ và chia sẻ trải nghiệm.' },
    ],
  },
  'trang-sach': {
    deadline: '01/10/2026', audience: 'Yêu sách, kiên nhẫn và thích đồng hành cùng trẻ em.',
    tasks: [
      { title: 'Phân loại sách', text: 'Kiểm tra và sắp xếp sách theo độ tuổi, chủ đề.' },
      { title: 'Chuẩn bị góc đọc', text: 'Bố trí bàn ghế và các hoạt động đọc sách.' },
      { title: 'Đọc sách cùng các em', text: 'Kể chuyện, lắng nghe và gợi mở câu hỏi.' },
      { title: 'Sắp xếp thư viện', text: 'Đưa sách về kệ và thu dọn sau buổi đọc.' },
    ],
    timeline: [
      { time: '08:30 – 09:00', title: 'Đón tiếp & chia nhóm', text: 'Nghe hướng dẫn hoạt động và nhận nhiệm vụ.' },
      { time: '09:00 – 09:45', title: 'Chuẩn bị sách', text: 'Phân loại sách và bố trí góc đọc.' },
      { time: '09:45 – 11:00', title: 'Đọc sách cùng các em', text: 'Kể chuyện và tổ chức hoạt động nhóm.' },
      { time: '11:00 – 11:30', title: 'Tổng kết & thu dọn', text: 'Sắp xếp sách và chia sẻ trải nghiệm.' },
    ],
  },
  'bua-com': {
    deadline: '01/10/2026', audience: 'Gọn gàng, cẩn thận và tuân thủ hướng dẫn vệ sinh.',
    tasks: [
      { title: 'Chuẩn bị nguyên liệu', text: 'Hỗ trợ sơ chế theo phân công của bếp.' },
      { title: 'Đóng gói suất ăn', text: 'Chia phần, đóng hộp và kiểm tra số lượng.' },
      { title: 'Trao các suất ăn', text: 'Phối hợp cùng nhóm để trao bữa ăn đến người nhận.' },
      { title: 'Vệ sinh khu bếp', text: 'Thu gom rác và làm sạch dụng cụ sau hoạt động.' },
    ],
    timeline: [
      { time: '09:00 – 09:20', title: 'Điểm danh & hướng dẫn', text: 'Nhận nhiệm vụ và hướng dẫn vệ sinh.' },
      { time: '09:20 – 10:30', title: 'Sơ chế & chuẩn bị', text: 'Phối hợp cùng nhóm bếp.' },
      { time: '10:30 – 11:30', title: 'Đóng gói & trao bữa ăn', text: 'Kiểm tra và bàn giao các suất ăn.' },
      { time: '11:30 – 12:00', title: 'Thu dọn & tổng kết', text: 'Vệ sinh khu vực và bàn giao dụng cụ.' },
    ],
  },
  'bien-xanh': {
    deadline: '02/10/2026', audience: 'Yêu biển, có thể đi bộ và làm việc ngoài trời.',
    tasks: [
      { title: 'Nhận khu vực phụ trách', text: 'Chia nhóm, nhận dụng cụ và nghe hướng dẫn an toàn.' },
      { title: 'Thu gom rác bãi biển', text: 'Nhặt rác thông thường; báo điều phối viên khi gặp vật sắc nhọn.' },
      { title: 'Phân loại rác', text: 'Tách rác tái chế và chuyển đến điểm tập kết.' },
      { title: 'Lan tỏa thói quen xanh', text: 'Cùng chia sẻ cách giảm rác thải nhựa mỗi ngày.' },
    ],
    timeline: [
      { time: '06:00 – 06:20', title: 'Tập trung & chia nhóm', text: 'Nhận dụng cụ và hướng dẫn an toàn.' },
      { time: '06:20 – 07:40', title: 'Làm sạch bãi biển', text: 'Thu gom rác theo khu vực phân công.' },
      { time: '07:40 – 08:30', title: 'Phân loại & tập kết', text: 'Chuyển rác đến điểm được hướng dẫn.' },
      { time: '08:30 – 09:00', title: 'Tổng kết', text: 'Thu dọn dụng cụ và chia sẻ trải nghiệm.' },
    ],
  },
};

export function participationState(registered: number, capacity: number, joined: boolean) {
  const count = registered + (joined ? 1 : 0);
  return { count, remaining: Math.max(0, capacity - count), full: count >= capacity, progress: Math.min(1, count / Math.max(1, capacity)) };
}
