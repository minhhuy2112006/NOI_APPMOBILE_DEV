# Trang giới thiệu NOI theo mẫu ngày 09/10/2026

## Phạm vi
Trang con /about/introduction dùng IntroductionScreen.tsx và introductionCopy.ts. Nội dung native, nền pastel, ba thẻ đối tượng hồng/xanh/green, footer quote. AboutDetailScreen chuyển route hiện có sang component mới. Không thay main tabs.

## Ảnh
Công cụ: built-in image_gen (không dùng API/CLI).
- assets/about/introduction-hero.png: dựng lại hero từ ảnh người dùng, headline “Kết nối con người”, subtitle “Vì một cộng đồng tốt đẹp hơn”, ảnh bàn tay tạo trái tim trong khung hữu cơ, pastel, bỏ status bar/header/card.
- assets/about/heart-hands.png: close-up hands forming heart at sunset, soft peach/green landscape, no text.
- assets/about/seedling.png: hands supporting soil and seedling, natural morning light, no text.
- assets/about/kindness.png: transparent pastel hands holding pink heart, blue bushes, no text.
Ba ảnh cuối được tạo khi đang chỉnh cả bộ Về NOI; giữ nguyên các asset about-*.png mà project hiện đang sử dụng.

## Kiểm tra
TypeScript đạt. Lint src/features/about đạt. 4 tests about/button-render đạt. Export iOS thành công.
Preview dùng chính component với React Native Web và adapter cho Router, safe area, gradient. Font icon Ionicons thật. Kiểm tra width 320/390/430 không tràn ngang, không page error. Đây không phải screenshot iPhone thật; chưa kiểm chứng pixel parity trên thiết bị. Header/safe area thực tế phụ thuộc iOS. Hero là bản tái tạo từ reference, không phải tài nguyên thiết kế gốc.
