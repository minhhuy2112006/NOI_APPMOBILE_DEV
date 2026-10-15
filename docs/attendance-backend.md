# Điểm danh mobile — tích hợp và giới hạn

## Đã làm

Tài khoản → Điểm danh (`/attendance`), tách khỏi chi tiết campaign. Lịch tháng theo giờ Việt Nam; ngày có hoạt động, lọc ngày/tháng, hôm nay/sắp tới/đang tham gia/hoàn tất. Chỉ application confirmed tạo hoạt động có thể điểm danh; bản ghi cá nhân cũ vẫn hiện lịch sử kể cả đăng ký bị hủy. Chưa hoàn tất khi hết giờ không bị gắn nhãn hoàn tất.

Camera thật qua expo-image-picker.launchCameraAsync, không mở photo library. Chụp xong mới request GPS foreground bằng getCurrentPositionAsync; tuyệt đối không getLastKnownPositionAsync. Mỗi lượt in/out chạy lại toàn bộ flow. Từ chối permission, hủy camera, tắt GPS, timeout đều có UI lỗi/thử lại/cài đặt.

Haversine bán kính trái đất 6371000m; so sánh khoảng cách chưa làm tròn <=100m. Sai số GPS phải có và <=100m theo quy tắc web cũ; từ chối mocked GPS nếu hệ điều hành báo. Không thể bảo đảm chống giả GPS tuyệt đối ở client. Ảnh hiệu lực 120 giây, fix GPS sau chụp và không quá 60 giây; check-out phải mới hơn dữ liệu check-in. Không dùng lat/lng trùng nhau để kết luận GPS cũ vì người đứng yên có thể có cùng tọa độ. Revalidate eligibility + evidence lúc bấm xác nhận; khóa double submit và kiểm tra bản ghi lưu hiện tại.

Giữ business time window từ noi-app/src/lib/domain.ts: campaign published/active, mở trước start 60 phút và đóng sau end 2 giờ, áp dụng cả in/out. Web cũ không bắt buộc check-out sau end nên mobile cũng cho check-out sớm trong cửa sổ. DA_CHECK_IN trước start, DANG_THAM_GIA từ start, CHO_CHECK_OUT từ end; HOAN_TAT chỉ có check-out hợp lệ. actualDuration lưu milliseconds = outTime - inTime.

Local evidence: activity/user, checkIn/checkOut gồm photo, latitude, longitude, accuracy, distance, time, capturedAt/locationAt. Đây là ánh xạ tương ứng các trường checkInPhoto/checkInLatitude/checkInLongitude/checkInDistance/checkInTime và checkOut*. SQLite kv-store lưu record riêng user; ảnh copy vào document directory trước ghi record (await), xóa bản copy nếu ghi record thất bại. Không upload ảnh/GPS; dữ liệu nằm trong sandbox ứng dụng, không tuyên bố mã hóa. Chỉ xác nhận thành công khi lưu local thành công. Backend chưa kết nối nên đây KHÔNG phải xác nhận chính thức của tổ chức; clock/identity vẫn là client demo.

## Nguồn dữ liệu và địa điểm

Adapter lấy hoạt động từ scheduleSession, đăng ký từ demoSession.applications. Auth thật và campaign status thật chưa được nối: source local dùng published rõ ràng là dữ liệu mẫu. Đã chọn mam-xanh-milestone-0 (Tập trung & hướng dẫn) theo yêu cầu người dùng cho 540 Lã Xuân Oai, Long Trường, Thủ Đức, TP.HCM. Chưa có tọa độ được chủ tổ chức cung cấp; không tự bịa GPS hoặc lấy GPS người dùng làm tâm. Khu cấu hình mẫu cho phép geocode địa chỉ, mở ghim Maps để kiểm tra và xác nhận lưu điểm mẫu. Không bật check-in nếu chưa có tọa độ. Các hoạt động khác chưa có venue nên bị khóa hợp lệ.

Ngày giờ hoạt động gốc trong app vẫn giữ nguyên (03–04/10/2026); không tự dời ngày để vượt kiểm tra khung giờ. Muốn test vật lý thành công cần hoạt động đã xác nhận trong khung giờ hiện tại và điểm tập trung chính xác. Bộ unit test dùng thời gian/toạ độ xác định để kiểm tra flow; không dùng fixture GPS trong UI.

Khu cấu hình tọa độ chỉ phục vụ demo hiện tại; không đưa quyền cấu hình venue cho TNV production. Khi connected, venue phải do organization quản lý ở backend. Geocode có thể sai/ra tâm đường; không tự chấp nhận kết quả đầu tiên. Cấu hình mẫu không đổi sau khi hồ sơ hiện tại đã có record.

## Backend hiện có — không bịa endpoint

Đã đọc noi-app/src/app/api/attendance/route.ts, src/lib/domain.ts, demo-db.ts và migration 001_core.sql. Đã có POST /api/attendance nhận multipart JPEG dưới 4MB, campaign_id, kind, latitude, longitude, accuracy; session currentUser + guardRequest. Upload bucket attendance-private rồi gọi noi_action('attendance'). Bảng attendance có user_id/campaign_id/kind/GPS/accuracy/photo_path/created_at, unique(user_id,campaign_id,kind). Web đang radius=500, không phải 100.

Trước kết nối activity attendance: thêm activity_id FK campaign_milestones (hoặc bảng activity chính thức), unique(user_id,activity_id,kind), venue latitude/longitude/radius=100 server-side; kiểm tra activity cùng campaign, confirmed application, time window, in-before-out, duplicate, accuracy/range, timestamp freshness. Server tính lại distance, nhận thời gian server; lưu captured_at/location_at và server received_at, chống replay bằng nonce/idempotency key. Bổ sung snapshot/projection cá nhân và actualDuration. RLS chỉ cho đúng user/organizer đọc evidence; ảnh private + signed URLs ngắn hạn, không public URL. Server không tin distance/time/userId/status từ mobile.

Nên mở rộng POST /api/attendance hiện có thay vì tạo API thứ hai. Cần chốt auth bearer/token cho mobile vì web dùng cookie/session. Expo camera file có thể không phải JPEG hoặc vượt 4MB: adapter production phải convert/resize/kiểm MIME và bytes trước upload. Hiện client lưu local ảnh camera, chưa gọi endpoint nên không giả vờ upload thành công. Quản lý orphan photo, transaction/idempotency, retry upload và lỗi mạng phải được test khi nối backend.

## Chạy và xác minh

Dependencies Expo SDK57: expo-image-picker, expo-location, expo-file-system, expo-sqlite. app.json có plugin và lời nhắc camera/location; không yêu cầu background location hoặc microphone. Android native folder đã có nên thêm permission foreground/camera trong manifest để development build hiện tại nhận được. Cần build lại app sau khi thêm native dependencies (`npm run android`), hoặc Expo Go bản tương thích SDK57. Không chỉ reload một binary cũ thiếu native modules.

Đã viết test camera denied/location denied/camera cancel, 100m boundary, check-in/out, GPS stale, duplicate, duration/history, approved-only và lịch tháng. Test permission là mock hành vi API, chưa xác nhận prompt/camera/GPS trên điện thoại thật. Device QA cần thử deny/deny permanently → settings → grant, chụp/hủy, tắt GPS, ngoài/vào radius, in/out, restart xem lịch sử và ảnh. App không tự dịch thời gian mẫu hay nới bán kính để pass.
