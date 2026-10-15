export const topics = [
  { id: 'introduction', title: 'Về NOI' },
  { id: 'mission', title: 'Sứ mệnh' },
  { id: 'how-it-works', title: 'Cách hoạt động' },
  { id: 'organizations', title: 'Tổ chức' },
  { id: 'impact', title: 'Tác động cộng đồng' },
  { id: 'transparency', title: 'Cam kết minh bạch' },
  { id: 'join', title: 'Tham gia cùng NOI' },
  { id: 'stories', title: 'Tin tức & câu chuyện' },
  { id: 'standards', title: 'Tiêu chuẩn cộng đồng' },
] as const;
export type SectionId = typeof topics[number]['id'];
export type Paragraph = { title: string; text: string };
export const articles: Partial<Record<SectionId, Paragraph[]>> = {
  introduction: [
    { title: 'NOI là gì?', text: 'NOI là nền tảng kết nối hoạt động tình nguyện và quyên góp. Bạn có thể tìm hoạt động phù hợp, đóng góp thời gian hoặc nguồn lực và theo dõi những cập nhật từ tổ chức.' },
    { title: 'Câu chuyện của NOI', text: 'NOI bắt đầu từ một mong muốn: giúp người muốn đóng góp tìm được nơi cần sự giúp đỡ. Khi thông tin rõ ràng và việc phối hợp thuận tiện hơn, mỗi người có thể lựa chọn cách tham gia phù hợp với khả năng của mình.' },
    { title: 'Giá trị cốt lõi', text: 'Tôn trọng con người, trung thực trong thông tin và có trách nhiệm với cộng đồng là những giá trị NOI hướng đến. Mỗi đóng góp, dù lớn hay nhỏ, đều cần được ghi nhận đúng và sử dụng đúng mục đích.' },
    { title: 'Kết nối để cùng hành động', text: 'Người dùng khám phá và lựa chọn; tình nguyện viên đóng góp kỹ năng và thời gian; tổ chức xác định nhu cầu, điều phối và cập nhật kết quả. NOI cung cấp không gian kết nối, không thay thế trách nhiệm của tổ chức hay người tham gia.' },
  ],
  mission: [
    { title: 'Mục tiêu', text: 'Giúp việc tham gia hoạt động cộng đồng trở nên dễ tiếp cận hơn, từ lần tình nguyện đầu tiên đến hành trình đồng hành lâu dài.' },
    { title: 'Giá trị trong từng đóng góp', text: 'NOI khuyến khích đóng góp phù hợp với nhu cầu thực tế, năng lực và thời gian của mỗi người. Sự bền bỉ và trách nhiệm có ý nghĩa không kém quy mô của một hoạt động.' },
    { title: 'Cộng đồng là trung tâm', text: 'Lắng nghe người được hỗ trợ, tôn trọng sự khác biệt và bảo vệ phẩm giá của họ. Một hoạt động tốt cần tạo điều kiện để cộng đồng được tham gia vào những quyết định liên quan đến mình.' },
    { title: 'Định hướng lâu dài', text: 'Xây dựng sự tin cậy thông qua thông tin rõ ràng, phối hợp có trách nhiệm và những cập nhật có thể kiểm chứng. NOI mong muốn kết nối con người với những việc làm có ích, không khuyến khích chạy theo thành tích.' },
  ],
  'how-it-works': [
    { title: '01 · Khám phá', text: 'Tìm chiến dịch theo lĩnh vực, địa điểm và nhu cầu. Đọc mục tiêu, thời gian, yêu cầu và thông tin tổ chức trước khi quyết định.' },
    { title: '02 · Tham gia', text: 'Đăng ký tình nguyện hoặc lựa chọn hình thức đóng góp. Với tình nguyện, chờ tổ chức xét chọn và xác nhận trước khi chuẩn bị tham gia.' },
    { title: '03 · Kết nối', text: 'Theo dõi lịch trình, liên hệ người phụ trách và xem công việc được giao. Các thay đổi hoặc tình huống cần ngoại lệ phải trao đổi trực tiếp với Trưởng nhóm/Ban tổ chức.' },
    { title: '04 · Lan tỏa', text: 'Theo dõi kết quả, chia sẻ trải nghiệm một cách tôn trọng và mời người khác cùng tham gia. Chỉ đăng hình ảnh, câu chuyện của người khác khi có sự đồng ý phù hợp.' },
  ],
  transparency: [
    { title: 'Xác minh tổ chức', text: 'NOI hướng đến việc đối chiếu thông tin nhận diện, người phụ trách và hồ sơ hoạt động của tổ chức trước khi công bố trạng thái xác minh. Có mặt trong danh sách mẫu không đồng nghĩa đã được xác minh.' },
    { title: 'Công khai thông tin', text: 'Chiến dịch cần nêu rõ mục tiêu, đối tượng hỗ trợ, thời gian, nhu cầu và đơn vị chịu trách nhiệm. Thay đổi đáng kể cần được thông báo cho người tham gia.' },
    { title: 'Chứng từ rõ ràng', text: 'Nguồn tiếp nhận và khoản sử dụng cần có căn cứ, chứng từ phù hợp và cập nhật dễ hiểu. Dữ liệu nhạy cảm trong chứng từ cần được bảo vệ trước khi công khai.' },
    { title: 'Giám sát cộng đồng', text: 'Người tham gia có thể đặt câu hỏi và gửi phản ánh qua kênh hỗ trợ. Tổ chức cần giải trình, điều chỉnh khi có sai sót và cập nhật kết quả xử lý.' },
    { title: 'Đọc đúng phạm vi', text: 'Đây là định hướng tiêu chuẩn của NOI, không phải báo cáo thu chi. Các khoản đóng góp và chứng từ của từng chiến dịch nằm trong phần Minh bạch của chính chiến dịch đó.' },
  ],
  standards: [
    { title: 'Tôn trọng', text: 'Tôn trọng phẩm giá, sự riêng tư và lựa chọn của mỗi người. Không phân biệt đối xử, quấy rối hoặc sử dụng hình ảnh người được hỗ trợ để gây áp lực.' },
    { title: 'Trung thực', text: 'Cung cấp thông tin đúng, không giả mạo hồ sơ, bằng chứng điểm danh hoặc kết quả hoạt động. Báo lại khi phát hiện dữ liệu sai.' },
    { title: 'Văn minh', text: 'Trao đổi lịch sự, góp ý vào vấn đề và tránh công kích cá nhân. Không đăng nội dung xúc phạm, spam hoặc thông tin chưa được kiểm chứng.' },
    { title: 'An toàn', text: 'Tuân thủ hướng dẫn của người phụ trách, bảo vệ thông tin cá nhân và không nhận nhiệm vụ vượt khả năng. Dừng hoạt động và báo người phụ trách khi thấy nguy cơ.' },
    { title: 'Trách nhiệm', text: 'Giữ cam kết, thông báo sớm khi không thể tham gia và sử dụng nguồn lực đúng mục đích. Các vi phạm cần được tiếp nhận và xử lý theo quy trình có người phụ trách.' },
  ],
};
export type CampaignSummary = { id: string; title: string; organization: string; category: string };
export function organizationDirectory(campaigns: CampaignSummary[]) {
  return [...new Set(campaigns.map(c => c.organization))].map(name => ({ name, categories: [...new Set(campaigns.filter(c => c.organization === name).map(c => c.category))], campaigns: campaigns.filter(c => c.organization === name) }));
}
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
export function filterOrganizations(campaigns: CampaignSummary[], query: string, category: string) { return organizationDirectory(campaigns).filter(o => normalize(o.name).includes(normalize(query)) && (!category || o.categories.includes(category))); }
export const stories = [
  { id: 'first-day', category: 'Câu chuyện', title: 'Chuẩn bị cho lần tình nguyện đầu tiên', summary: 'Một vài điều nên hỏi người phụ trách trước ngày tham gia.', body: 'Đọc kỹ thời gian, địa điểm và yêu cầu của hoạt động. Hỏi người phụ trách về trang phục, dụng cụ, khả năng di chuyển và người liên hệ khi cần hỗ trợ. Bạn không cần nhận mọi nhiệm vụ; hãy bắt đầu với công việc phù hợp với mình.' },
  { id: 'working-together', category: 'Hoạt động', title: 'Phối hợp tốt trong một nhóm tình nguyện', summary: 'Công việc rõ ràng giúp mọi người biết mình cần làm gì.', body: 'Trước hoạt động, thống nhất đầu mối liên hệ và phạm vi công việc. Trong khi làm, báo lại tiến độ và những khó khăn cần hỗ trợ. Sau hoạt động, cùng nhìn lại điều đã làm được và những gì cần cải thiện.' },
  { id: 'platform', category: 'Tin tức', title: 'Các mục bạn có thể khám phá trên NOI', summary: 'Làm quen với Chiến dịch, Đóng góp, Về NOI, Cửa hàng và Tài khoản.', body: 'Bản trải nghiệm hiện có năm tab chính. Trong Tài khoản, bạn có thể tìm Công việc và Điểm danh. Một số tính năng đang dùng dữ liệu mẫu; hãy đọc thông báo trong màn hình trước khi thao tác.' },
] as const;
