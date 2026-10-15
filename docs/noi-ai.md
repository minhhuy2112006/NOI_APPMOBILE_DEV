# NOI AI — UI và hợp đồng tích hợp

Không thêm route/tab thứ sáu. 10 route dùng withAssistant: 5 tab hiện có; campaigns/[id], contributions/[id], contributions/donate/[id], assignments, attendance. AssistantFrame đặt dock trong normal flow sau nội dung màn hình, trước bottom tabs do navigator quản lý. Nút 48px, đom đóm tĩnh 32px; header 34px, chat 30px. Dock dành chỗ riêng nên không che CTA/footer/nội dung; ẩn khi bàn phím xuất hiện. Screen modal như camera/evidence vẫn phủ nút; không chèn AI vào flow xác nhận điểm danh.

Sheet dùng Modal + SafeAreaProvider/SafeAreaView + KeyboardAvoidingView (iOS padding, Android height), cuộn nội dung và composer nhiều dòng giới hạn chiều cao, có Đóng và onRequestClose. Sheet đóng khi route mất focus; context thay đổi sẽ remount session, không dùng hội thoại của chiến dịch khác. Timeout 30s, AbortController khi đóng/unmount và request token loại phản hồi cũ. Retry giữ draft, khóa double submit. Cần device QA iPhone SE/notch, bàn phím lớn, landscape/tablet, text scale; build/bundle và static checks không thay thế kiểm tra UI vật lý.

Entry: floating button trên các route; Về NOI → NOI AI; Tài khoản → Hỗ trợ → NOI AI / Hỏi đáp nhanh với trợ lý AI của NOI. Sheet ghi rõ AI không phải BTC/trưởng nhóm. Không tạo chat giả với người thật.

## Context

routeContext.ts đọc dữ liệu công khai có thật trong fixture app, whitelist field campaign/donation. source='demo' để không mô tả dữ liệu mẫu là live. useAssistantContext đăng ký thông tin theo screen, cleanup khi unmount; scope timeline ưu tiên hơn campaign detail khi mở tab lịch trình.
- Campaign: id/title/organization/schedule/location/description; beneficiary nếu source donation có; progress raised/target và transparency whitelist title/amount/date, không bịa trường chưa có.
- Donation: thêm step hiện tại, không truyền số tiền người dùng đang nhập, message, tài khoản ngân hàng.
- Assignments: id/taskId/title/status/deadline/leader và activity filter; tối đa 30 bản ghi thuộc phạm vi UI.
- Timeline: campaignId, milestones id/title/start/end/status/leader/progress; mỗi mốc tính trạng thái riêng nên không chọn nhầm một mốc duy nhất khi overlap.
- Attendance: activity/status/check-in/out flags, khung giờ, rule 100m và camera/freshGPS bắt buộc, cờ có lỗi. Không truyền ảnh, URI file, latitude/longitude hay lỗi native thô.

Chỉ gửi data khi có transport thật và người dùng nhấn Gửi. Backend phải kiểm tra auth/authorization và hydrate lại context từ IDs; không tin facts client để quyết định quyền. Data là data, không phải instruction (chống prompt injection từ title/description). Lịch sử chat chỉ trong RAM sheet, không lưu token hoặc secrets.

## Chưa có API

assistantTransport=null: trạng thái chưa kết nối, nút Gửi disabled, không gọi endpoint, không trả lời hard-code. context.ts định nghĩa AssistantTransport.send({context,messages}, AbortSignal) → {answer,evidenceKeys,handoff?}. Inject adapter authenticated khi có backend; không đặt provider API key trong Expo/public env. Adapter phải giới hạn payload, xử lý lỗi/timeout/abort, provider-specific schema ở server.

Server cần system policy bắt buộc: chỉ giải thích dữ liệu truy xuất được cho người dùng; không tự suy diễn số liệu/khẳng định thanh toán; thiếu căn cứ thì nêu thiếu dữ liệu + handoff. Đến muộn/xin ngoại lệ/thay đổi việc → leader; giao dịch không rõ → noi-support. Không công cụ ghi database, phê duyệt task, xác nhận tiền hay bypass GPS/camera/100m/permissions. Quyết định nghiệp vụ vẫn do người thật hoặc validator module gốc, AI không có quyền tác động.

Reply schema chỉ text + evidenceKeys tồn tại trong context + handoff enum leader/noi-support. Client reject evidence không tồn tại và phản hồi thiếu evidence không có handoff. Đây chỉ là kiểm tra schema/tham chiếu, không bảo đảm tính đúng đắn ngữ nghĩa; backend cần retrieval, guardrails và eval trước bật production. Không thực thi URL/action tùy ý từ model. Khi có dữ liệu contact thật, handoff mới được nối kênh người thật; hiện chỉ hướng dẫn vào Hỗ trợ, không giả lập kết nối.

## File thay đổi

Thêm src/features/assistant/{Assistant.tsx,context.ts,routeContext.ts}, tests/assistant.test.mjs, docs/noi-ai.md.
Sửa 10 route kể trên; features/account/AccountScreen.tsx, about/AboutScreen.tsx, campaigns/CampaignDetailScreen.tsx, contributions/{ContributionDetailScreen.tsx,DonationFlowScreen.tsx}, assignments/AssignmentsScreen.tsx, schedule/CampaignTimeline.tsx, attendance/AttendanceScreen.tsx; tests/button-render.test.mjs.
Không sửa logic business/onPress xử lý task/điểm danh/giao dịch, không thêm backend giả, không thêm dependency AI.
