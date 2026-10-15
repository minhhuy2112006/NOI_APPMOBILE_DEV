# Phân công & xác nhận — frontend và hợp đồng backend dự kiến

## Hiện trạng đã kiểm tra

Source web bên cạnh: `noi-app/src/lib/domain.ts`, `validation.ts`, `data.ts`, `src/app/api/action/route.ts`, `supabase/migrations/001_core.sql` và `003_campaign_lifecycle.sql`.
Đã có profiles (auth.users), organizations, campaigns, applications; applications có confirmed/completed/cancelled. Quyền global: volunteer, organizer, admin. Web gọi `noi_snapshot` và `noi_action` qua validation + session. Chưa có nhóm/công việc/phân công/xác nhận công việc trong source được cung cấp. Chưa kiểm tra database đang triển khai.

Mobile hiện chưa có auth/backend adapter. Route `/assignments` dùng dữ liệu mẫu trong bộ nhớ của app; chuyển người chỉ là công cụ trải nghiệm có nhãn demo, KHÔNG phải phân quyền production. Không tạo HTTP endpoint giả, không sửa web, không chạy migration. Khi reload app dữ liệu mẫu được tạo lại. ID mẫu không được gửi lên server.

## Dữ liệu cần bổ sung vào Supabase hiện có

- campaign_groups: id UUID PK, campaign_id FK campaigns, name, leader_id FK profiles, created_by FK profiles, created_at. Trưởng nhóm là quyền theo nhóm, không thêm global role leader.
- campaign_group_members: group_id FK, user_id FK profiles, application_id FK applications; PK(group_id,user_id). application phải cùng campaign/user, status confirmed khi thêm hoặc phân công mới. Leader cũng là thành viên. Cần transaction/trigger để kiểm tra quan hệ xuyên bảng.
- campaign_tasks: id UUID PK, group_id FK, title (1–150), description (1–5000), starts_at/ends_at timestamptz, location (1–500), deadline nullable, requirements (0–2000), created_by/created_at. ends_at > starts_at, deadline >= starts_at nếu có.
- task_assignments: id UUID PK, task_id FK, member_id FK profiles, application_id FK, assigned_by/assigned_at, status, version, submitted_at, confirmed_by/confirmed_at, rework_reason, source (manual/excel), source_key nullable. UNIQUE(task_id,member_id). source_key UNIQUE khi không null để import idempotent. Không tạo user/registration mới từ tên trong Excel.
- task_assignment_events: id UUID PK, assignment_id FK, actor_id FK profiles, from_status/to_status, reason, created_at; append-only. Ghi cả sự kiện tạo phân công server-side; frontend demo hiện lưu lịch sử chuyển trạng thái.

Giữ task và assignment riêng: một công việc giao cho nhiều người, mỗi người có trạng thái độc lập. Không dùng trạng thái application để lưu trạng thái công việc. Model mobile dùng member_ids làm projection từ bảng thành viên; không lưu mảng UUID thay cho bảng quan hệ.

## Chuyển trạng thái và quyền

DA_PHAN_CONG → DANG_THUC_HIEN → CHO_XAC_NHAN → HOAN_THANH.
CHO_XAC_NHAN → CAN_THUC_HIEN_LAI → DANG_THUC_HIEN → CHO_XAC_NHAN.
Không có accept/reject. Chỉ assignee được start/submit; start áp dụng cho mới giao/làm lại. Chỉ leader của nhóm hoặc organizer của tổ chức sở hữu campaign được confirm/rework, và chỉ ở CHO_XAC_NHAN. Không tự xác nhận công việc của mình, kể cả leader/organizer. Nếu thiếu reviewer khác, tổ chức cần bố trí người xác nhận; không bypass bằng quyền admin mặc định.

Confirm ghi auth.uid() và thời gian server. Rework bắt buộc lý do trim 1–2000 ký tự; giữ lý do gần nhất cho TNV, mọi vòng xử lý lưu trong events. Không tự ghi điểm/điểm danh/hoàn tất application khi task hoàn thành.

QUA_HAN là trạng thái hiển thị được suy ra từ deadline + thời gian server cho DA_PHAN_CONG/DANG_THUC_HIEN/CAN_THUC_HIEN_LAI; không ghi đè trạng thái nền. CHO_XAC_NHAN vẫn ở hàng chờ dù qua deadline; HOAN_THANH vẫn hoàn thành. Cho phép làm/gửi muộn để không khóa công việc; nghiệp vụ phạt/điểm ngoài phạm vi.

## Mở rộng API hiện có, chưa triển khai

Thêm schemas vào validation.ts và action vào noi_action, không tạo hệ thống API song song:
- assignment-group-create: campaign_id, name, leader_id, member_ids.
- assignment-create: group_id, title, description, starts_at, ends_at, location, deadline, requirements, member_ids, idempotency_key.
- assignment-start / assignment-submit / assignment-confirm: assignment_id, expected_version, idempotency_key.
- assignment-rework: các trường trên + reason.
Kết quả: assignment(s), version mới và dữ liệu projection cần cập nhật. Extend noi_snapshot với groups/tasks/assignments/events được lọc theo người gọi; khi dữ liệu lớn dùng RPC phân trang cùng quyền, không tải toàn bộ rồi lọc trên mobile.

Auth.uid() là nguồn actor duy nhất; không tin actor_id, role, confirmed_by, timestamp hoặc status từ client. Khóa row FOR UPDATE, kiểm tra expected_version rồi cập nhật + audit trong cùng transaction. Thao tác trùng phải trả kết quả đã xử lý theo idempotency key; version sai trả conflict để mobile tải lại. Lỗi quyền, validation và lỗi mạng phải được hiển thị; không optimistic-set HOAN_THANH. Với membership/leader bị thu hồi, đọc lại quyền hiện tại trên mỗi lệnh; không cho tạo mới từ registration đã hủy. Chính sách xử lý assignment cũ khi hủy đăng ký cần xác nhận trước kết nối production.

RLS mặc định deny direct writes. TNV chỉ đọc assignment của mình và thông tin nhóm cần thiết; leader đọc nhóm được giao; organizer đọc campaign thuộc tổ chức. Không trả toàn bộ hồ sơ/email thành viên cho TNV. SECURITY DEFINER RPC phải set search_path cố định, xác thực auth.uid(), giới hạn EXECUTE cho authenticated và tự kiểm tra quyền; không dùng service role trong mobile.

Trước kết nối: bổ sung migration và RLS/test backend; xác nhận auth bearer/session cho mobile vì API web hiện dùng session cookie + guardRequest; adapter map UUID + snake_case theo model hiện có. Gỡ bộ chọn người demo khỏi đường chạy connected, lấy actor từ session; thay demoSession bằng load/command adapter tới RPC hiện có, thêm loading/error/retry/refetch. Test frontend chỉ hỗ trợ UX, không thay thế kiểm tra quyền server.

## Excel sau này

Upload → parse/staging → resolve campaign/group/task → match application.user_id trong confirmed registrations → review các dòng không khớp/trùng → gọi cùng assignment-create domain transaction. Dùng import_batch_id + row key làm source_key; không match mơ hồ theo tên, không tự tạo tài khoản. Chỉ sau review mới commit; báo lỗi theo dòng và tránh duplicate khi retry. Chưa có file mẫu nên chưa triển khai upload/parse.

## Frontend

Tài khoản → Công việc của tôi → route con có back; 5 tab chính giữ nguyên. Demo dùng cùng session giữa các vai trò để kiểm thử end-to-end. Form tạo nhóm, phân công, danh sách TNV, chờ xác nhận và tiến độ đều dùng Button/Card/Chip hiện có. Thời gian nhập YYYY-MM-DD HH:mm theo UTC+7, chuyển ISO trước validation. Không làm Lịch trình.
