# NOI_MOBILE_APP

Project mobile riêng cho nền tảng NOI, sử dụng React Native, Expo và TypeScript.

## Phạm vi bước 1

- Khởi tạo bằng template chính thức `blank-typescript`.
- Giữ nguyên giao diện khởi động mẫu của Expo trong `App.tsx`.
- Bật TypeScript strict và thêm lệnh kiểm tra kiểu.
- Chưa triển khai navigation, theme, Supabase hoặc màn hình nghiệp vụ.

## Chạy project

Cần Node.js LTS và npm. Trong thư mục project:

```sh
npm ci
npm start
```

Dependencies đã được cài trong lần khởi tạo; `npm ci` dùng khi tải project sang máy khác hoặc cần cài lại theo lockfile.

Quét mã QR bằng Expo Go tương thích với SDK của project trên điện thoại. Điện thoại và máy phát triển cần kết nối mạng phù hợp để truy cập Metro.

```sh
npm run android
npm run ios
npm run typecheck
```

`android` mở trên Android emulator đã cấu hình. `ios` mở iOS Simulator và yêu cầu macOS/Xcode; trên Windows có thể dùng iPhone với Expo Go phù hợp.

## File chính

- `index.ts`: đăng ký entry point React Native với Expo.
- `App.tsx`: component khởi động mẫu, chưa có màn hình NOI.
- `app.json`: tên ứng dụng và cấu hình Expo mặc định.
- `tsconfig.json`: kế thừa cấu hình Expo và bật strict.
- `package.json`, `package-lock.json`: scripts, dependencies và phiên bản khóa.
- `assets/`: tài nguyên mẫu từ Expo, chưa phải bộ nhận diện NOI.
- `.gitignore`: loại trừ dependencies, cache và output sinh tự động.

## Ranh giới kiến trúc và bước tiếp theo

Frontend mobile luôn là project độc lập với web. Sau này có thể dùng chung backend/Supabase, nhưng không sao chép UI web.

Khi được cung cấp source `NOI - menu - ngang`, xem xét domain model, API, Supabase schema, auth, types, validation và business logic có thể tái sử dụng trước khi tích hợp. Chưa thêm Supabase client, biến môi trường hoặc credentials trong bước này.

Bước 2 dự kiến: thống nhất cấu trúc mã nguồn và thiết lập Expo Router với đúng 5 tab dành cho tình nguyện viên: Chiến dịch, Đóng góp, Về NOI, Cửa hàng, Tài khoản. Chỉ thực hiện khi người dùng yêu cầu bước tiếp theo.

Điểm Phước không có giá trị tiền tệ, chỉ dùng ghi nhận và khuyến khích người dùng.

Tài liệu template: https://docs.expo.dev/more/create-expo/
