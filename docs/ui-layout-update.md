# Cập nhật bố cục NOI — 08/10/2026

- Về NOI: khôi phục BrandHeader trang trí hiện có, ảnh ngang giới hạn chiều cao, grid 3×3 icon; giữ chín mục nội dung mới. Ảnh hiện có vẫn được dùng, không tự tạo video hoặc nút phát không hoạt động.
- NOI AI: bỏ hàng nền riêng dưới màn hình; nút nổi 48 px, ẩn khi bàn phím mở. Chiến dịch và Đóng góp truyền chiều cao CTA qua onLayout để nút nổi nằm phía trên; khoảng đệm cuối nội dung cho phép cuộn nội dung cuối khỏi nút.
- Header: nút back native dùng minimal, không lộ (tabs). Bỏ tiêu đề Về NOI lặp trong nội dung trang con.
- Carousel: một card đầy đủ trên điện thoại, snap theo card; mặc định không tự trượt. Vẫn cho bật tự chuyển bằng control cũ.
- Tài khoản: bỏ hàng Công việc của tôi độc lập. Đăng ký của tôi có lối vào toàn bộ công việc và lọc theo từng chiến dịch. Dùng module /assignments hiện có.
- Công việc: card tóm tắt và modal chi tiết có ảnh chiến dịch, trạng thái và action hiện có; không sửa transition/permission.
- Lịch trình: chọn ngày, timeline ngắn và modal chi tiết; task progress không tự hoàn tất milestone. Link công việc giữ milestoneId.
- Điểm danh: ảnh chiến dịch, card thu gọn/mở chi tiết, các bước xác minh và kết quả check-in/out. Camera, GPS, permission, bán kính 100 m và lưu bằng chứng giữ nguyên. Không thêm camera hoặc bản đồ giả theo hình mẫu.
- Người dùng xác nhận bánh răng xanh là Expo Go: không sửa hoặc vô hiệu hóa.

## Files

Added: src/components/ActivityPresentation.tsx; docs/ui-layout-update.md.

Updated:
- src/app/_layout.tsx
- src/features/assistant/Assistant.tsx
- src/features/about/AboutScreen.tsx
- src/features/about/AboutDetailScreen.tsx
- src/features/account/AccountScreen.tsx
- src/features/account/AccountDetailScreen.tsx
- src/features/assignments/AssignmentsScreen.tsx
- src/features/schedule/CampaignTimeline.tsx
- src/features/attendance/AttendanceScreen.tsx
- src/features/campaigns/CampaignsScreen.tsx
- src/features/campaigns/CampaignDetailScreen.tsx
- src/features/contributions/ContributionDetailScreen.tsx
- src/features/contributions/ContributionsScreen.tsx
- src/features/store/StoreScreen.tsx

## Kiểm tra
TypeScript và 45 test đã đạt. Không sửa palette, backend hoặc module Điểm danh model/store. Chưa kiểm tra trực tiếp trên iPhone; cần kiểm tra vuốt carousel, cỡ chữ lớn, safe area, modal/back, bàn phím và vị trí nút nổi trên máy thật. Bundle iOS được kiểm tra riêng ở cuối lượt.
