# NOI_MOBILE_APP

Frontend mobile độc lập cho NOI: React Native, Expo SDK 57, TypeScript strict.
Không chỉnh sửa project web hoặc sao chép UI web.

## Bước 3

Expo Router có đúng 5 tab: **Chiến dịch → Đóng góp → Về NOI → Cửa hàng → Tài khoản**.
Chiến dịch mở mặc định, đã có danh sách và trang chi tiết dùng dữ liệu mẫu. Bốn tab còn lại giữ nội dung chờ.
Theme mobile đã đồng bộ bảng màu từ `noi-app/src/app/globals.css` trong `NOI_code_menu_ngang.zip`: hồng tím `#B8459A`, xanh `#2F7BB8`, nền `#F4F9FD`, chữ `#22304A`, nút gradient hồng–tím–xanh. Bố cục mobile vẫn riêng; chưa đồng bộ font Be Vietnam Pro hoặc toàn bộ hiệu ứng web. Chưa có đăng nhập hoặc Supabase.

- Tìm theo tên chiến dịch/tổ chức, hỗ trợ tiếng Việt không dấu.
- Kết hợp lọc lĩnh vực, địa điểm, nổi bật; có xóa bộ lọc và trạng thái rỗng.
- Trang chi tiết ngoài nhóm tabs, có quay lại; ID sai hiển thị thông báo và đường về danh sách.
- Đăng ký/hủy demo chỉ trong bộ nhớ màn hình, không gửi dữ liệu hoặc giữ chỗ. Chiến dịch đủ chỗ khóa nút đăng ký.
- Chưa có gợi ý cá nhân hóa hoặc định vị gần người dùng.

## Chạy project

Cần Node.js LTS (tối thiểu 22.13) và npm. Mở terminal tại thư mục project:

```sh
npm ci
npm start
```

Dependencies đã cài; `npm ci` dùng khi cài lại hoặc chuyển máy. Quét QR bằng Expo Go tương thích SDK 57; điện thoại cần truy cập được mạng của máy chạy Metro.

```sh
npm run android
npm run ios
npm run typecheck
npm run lint
npm test
```

Android cần emulator đã cấu hình. iOS Simulator cần macOS/Xcode; Windows có thể dùng iPhone với Expo Go tương thích. Scheme `noi-mobile` cần development build để đăng ký trên thiết bị.

## Cấu trúc

```text
src/
  app/
    _layout.tsx             # Root Stack, StatusBar
    (tabs)/
      _layout.tsx           # 5 tab, nhãn tiếng Việt và icon
      index.tsx             # Chiến dịch (/)
      contributions.tsx     # Đóng góp (/contributions)
      about.tsx             # Về NOI (/about)
      store.tsx             # Cửa hàng (/store)
      account.tsx           # Tài khoản (/account)
  components/
    PlaceholderScreen.tsx   # Component dùng chung, có safe area và cuộn
    ui/index.tsx            # Button, Card, Chip và typography
  theme/tokens.ts           # Màu, khoảng cách, bo góc
  features/campaigns/
    data.ts                 # Fixtures và hàm lọc, chưa phải schema backend
    CampaignsScreen.tsx     # Màn hình danh sách
  app/campaigns/[id].tsx    # Chi tiết ngoài 5 tab
```

- `package.json`: entry `expo-router/entry`, scripts và dependencies.
- `package-lock.json`: khóa phiên bản dependencies.
- `app.json`: cấu hình Expo, Router/font plugins, scheme.
- `tsconfig.json`, `eslint.config.js`: kiểm tra kiểu và lint.
- `assets/`: tài nguyên mẫu Expo.

Đã thay `App.tsx` và `index.ts` cũ bằng entry Expo Router. Chỉ đặt routes/layouts trong `src/app`. Khi triển khai nghiệp vụ, thêm từng tính năng trong `src/features/` và lớp backend trong `src/lib/` khi cần; chưa tạo schema phỏng đoán.

## Kiểm tra trên thiết bị

Đã đạt: TypeScript, ESLint, Expo Doctor (21/21), kiểm tra phiên bản dependency và Metro export Android/iOS. Export chỉ kiểm tra bundle, chưa thay thế kiểm thử tương tác hoặc native build trên thiết bị.
Npm hiện báo 13 cảnh báo bảo mật mức moderate trong cây dependency; chưa áp dụng `audit fix --force` vì có thể phá tương thích SDK.

1. Mở app: Chiến dịch được chọn, chỉ một header hiển thị.
2. Chạm lần lượt cả 5 tab: nội dung và trạng thái chọn thay đổi đúng.
3. Kiểm tra thanh tab không bị che bởi vùng home indicator/navigation bar.
4. Tăng cỡ chữ hệ thống và kiểm tra nội dung cuộn được.
5. Tìm `mam xanh`, kết hợp lĩnh vực/địa điểm, thử kết quả rỗng và xóa bộ lọc.
6. Mở chi tiết, đăng ký/hủy demo rồi quay lại. Chiến dịch Bữa cơm đủ chỗ phải khóa nút đăng ký.
7. Mở ID không tồn tại: thấy thông báo và nút về danh sách.

## Backend và bước tiếp theo

Mobile sau này dùng chung backend/Supabase với web. Khi nhận source `NOI - menu - ngang`, đối chiếu domain model, API, schema, auth, types/validation và business logic trước khi tích hợp; không sao chép UI web.

Bước tiếp theo: nhận source web để xác định hợp đồng dữ liệu/auth/Supabase và nối Chiến dịch với backend; có thể tiếp tục dựng giao diện mẫu cho các tab khác trong lúc chờ.
Điểm Phước không có giá trị tiền tệ, chỉ ghi nhận và khuyến khích người dùng.

Tài liệu: https://docs.expo.dev/router/installation/ và https://docs.expo.dev/router/advanced/tabs/

## Giao diện Tài khoản theo ảnh tham khảo

- Header NOI, tìm chiến dịch và thông báo; hồ sơ pastel, avatar chữ cái đầu, vai trò tình nguyện viên.
- Bốn thống kê mẫu và các mục Hồ sơ, Đăng ký, Điểm danh, Quyên góp, Điểm Phước, Hỗ trợ, Cài đặt, Trợ giúp, Đăng xuất.
- Chỉnh sửa tên/lời giới thiệu lưu trong state của phiên hiện tại. Không có upload ảnh hoặc ghi Supabase.
- Mục chưa có backend mở bảng thông tin trạng thái. Đăng xuất có xác nhận và thoát hồ sơ demo, có thể mở lại.
- Giữ đúng 5 tab gốc, tab giữa vẫn là Về NOI. Đã bỏ nhãn minh họa trên màn hình theo yêu cầu; số liệu vẫn là fixtures, chưa kết nối backend.
- Màn hình thống kê chuyển thành 2 cột khi màn hình hẹp hoặc cỡ chữ lớn.

Kiểm tra thiết bị: mở Tài khoản, thử chỉnh sửa/hủy/lưu tên rỗng, mở từng mục và đóng bằng nút hoặc Back Android, thử hủy/xác nhận thoát demo, tăng cỡ chữ và kiểm tra cuộn. Chưa kiểm chứng trực quan trên thiết bị thực.

Cập nhật Tài khoản: trợ giúp ở góc phải header, Cài đặt/Đăng xuất là hai thẻ lớn đồng bộ menu. Theme toàn app tăng sắc hồng và xanh theo yêu cầu.


## Thiết kế Về NOI và Chiến dịch theo ảnh mới

- Header dùng chung với họa tiết cánh tim hồng/tím/xanh dựng bằng native Views và gradients.
- Về NOI: tiêu đề lớn, banner ảnh có lớp chữ, giữ lưới 9 mục; chưa có video thật, không hiển thị thời lượng giả.
- Chiến dịch: thẻ ảnh ngang, nhóm theo địa phương, hoạt động nổi bật, lối vào NOI AI.
- Bộ lọc bottom sheet có từ khóa, tỉnh/thành, lĩnh vực, nguồn lực, kỹ năng, hình thức, trạng thái. Đặt lại chỉ thay bản nháp; Áp dụng mới cập nhật danh sách, đóng bảng hủy bản nháp.
- Metadata bộ lọc là fixtures phục vụ UI, chưa xác định schema Supabase. Ảnh sao chép từ tài nguyên web để minh họa; source web không chỉnh sửa.
- Gần bạn lọc theo địa phương được chọn, chưa dùng GPS; gợi ý chưa cá nhân hóa, NOI AI chưa kết nối.
- Kiểm tra thiết bị: mở/đóng bộ lọc qua backdrop và Back Android; thay nhiều tiêu chí rồi áp dụng; đặt lại; kiểm tra không có kết quả; mở chi tiết thẻ; thử cỡ chữ lớn và bàn phím. Chưa kiểm chứng trực quan trên thiết bị thực.

## Cửa hàng theo mockup

Trang Cửa hàng có thẻ 1.250 Điểm Phước, hạng Mầm xanh, tiến độ tới 1.500 điểm tích lũy, Huy hiệu/Lịch sử và lưới 4 quà NOI. Ảnh sản phẩm tạo bằng ImageGen, lưu local trong assets/store/gifts.png; component hiển thị từng ô của ảnh 2x2.
Bộ lọc Tất cả/Quà NOI/Quà đối tác hoạt động; chưa có quà đối tác. Đổi quà mở xác nhận, cập nhật số dư và lịch sử trong phiên; chặn thiếu điểm và đổi trùng. Không có đơn hàng thật, không lưu backend, không đồng bộ với thống kê mẫu ở trang Tài khoản. Hạng dựa trên điểm tích lũy, không giảm khi đổi quà.
Kiểm tra thiết bị: xem 4 ảnh sản phẩm, thử bộ lọc, mở huy hiệu/lịch sử, hủy và xác nhận đổi quà, thử đổi lại và quà vượt số dư. Kiểm tra màn hình hẹp/cỡ chữ lớn (lưới tự chuyển 1 cột). Chưa kiểm thử trực quan trên thiết bị.

## Cửa hàng — cập nhật 29/09/2026

- Slogan hai dòng lớn, màu hồng tím, nhãn “Gom điều lành · Rinh niềm vui”.
- Ngôi sao có gương mặt, hào quang chuyển động và tia sáng; dừng khi rời tab, hỗ trợ Reduce Motion.
- Thanh tích Phước có gradient, mốc hoa, tỷ lệ và lời nhắc lên hạng. Điểm tích lũy demo vẫn 1.250/1.500, không giảm khi đổi quà.
- Danh sách 2 cột (1 cột khi màn hình hẹp/chữ lớn), tối đa 8 quà mỗi trang. Từ 9 quà có nút Trước/Tiếp và tự cuộn về đầu danh sách; đổi bộ lọc về trang đầu. Hiện vẫn chỉ có 4 quà mẫu, ảnh vẫn lấy từ sprite 2x2; quà mới cần khai báo ảnh riêng khi mở rộng catalog.
- TypeScript, ESLint và 10/10 unit test đạt sau thay đổi. Chưa kiểm thử trực quan/animation trên điện thoại hoặc tương tác phân trang với catalog thật trên 8 quà.

### Điều chỉnh bố cục gọn theo phản hồi

Tiêu đề chính là CỬA HÀNG NOI, slogan nhỏ lại còn một dòng khi đủ chỗ. Thu gọn ngôi sao (giữ animation), khung điểm, thanh hạng và ảnh quà; bỏ các nhãn phụ lặp. Catalog đổi thành 4 quà/trang, 2x2 ở cỡ chữ thường, có Trước/Tiếp khi nhiều hơn 4 quà. Giữ cuộn cho màn hình nhỏ/cỡ chữ lớn để không cắt nội dung. TypeScript và ESLint đạt; chưa xác nhận vừa một màn hình trên thiết bị thực của người dùng.

## Chiến dịch theo ảnh mẫu được duyệt

Đã triển khai header NOI, nền pastel, thanh tìm kiếm và chips lĩnh vực; carousel thẻ nhỏ có chấm chuyển vị trí, nút Xem tất cả chuyển sang lưới. Chiến dịch featured được xếp trước các thẻ khám phá còn lại. Khối Gần bạn lọc theo địa phương chọn (mặc định TP. Hồ Chí Minh, không phải GPS), giữ tiêu chí tìm kiếm đang áp dụng. Thẻ lớn có mô tả, lịch, số người và mở chi tiết. Banner trái tim dựng bằng native UI; dùng ảnh chiến dịch sẵn có, không phải ảnh trích từ mockup. Icon thanh tab đồng bộ mẫu, giữ 5 tab và navigation hiện tại.

TypeScript, ESLint và 10/10 unit test đạt. Chưa xác nhận trực quan/tương tác trên điện thoại: cần kiểm tra carousel/chấm chuyển thẻ, lọc/đóng/hủy bản nháp, địa phương không có kết quả, mở chi tiết và cỡ chữ lớn. Source trước sửa được giữ tại workspace work/campaign-reference/before.tsx và tabs-before.tsx.

## Trang Đóng góp — 30/09/2026

Đã dựng theo ảnh được chọn: header NOI, danh mục thiện nguyện, carousel nổi bật, danh sách tổ chức và cá nhân, bảng chi tiết, lọc danh mục, yêu thích trong phiên và Xem tất cả. Dùng 9 chiến dịch mẫu; chưa xác minh hồ sơ, kết nối thanh toán hoặc nhận tiền thật. Header mặc định tab đã ẩn để tránh trùng. Trên điện thoại, số tiền/progress nằm dưới mô tả để dễ đọc.

Ảnh AI tạo bằng công cụ imagegen tích hợp, lưu tại assets/contributions/campaigns.png. Prompt: contact sheet 3x3 gồm bé nhận bữa ăn, học sinh cầm sách, cây non, người già, cứu trợ lũ, trẻ mặc áo ấm, trẻ ở bệnh viện, nhà người già và bữa ăn vùng cao; ảnh tự nhiên, tôn trọng nhân vật, không chữ/viền. Ảnh chỉ minh họa, không phải người thụ hưởng thật.

Cần kiểm tra trực quan trên thiết bị: ảnh đúng ô, danh mục, yêu thích, danh sách rỗng, đóng/mở chi tiết, chữ lớn. Không coi bundle là nghiệm thu giao diện trên iPhone.
