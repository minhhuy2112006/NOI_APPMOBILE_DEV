import { profileSession } from '../account/session';
import { KissThanks } from './KissThanks';
import { ActionBackground as BrandActionBackground } from '../../components/ui';
import { theme as buttonTheme , theme } from '../../theme/tokens';
import { donationSession, type DonationEntry } from './session';
import { useAssistantContext } from '../assistant/Assistant';

// ============================================================
// DONATION FLOW SCREEN
// Luồng đóng góp cho một chiến dịch
//
// Gồm 4 bước:
// 1. Nhập số tiền đóng góp
// 2. Chọn phương thức đóng góp
// 3. Xác nhận thông tin
// 4. Hiển thị kết quả đóng góp thành công
// ============================================================

// ============================================================
// 1. IMPORT
// ============================================================

import { useRef, useState } from "react";

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

// SafeAreaView giúp giao diện không bị che bởi:
// - tai thỏ
// - Dynamic Island
// - thanh trạng thái của điện thoại
import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

// Expo Router dùng để điều hướng và lấy tham số trên URL
import { router, useLocalSearchParams } from "expo-router";

// Bộ icon Ionicons
import Ionicons from "@expo/vector-icons/Ionicons";

// Dữ liệu chi tiết của các chiến dịch
import { campaignData, type CampaignDetail } from "./campaignData";

import { CelebrationFireworks } from "../../components/CelebrationFireworks";
// ============================================================
// 2. TYPE - CÁC BƯỚC TRONG LUỒNG ĐÓNG GÓP
// ============================================================

// amount  = nhập số tiền
// method  = chọn phương thức thanh toán
// confirm = xác nhận thông tin
// success = đóng góp thành công
type DonationStep = "amount" | "method" | "confirm" | "success";

// ============================================================
// 3. TYPE - CÁC PHƯƠNG THỨC ĐÓNG GÓP
// ============================================================

type PaymentMethod =
  | "bank" // Chuyển khoản ngân hàng
  | "vietqr" // VietQR
  | "momo"; // Ví MoMo

// ============================================================
// 4. MÀU SẮC CHUNG
// ============================================================

// Màu nhận diện chính của NOI
const PINK = "#E957AE";
const BLUE = "#347CD5";
const NAVY = "#122453";

// Màu dùng cho nội dung phụ
const TEXT = "#22304A";
const MUTED = "#748097";
const BORDER = "#E8EBF1";
const BG = "#FFFFFF";

// ============================================================
// 5. CÁC MỨC TIỀN ĐÓNG GÓP GỢI Ý
// ============================================================

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

// ============================================================
// 6. MÀN HÌNH CHÍNH
// ============================================================

export default function DonationFlowScreen() {
  // ----------------------------------------------------------
  // Lấy ID chiến dịch từ URL
  //
  // Ví dụ URL:
  // /contributions/donate/meal
  //
  // => id = "meal"
  // ----------------------------------------------------------
  const { id } = useLocalSearchParams<{ id: string }>();

  // ----------------------------------------------------------
  // Tìm chiến dịch tương ứng trong campaignData
  // ----------------------------------------------------------
  const campaign = campaignData[id];

  // ----------------------------------------------------------
  // STATE - BƯỚC HIỆN TẠI
  // ----------------------------------------------------------

  // Khi vừa mở màn hình:
  // mặc định ở bước nhập số tiền.
  const [step, setStep] = useState<DonationStep>("amount");
  const historyRecorded = useRef(false);
  const [receipt, setReceipt] = useState<DonationEntry | null>(null);
  useAssistantContext("Quyên góp", { donationStep: step, campaignId: id ?? null });

  // ----------------------------------------------------------
  // STATE - THÔNG TIN ĐÓNG GÓP
  // ----------------------------------------------------------

  // Số tiền đóng góp mặc định: 100.000đ
  const [amount, setAmount] = useState(100000);

  // Lưu số tiền khi người dùng tự nhập ở mục "Khác"
  const [customAmount, setCustomAmount] = useState("");

  // Lời nhắn của người đóng góp
  const [message, setMessage] = useState("");

  // Có đóng góp ẩn danh hay không
  const [anonymous, setAnonymous] = useState(false);

  // ----------------------------------------------------------
  // STATE - PHƯƠNG THỨC THANH TOÁN
  // ----------------------------------------------------------

  // Mặc định chọn chuyển khoản ngân hàng
  const [method, setMethod] = useState<PaymentMethod>("bank");

  // ----------------------------------------------------------
  // KIỂM TRA CHIẾN DỊCH CÓ TỒN TẠI KHÔNG
  // ----------------------------------------------------------

  // Nếu ID trên URL không tồn tại trong campaignData
  // thì hiển thị thông báo thay vì để ứng dụng bị lỗi.
  if (!campaign) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.emptyText}>Không tìm thấy chiến dịch.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------------
  // BƯỚC 4 - MÀN HÌNH THÀNH CÔNG
  // ----------------------------------------------------------

  // Khi step = "success" thì không cần hiển thị header
  // và các bước 1 - 3 nữa.
  if (step === "success") {
    return <SuccessStep campaign={campaign} amount={amount} method={method} receipt={receipt} anonymous={anonymous} message={message} />;
  }

  // ==========================================================
  // GIAO DIỆN CHÍNH CỦA BƯỚC 1 - 3
  // ==========================================================

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* =====================================================
          HEADER
          Tiêu đề thay đổi tùy theo bước hiện tại.
          ===================================================== */}

      <DonationHeader
        step={step}
        onBack={() => {
          // Nếu đang ở bước nhập tiền
          // => quay lại trang chi tiết chiến dịch.
          if (step === "amount") {
            router.back();
            return;
          }

          // Nếu đang ở bước chọn phương thức
          // => quay lại bước nhập số tiền.
          if (step === "method") {
            setStep("amount");
            return;
          }

          // Nếu đang ở bước xác nhận
          // => quay lại bước chọn phương thức.
          setStep("method");
        }}
      />

      {/* =====================================================
          BƯỚC 1 - NHẬP THÔNG TIN ĐÓNG GÓP
          ===================================================== */}

      {step === "amount" && (
        <AmountStep
          campaign={campaign}
          amount={amount}
          setAmount={setAmount}
          customAmount={customAmount}
          setCustomAmount={setCustomAmount}
          message={message}
          setMessage={setMessage}
          anonymous={anonymous}
          setAnonymous={setAnonymous}
          // Chuyển sang bước chọn phương thức
          onContinue={() => setStep("method")}
        />
      )}

      {/* =====================================================
          BƯỚC 2 - CHỌN PHƯƠNG THỨC ĐÓNG GÓP
          ===================================================== */}

      {step === "method" && (
        <MethodStep
          campaign={campaign}
          amount={amount}
          method={method}
          setMethod={setMethod}
          // Chuyển sang bước xác nhận
          onContinue={() => setStep("confirm")}
        />
      )}

      {/* =====================================================
          BƯỚC 3 - XÁC NHẬN THÔNG TIN
          ===================================================== */}

      {step === "confirm" && (
        <ConfirmStep
          campaign={campaign}
          amount={amount}
          method={method}
          message={message}
          anonymous={anonymous}
          // Hiện tại đang mô phỏng giao diện.
          // Sau này khi nối backend/thanh toán thật,
          // chỉ chuyển success khi giao dịch được xác nhận.
          onComplete={() => {
            if (historyRecorded.current) return;
            historyRecorded.current = true;
            const entry: DonationEntry = { id: 'DEMO-' + Date.now().toString(36), target: campaign.title, amount, date: new Date().toLocaleString('vi-VN'), method: paymentLabel(method), source: 'demo' };
            donationSession.set(current => [entry, ...current]);
            setReceipt(entry);
            setStep("success");
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ============================================================
// 7. HEADER DÙNG CHUNG CHO BƯỚC 1 - 3
// ============================================================

function DonationHeader({
  step,
  onBack,
}: {
  step: DonationStep;
  onBack: () => void;
}) {
  // ----------------------------------------------------------
  // Xác định tiêu đề dựa theo bước hiện tại
  // ----------------------------------------------------------

  const title =
    step === "amount"
      ? "Đóng góp"
      : step === "method"
        ? "Chọn phương thức đóng góp"
        : "Xác nhận đóng góp";

  return (
    <View style={s.header}>
      {/* Nút quay lại */}
      <Pressable onPress={onBack} style={s.headerButton}>
        <Ionicons name="chevron-back" size={26} color={NAVY} />
      </Pressable>

      {/* Tiêu đề */}
      <Text numberOfLines={1} style={s.headerTitle}>
        {title}
      </Text>

      {/* Khu vực bên phải header */}
      <View style={s.headerRight}>
        {/* Chỉ hiện trái tim ở màn nhập tiền */}
        {step === "amount" && (
          <Ionicons name="heart" size={22} color="#F4B8DB" />
        )}
      </View>
    </View>
  );
}

// ============================================================
// 8. CARD THÔNG TIN CHIẾN DỊCH
// ============================================================
//
// Component này được tái sử dụng ở nhiều bước.
//
// compact = false:
//   Hiển thị card lớn ở bước đầu.
//
// compact = true:
//   Hiển thị card nhỏ ở bước phương thức/xác nhận/thành công.
// ============================================================

function CampaignMiniCard({
  campaign,
  compact = false,
}: {
  campaign: CampaignDetail;
  compact?: boolean;
}) {
  return (
    <View style={s.campaignCard}>
      {/* Ảnh đại diện chiến dịch */}
      <Image
        source={campaign.image}
        style={compact ? s.campaignImageSmall : s.campaignImage}
      />

      {/* Nội dung chiến dịch */}
      <View style={s.campaignCopy}>
        {/* Tag danh mục - chỉ hiện ở card lớn */}
        {!compact && (
          <View style={s.categoryBadge}>
            <Text style={s.categoryText}>{campaign.category}</Text>
          </View>
        )}

        {/* Tên chiến dịch */}
        <Text numberOfLines={compact ? 2 : 3} style={s.campaignTitle}>
          {campaign.title}
        </Text>

        {/* Tên quỹ / tổ chức */}
        <Text style={s.campaignOrg}>{campaign.organization}</Text>

        {/* Số người đóng góp - chỉ hiện ở card lớn */}
        {!compact && (
          <View style={s.donorRow}>
            <Ionicons name="people-outline" size={15} color={MUTED} />

            <Text style={s.donorText}>
              {campaign.donors.toLocaleString("vi-VN")} người đã đóng góp
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ============================================================
// 9. BƯỚC 1 - NHẬP THÔNG TIN ĐÓNG GÓP
// ============================================================
//
// Bao gồm:
// - Chọn số tiền gợi ý
// - Nhập số tiền khác
// - Nhập lời nhắn
// - Chọn đóng góp ẩn danh
// - Thông báo minh bạch
// ============================================================

function AmountStep({
  campaign,
  amount,
  setAmount,
  customAmount,
  setCustomAmount,
  message,
  setMessage,
  anonymous,
  setAnonymous,
  onContinue,
}: {
  campaign: CampaignDetail;
  amount: number;
  setAmount: (value: number) => void;
  customAmount: string;
  setCustomAmount: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  anonymous: boolean;
  setAnonymous: (value: boolean) => void;
  onContinue: () => void;
}) {
  // ----------------------------------------------------------
  // Khi người dùng chọn một mức tiền có sẵn
  // ----------------------------------------------------------

  const selectAmount = (value: number) => {
    // Cập nhật số tiền
    setAmount(value);

    // Xóa số tiền tự nhập để bỏ trạng thái "Khác"
    setCustomAmount("");
  };

  return (
    <>
      {/* KeyboardAvoidingView giúp bàn phím không che TextInput */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Thông tin chiến dịch */}
          <CampaignMiniCard campaign={campaign} />

          {/* =================================================
              SỐ TIỀN ĐÓNG GÓP
              ================================================= */}

          <SectionHeading icon="cash-outline" title="Số tiền đóng góp" />

          {/* Ô nhập số tiền */}
          <View style={s.amountInput}>
            <TextInput
              value={customAmount || amount.toLocaleString("vi-VN")}
              keyboardType="number-pad"
              onChangeText={(text) => {
                // Chỉ giữ lại ký tự số
                const clean = text.replace(/\D/g, "");

                // Lưu chuỗi người dùng nhập
                setCustomAmount(clean);

                // Nếu có giá trị hợp lệ thì cập nhật amount
                if (clean) {
                  setAmount(Number(clean));
                }
              }}
              style={s.amountInputText}
            />

            {/* Đơn vị tiền */}
            <Text style={s.currency}>đ</Text>
          </View>

          {/* =================================================
              CÁC MỨC TIỀN GỢI Ý
              ================================================= */}

          <View style={s.quickGrid}>
            {QUICK_AMOUNTS.map((value) => {
              // Kiểm tra nút này có đang được chọn không
              const selected = amount === value && !customAmount;

              return (
                <Pressable
                  key={value}
                  onPress={() => selectAmount(value)}
                  style={[s.quickAmount, selected && s.quickAmountSelected]}
                >
                  <Text
                    style={[
                      s.quickAmountText,
                      selected && s.quickAmountTextSelected,
                    ]}
                  >
                    {value.toLocaleString("vi-VN")}đ
                  </Text>
                </Pressable>
              );
            })}

            {/* Nút nhập số tiền khác */}
            <Pressable
              onPress={() => {
                setCustomAmount(amount ? String(amount) : "");
              }}
              style={[s.quickAmount, !!customAmount && s.quickAmountSelected]}
            >
              <Text
                style={[
                  s.quickAmountText,
                  !!customAmount && s.quickAmountTextSelected,
                ]}
              >
                Khác
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              LỜI NHẮN
              ================================================= */}

          <SectionHeading
            icon="chatbubble-ellipses-outline"
            title="Lời nhắn"
            note="(không bắt buộc)"
          />

          <View style={s.messageBox}>
            <TextInput
              multiline
              maxLength={200}
              value={message}
              onChangeText={setMessage}
              placeholder="Gửi một lời nhắn yêu thương đến chiến dịch..."
              placeholderTextColor="#A2AABC"
              style={s.messageInput}
            />

            {/* Đếm số ký tự */}
            <Text style={s.counter}>{message.length}/200</Text>
          </View>

          {/* =================================================
              ĐÓNG GÓP ẨN DANH
              ================================================= */}

          <View style={s.anonymousRow}>
            <View style={s.anonymousIcon}>
              <Ionicons name="eye-off-outline" size={22} color={NAVY} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>Đóng góp ẩn danh</Text>

              <Text style={s.rowDescription}>
                Tên của bạn sẽ không hiển thị công khai.
              </Text>
            </View>

            {/* Công tắc bật/tắt ẩn danh */}
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{
                false: "#E1E5ED",
                true: "#F3B5D9",
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* =================================================
              THÔNG BÁO MINH BẠCH
              ================================================= */}

          <View style={s.trustBox}>
            <Ionicons name="shield-checkmark" size={25} color={PINK} />

            <Text style={s.trustText}>
              Mọi đóng góp đều được ghi nhận minh bạch và cập nhật trên trang
              chiến dịch.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =====================================================
          NÚT TIẾP TỤC CỐ ĐỊNH PHÍA DƯỚI
          ===================================================== */}

      <BottomButton
        title={`Tiếp tục · ${amount.toLocaleString("vi-VN")}đ`}
        onPress={onContinue}
      />
    </>
  );
}

// ============================================================
// 10. DANH SÁCH CÁC PHƯƠNG THỨC ĐÓNG GÓP
// ============================================================
//
// Mỗi phần tử gồm:
// - id          : mã phương thức dùng trong code
// - title       : tên hiển thị
// - description : mô tả ngắn
// - icon        : icon Ionicons
// - popular     : có hiển thị nhãn "Phổ biến" hay không
//
// Sau này khi tích hợp thanh toán thật, mỗi id có thể được
// ánh xạ tới API hoặc payment gateway tương ứng.
// ============================================================

// ============================================================
// DANH SÁCH PHƯƠNG THỨC ĐÓNG GÓP
// ============================================================

const PAYMENT_METHODS: {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  popular?: boolean;
}[] = [
  {
    id: "bank",
    title: "Chuyển khoản ngân hàng",
    description: "Quét mã VietQR hoặc chuyển khoản từ ứng dụng ngân hàng.",
    icon: "business-outline",
    popular: true,
  },

  {
    id: "vietqr",
    title: "VietQR",
    description: "Quét mã QR bằng ứng dụng ngân hàng.",
    icon: "qr-code-outline",
  },

  {
    id: "momo",
    title: "Ví MoMo",
    description: "Thanh toán nhanh, an toàn.",
    icon: "wallet-outline",
  },
];

// ============================================================
// 11. BƯỚC 2 - CHỌN PHƯƠNG THỨC ĐÓNG GÓP
// ============================================================
//
// Màn hình này hiển thị:
// - Thông tin chiến dịch
// - Số tiền đã chọn ở bước 1
// - Danh sách phương thức đóng góp
// - Radio button thể hiện phương thức đang được chọn
// - Nút "Tiếp tục"
// ============================================================

function MethodStep({
  campaign,
  amount,
  method,
  setMethod,
  onContinue,
}: {
  campaign: CampaignDetail;
  amount: number;
  method: PaymentMethod;
  setMethod: (value: PaymentMethod) => void;
  onContinue: () => void;
}) {
  return (
    <>
      {/* =====================================================
          PHẦN NỘI DUNG CÓ THỂ CUỘN
          ===================================================== */}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* ---------------------------------------------------
            THÔNG TIN CHIẾN DỊCH
            Dùng phiên bản compact để card gọn hơn.
            --------------------------------------------------- */}

        <CampaignMiniCard campaign={campaign} compact />

        {/* ---------------------------------------------------
            TÓM TẮT SỐ TIỀN ĐÃ CHỌN
            --------------------------------------------------- */}

        <View style={s.amountSummary}>
          <Text style={s.summaryLabel}>Số tiền đóng góp</Text>

          <Text style={s.summaryAmount}>{amount.toLocaleString("vi-VN")}đ</Text>
        </View>

        {/* ---------------------------------------------------
            TIÊU ĐỀ PHƯƠNG THỨC ĐÓNG GÓP
            --------------------------------------------------- */}

        <SectionHeading icon="wallet-outline" title="Phương thức đóng góp" />

        {/* ===================================================
            DANH SÁCH PHƯƠNG THỨC
            =================================================== */}

        <View style={s.methodList}>
          {PAYMENT_METHODS.map((item) => {
            // Kiểm tra phương thức hiện tại có đang được chọn
            // hay không.
            const selected = method === item.id;

            return (
              <Pressable
                key={item.id}
                // Khi bấm vào card:
                // cập nhật phương thức đang được chọn.
                onPress={() => setMethod(item.id)}
                style={[
                  s.methodCard,

                  // Nếu đang chọn thì đổi viền/background.
                  selected && s.methodSelected,
                ]}
              >
                {/* -------------------------------------------
                    ICON PHƯƠNG THỨC
                    ------------------------------------------- */}

                <View style={s.methodIcon}>
                  <Ionicons
                    name={item.icon}
                    size={27}
                    color={selected ? BLUE : NAVY}
                  />
                </View>

                {/* -------------------------------------------
                    TÊN + MÔ TẢ
                    ------------------------------------------- */}

                <View style={{ flex: 1 }}>
                  <View style={s.methodTitleRow}>
                    <Text style={s.methodTitle}>{item.title}</Text>

                    {/* Nhãn "Phổ biến" */}
                    {item.popular && (
                      <View style={s.popularBadge}>
                        <Text style={s.popularText}>Phổ biến</Text>
                      </View>
                    )}
                  </View>

                  <Text style={s.methodDescription}>{item.description}</Text>
                </View>

                {/* -------------------------------------------
                    RADIO BUTTON
                    ------------------------------------------- */}

                <View style={[s.radio, selected && s.radioSelected]}>
                  {/* Chỉ hiện chấm tròn khi được chọn */}
                  {selected && <View style={s.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* =====================================================
          NÚT TIẾP TỤC
          ===================================================== */}

      <BottomButton title="Tiếp tục" onPress={onContinue} />
    </>
  );
}

// ============================================================
// 12. BƯỚC 3 - XÁC NHẬN ĐÓNG GÓP
// ============================================================
//
// Màn hình này giúp người dùng kiểm tra lại:
// - Chiến dịch
// - Số tiền
// - Phương thức thanh toán
// - Lời nhắn
// - Trạng thái ẩn danh
// - Trạng thái hiển thị tên
//
// Nếu dùng chuyển khoản/VietQR:
// => hiển thị thêm thông tin tài khoản và QR.
//
// LƯU Ý:
// Nút hoàn thành hiện chỉ phục vụ DEMO giao diện.
// Khi có backend, không nên xác nhận giao dịch thành công
// chỉ dựa vào việc người dùng bấm nút.
// ============================================================

function ConfirmStep({
  campaign,
  amount,
  method,
  message,
  anonymous,
  onComplete,
}: {
  campaign: CampaignDetail;
  amount: number;
  method: PaymentMethod;
  message: string;
  anonymous: boolean;
  onComplete: () => void;
}) {
  return (
    <>
      {/* =====================================================
          NỘI DUNG CÓ THỂ CUỘN
          ===================================================== */}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* ---------------------------------------------------
            CARD CHIẾN DỊCH
            --------------------------------------------------- */}

        <CampaignMiniCard campaign={campaign} compact />

        {/* ===================================================
            BẢNG XÁC NHẬN THÔNG TIN
            =================================================== */}

        <View style={s.confirmTable}>
          {/* Số tiền đóng góp */}
          <ConfirmRow
            label="Số tiền đóng góp"
            value={`${amount.toLocaleString("vi-VN")}đ`}
            highlight
          />

          {/* Phương thức thanh toán */}
          <ConfirmRow
            label="Phương thức thanh toán"
            value={paymentLabel(method)}
          />

          {/* Lời nhắn */}
          <ConfirmRow
            label="Lời nhắn"
            value={message || "Cùng chung tay vì một cộng đồng tốt đẹp hơn 💚"}
          />

          {/* Có đóng góp ẩn danh hay không */}
          <ConfirmRow
            label="Đóng góp ẩn danh"
            value={anonymous ? "Có" : "Không"}
          />

          {/* Tên người đóng góp có được hiển thị không */}
          <ConfirmRow
            label="Hiển thị tên"
            value={anonymous ? "Ẩn danh" : "Công khai"}
            last
          />
        </View>

        {/* ===================================================
            THÔNG TIN CHUYỂN KHOẢN
            ===================================================
            
            Chỉ hiển thị khi người dùng chọn:
            - bank
            - vietqr
            =================================================== */}

        {/* ===================================================
    THÔNG TIN THANH TOÁN
    =================================================== */}

        {method === "bank" || method === "vietqr" ? (
          <>
            {/* Chuyển khoản / VietQR */}
            <BankTransferCard amount={amount} />

            {/* Chỉ ngân hàng và VietQR mới hiện lưu ý chuyển khoản */}
            <View style={s.noteBox}>
              <Ionicons name="information-circle" size={22} color={BLUE} />

              <View style={{ flex: 1 }}>
                <Text style={s.noteTitle}>Lưu ý</Text>

                <Text style={s.noteText}>
                  • Vui lòng chuyển đúng nội dung để hệ thống ghi nhận tự động.
                  {"\n"}• Sau khi hoàn tất, hệ thống sẽ cập nhật trong vài phút.
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* Ví MoMo */
          <View style={s.paymentNotice}>
            <Ionicons name="information-circle" size={23} color={BLUE} />

            <Text style={s.paymentNoticeText}>
              Bạn sẽ được chuyển đến MoMo để hoàn tất đóng góp sau khi xác nhận.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* =====================================================
          NÚT XÁC NHẬN
          ===================================================== */}

      <BottomButton
        title={
          method === "bank" || method === "vietqr"
            ? "Tôi đã chuyển khoản"
            : "Xác nhận đóng góp"
        }
        onPress={onComplete}
      />
    </>
  );
}

// ============================================================
// 13. HELPER - LẤY TÊN PHƯƠNG THỨC THANH TOÁN
// ============================================================
//
// Trong state chúng ta lưu các mã ngắn:
// bank, vietqr, momo, card, direct.
//
// Hàm này chuyển mã đó thành tên tiếng Việt để hiển thị
// trên giao diện.
// ============================================================

function paymentLabel(method: PaymentMethod) {
  switch (method) {
    case "bank":
      return "Chuyển khoản ngân hàng";

    case "vietqr":
      return "VietQR";

    case "momo":
      return "Ví MoMo";
  }
}

// ============================================================
// 14. COMPONENT - MỘT DÒNG THÔNG TIN XÁC NHẬN
// ============================================================
//
// Ví dụ:
//
// Số tiền đóng góp              100.000đ
// Phương thức            Chuyển khoản ngân hàng
// Đóng góp ẩn danh                    Không
//
// highlight = true:
// dùng để làm nổi bật số tiền.
//
// last = true:
// bỏ đường viền dưới ở dòng cuối cùng.
// ============================================================

function ConfirmRow({
  label,
  value,
  highlight = false,
  last = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        s.confirmRow,

        // Dòng cuối cùng không cần borderBottom.
        last && {
          borderBottomWidth: 0,
        },
      ]}
    >
      {/* Tên trường */}
      <Text style={s.confirmLabel}>{label}</Text>

      {/* Giá trị */}
      <Text
        style={[
          s.confirmValue,

          // Nếu highlight = true thì dùng style nổi bật.
          highlight && s.confirmHighlight,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ============================================================
// 15. COMPONENT - THÔNG TIN CHUYỂN KHOẢN / VIETQR
// ============================================================
//
// Hiện tại phần này chỉ là GIAO DIỆN DEMO.
//
// Những thông tin sau đang là placeholder:
// - QR
// - ngân hàng
// - số tài khoản
// - tên tài khoản
// - nội dung chuyển khoản
//
// Khi làm thanh toán thật:
// các dữ liệu này nên được lấy từ backend.
//
// Không nên hard-code thông tin thanh toán thật trực tiếp
// trong ứng dụng mobile.
// ============================================================

function BankTransferCard({ amount }: { amount: number }) {
  return (
    <View style={s.bankCard}>
      {/* =====================================================
          HEADER CỦA KHỐI CHUYỂN KHOẢN
          ===================================================== */}

      <View style={s.bankHeader}>
        <Ionicons name="business-outline" size={22} color={BLUE} />

        <Text style={s.bankHeaderTitle}>Thông tin chuyển khoản</Text>

        {/* Logo chữ demo.
            Sau này có thể thay bằng asset VietQR thật. */}
        <Text style={s.vietqr}>VIETQR</Text>
      </View>

      {/* =====================================================
          BODY
          Bên trái: QR
          Bên phải: thông tin tài khoản
          ===================================================== */}

      <View style={s.bankBody}>
        {/* ---------------------------------------------------
            QR PLACEHOLDER
            ---------------------------------------------------
            
            Hiện tại dùng icon QR để mô phỏng.
            Đây CHƯA PHẢI mã QR thanh toán thật.
            --------------------------------------------------- */}

        <View style={s.qrPlaceholder}>
          <Ionicons name="qr-code" size={100} color="#111827" />

          <Text style={s.napas}>napas 247</Text>
        </View>

        {/* ---------------------------------------------------
            THÔNG TIN TÀI KHOẢN
            --------------------------------------------------- */}

        <View style={s.bankInfo}>
          {/* Ngân hàng */}
          <Text style={s.bankLabel}>Ngân hàng</Text>

          <Text style={s.bankValue}>
            Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)
          </Text>

          {/* Số tài khoản */}
          <Text style={s.bankLabel}>Số tài khoản</Text>

          <Text style={s.accountNumber}>0123 4567 890</Text>

          {/* Tên tài khoản */}
          <Text style={s.bankLabel}>Tên tài khoản</Text>

          <Text style={s.bankValue}>QUỸ VÌ CỘNG ĐỒNG NOI</Text>

          {/* Nội dung chuyển khoản */}
          <Text style={s.bankLabel}>Nội dung chuyển khoản</Text>

          <View style={s.transferCode}>
            <Text style={s.transferCodeText}>NOI TCGX 12345</Text>

            {/* Icon copy.
                Hiện tại mới là giao diện.
                Chưa gắn Clipboard. */}
            <Ionicons name="copy-outline" size={18} color={BLUE} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// 16. BƯỚC 4 - MÀN HÌNH ĐÓNG GÓP THÀNH CÔNG
// ============================================================
//
// Đây là màn cuối cùng trong Donation Flow.
//
// Hiển thị:
// - Biểu tượng cảm ơn
// - Lời cảm ơn
// - Chiến dịch vừa đóng góp
// - Số tiền
// - Phương thức thanh toán
// - Thời gian giao dịch
// - Mã giao dịch
// - Thông báo đã ghi nhận
// - Nút xem lịch sử đóng góp
// - Nút quay về chiến dịch
//
// LƯU Ý:
// Hiện tại thời gian và mã giao dịch đang là dữ liệu DEMO.
// Khi kết nối backend, hai giá trị này phải lấy từ giao dịch
// thực tế do server trả về.
// ============================================================

function SuccessStep({
  campaign,
  amount,
  method, receipt, anonymous, message,
}: {
  campaign: CampaignDetail;
  amount: number;
  method: PaymentMethod;
  receipt: DonationEntry | null;
  anonymous: boolean;
  message: string;
}) {
  const [showFireworks, setShowFireworks] = useState(true);
  const profile = profileSession.useValue();
  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      {showFireworks && (
        <CelebrationFireworks onFinish={() => setShowFireworks(false)} />
      )}
      {/* =====================================================
          TOÀN BỘ NỘI DUNG MÀN HÌNH THÀNH CÔNG
          ===================================================== */}

      <ScrollView
        contentContainerStyle={s.successContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===================================================
            BIỂU TƯỢNG CẢM ƠN
            =================================================== */}

        <KissThanks />

        {/* ===================================================
            TIÊU ĐỀ CẢM ƠN
            =================================================== */}

        <Text style={s.successTitle}>Cảm ơn bạn{"\n"}đã đóng góp!</Text>

        {/* ===================================================
            MÔ TẢ NGẮN
            =================================================== */}

        <Text style={s.successDescription}>
          Sự chung tay của bạn giúp tạo nên những thay đổi tích cực cho cộng
          đồng.
        </Text>

        {/* ===================================================
            PHIẾU THÔNG TIN ĐÓNG GÓP
            =================================================== */}

        <View style={s.receiptCard}>
          {/* -----------------------------------------------
              Chiến dịch vừa được đóng góp
              ----------------------------------------------- */}

          <ConfirmRow label="Người quyên góp" value={anonymous ? "Ẩn danh" : profile.name} highlight />
          <CampaignMiniCard campaign={campaign} compact />

          {/* -----------------------------------------------
              Số tiền đóng góp
              ----------------------------------------------- */}

          <ConfirmRow
            label="Số tiền đóng góp"
            value={`${amount.toLocaleString("vi-VN")}đ`}
            highlight
          />

          {/* -----------------------------------------------
              Phương thức thanh toán
              ----------------------------------------------- */}

          <ConfirmRow label="Phương thức" value={paymentLabel(method)} />

          {/* -----------------------------------------------
              Thời gian giao dịch
              
              TODO:
              Sau này thay bằng thời gian thực tế được
              backend trả về.
              ----------------------------------------------- */}

          <ConfirmRow label="Thời gian" value={receipt?.date ?? "—"} />

          {/* -----------------------------------------------
              Mã giao dịch
              
              TODO:
              Sau này mã giao dịch phải được backend tạo.
              Không nên tự hard-code ở frontend.
              ----------------------------------------------- */}

          <ConfirmRow label="Mã ghi nhận" value={receipt?.id ?? "—"} />
          <ConfirmRow label="Đơn vị tiếp nhận" value={campaign.organization} />
          <ConfirmRow label="Hình thức đóng góp" value="Tài chính" />
          <ConfirmRow label="Hiển thị tên" value={anonymous ? "Ẩn danh" : "Công khai"} />
          {message.trim() ? <ConfirmRow label="Lời nhắn" value={message.trim()} /> : null}
          
        </View>

        {/* ===================================================
            THÔNG BÁO ĐÃ GHI NHẬN
            =================================================== */}

        <View style={s.successNotice}>
          <Ionicons name="heart" size={25} color={PINK} />

          <Text style={s.successNoticeText}>
            Thông tin đóng góp đã được lưu trong lịch sử trên thiết bị. Xác nhận chuyển khoản cần được đơn vị tiếp nhận đối soát.
          </Text>
        </View>

        {/* ===================================================
            NÚT XEM LỊCH SỬ ĐÓNG GÓP
            ===================================================
            
            Hiện tại nút này mới có giao diện.
            
            TODO:
            Sau này điều hướng đến trang lịch sử đóng góp
            của người dùng.
            
            Ví dụ:
            
            onPress={() => {
              router.push("/contributions/history");
            }}
            
            Chưa thêm route ở thời điểm hiện tại để tránh
            điều hướng đến một trang chưa tồn tại.
            =================================================== */}

      </ScrollView>
        <View style={s.successFooter}>
          <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/account/[section]', params: { section: 'donations' } })} style={({ pressed }) => [s.successAction, { opacity: pressed ? 0.75 : 1 }]}>
            <BrandActionBackground radius={12} />
            <Text style={s.successActionText}>Xem lịch sử</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.replace(`/contributions/${campaign.id}`)} style={({ pressed }) => [s.successAction, { opacity: pressed ? 0.75 : 1 }]}>
            <BrandActionBackground radius={12} />
            <Text style={s.successActionText}>Về chiến dịch</Text>
          </Pressable>
        </View>

    </SafeAreaView>
  );
}

// ============================================================
// 17. COMPONENT - TIÊU ĐỀ CỦA TỪNG SECTION
// ============================================================
//
// Component nhỏ dùng lại nhiều lần.
//
// Ví dụ:
//
// [icon] Số tiền đóng góp
//
// [icon] Lời nhắn (không bắt buộc)
//
// [icon] Phương thức đóng góp
//
// Props:
// - icon  : tên icon Ionicons
// - title : tiêu đề chính
// - note  : ghi chú nhỏ bên cạnh, có thể không truyền
// ============================================================

function SectionHeading({
  icon,
  title,
  note,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  note?: string;
}) {
  return (
    <View style={s.sectionHeading}>
      {/* Icon bên trái */}
      <Ionicons name={icon} size={22} color={PINK} />

      {/* Tiêu đề chính */}
      <Text style={s.sectionHeadingText}>{title}</Text>

      {/* Ghi chú phụ - chỉ render khi có note */}
      {note && <Text style={s.sectionNote}>{note}</Text>}
    </View>
  );
}

// ============================================================
// 18. COMPONENT - NÚT CỐ ĐỊNH PHÍA DƯỚI
// ============================================================
//
// Component này được sử dụng ở:
// - Bước 1: "Tiếp tục · 100.000đ"
// - Bước 2: "Tiếp tục"
// - Bước 3: "Tôi đã chuyển khoản"
//            hoặc "Xác nhận đóng góp"
//
// Việc tách thành component giúp giao diện các nút đồng nhất.
//
// Props:
// - title   : nội dung hiển thị trên nút
// - onPress : hành động khi người dùng bấm
// ============================================================

// ============================================================
// NÚT CTA DÙNG CHUNG
// Gradient theo mockup: hồng → xanh
// ============================================================

function BottomButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <View style={s.bottomBar}>
      <Pressable
        onPress={onPress}
        style={(state) => [(({ pressed }) => [
          s.continuePressable,
          pressed && {
            opacity: 1,
          },
        ])(state), { overflow: 'hidden', borderColor: 'transparent' }]}
      >
{({ pressed }) => <><BrandActionBackground radius={0} disabled={false} /><>
<LinearGradient
          colors={(pressed ? theme.buttons.pressedGradient : theme.buttons.gradient)}
          start={{
            x: 0,
            y: 0.5,
          }}
          end={{
            x: 1,
            y: 0.5,
          }}
          style={s.continueButton}
        >
          <Text style={[s.continueButtonText, { color: buttonTheme.buttons.primaryText }]}>{title}</Text>

          <Ionicons name="arrow-forward" size={21} color={buttonTheme.buttons.primaryText} />
        </LinearGradient>
</></>}
</Pressable>
    </View>
  );
}

// ============================================================
// 19. STYLES
// ============================================================
//
// Style được chia thành các nhóm:
//
// A. Layout chung
// B. Header
// C. Nội dung ScrollView
// D. Card chiến dịch
// E. Tiêu đề section
// F. Bước 1 - Số tiền
// G. Bước 1 - Lời nhắn
// H. Bước 1 - Ẩn danh / minh bạch
// I. Bước 2 - Tóm tắt số tiền
// J. Bước 2 - Phương thức thanh toán
// K. Bước 3 - Xác nhận
// L. Bước 3 - Chuyển khoản / VietQR
// M. Thông báo
// N. Bottom button
// O. Bước 4 - Thành công
//
// ============================================================

const s = StyleSheet.create({
  successFooter: { flexDirection: 'row', gap: 9, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 },
  successAction: { flex: 1, minHeight: 40, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 10 },
  successActionText: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  // ==========================================================
  // A. LAYOUT CHUNG
  // ==========================================================

  // SafeAreaView bao toàn bộ màn hình
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  // Dùng cho màn hình báo không tìm thấy chiến dịch
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Chữ thông báo khi không tìm thấy dữ liệu
  emptyText: {
    fontSize: 15,
    color: MUTED,
  },

  // ==========================================================
  // B. HEADER
  // ==========================================================

  // Thanh header trên cùng
  header: {
    height: 58,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,

    paddingHorizontal: 12,

    backgroundColor: "#FFFFFF",
  },

  // Vùng bấm nút Back
  headerButton: {
    width: 42,
    height: 42,

    justifyContent: "center",
    alignItems: "flex-start",
  },

  // Tiêu đề chính giữa header
  headerTitle: {
    flex: 1,

    textAlign: "center",

    fontSize: 17,
    fontWeight: "800",

    color: NAVY,
  },

  // Khu vực bên phải header
  // Có cùng chiều rộng với nút Back để title luôn cân giữa
  headerRight: {
    width: 42,
    alignItems: "flex-end",
  },

  // ==========================================================
  // C. NỘI DUNG SCROLLVIEW
  // ==========================================================

  // Padding chung cho nội dung bước 1 - 3
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  // ==========================================================
  // D. CARD THÔNG TIN CHIẾN DỊCH
  // ==========================================================

  // Khung chứa ảnh + thông tin chiến dịch
  campaignCard: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    marginBottom: 10,
  },

  // Ảnh lớn dùng ở bước nhập số tiền
  campaignImage: {
    width: 120,
    height: 130,

    borderRadius: 12,
  },

  // Ảnh nhỏ dùng khi compact = true
  campaignImageSmall: {
    width: 82,
    height: 68,

    borderRadius: 10,
  },

  // Phần text nằm bên phải ảnh
  campaignCopy: {
    flex: 1,
    justifyContent: "center",
  },

  // Tag danh mục chiến dịch
  categoryBadge: {
    alignSelf: "flex-start",

    paddingHorizontal: 8,
    paddingVertical: 3,

    borderRadius: 999,

    backgroundColor: "#FDEAF5",

    marginBottom: 6,
  },

  // Chữ bên trong tag danh mục
  categoryText: {
    fontSize: 10,
    fontWeight: "700",

    color: PINK,
  },

  // Tên chiến dịch
  campaignTitle: {
    fontSize: 17,
    lineHeight: 22,

    fontWeight: "800",

    color: NAVY,
  },

  // Tên tổ chức / quỹ
  campaignOrg: {
    marginTop: 5,

    fontSize: 11.5,
    lineHeight: 16,

    color: MUTED,
  },

  // Hàng hiển thị số người đã đóng góp
  donorRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    marginTop: 7,
  },

  // Chữ hiển thị số người đã đóng góp
  donorText: {
    fontSize: 11,

    color: MUTED,
  },

  // ==========================================================
  // E. TIÊU ĐỀ CỦA TỪNG SECTION
  // ==========================================================

  // Ví dụ:
  // [icon] Số tiền đóng góp
  // [icon] Lời nhắn (không bắt buộc)
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    marginTop: 2,
    marginBottom: 6,
  },

  // Tiêu đề chính
  sectionHeadingText: {
    fontSize: 15,
    fontWeight: "800",

    color: NAVY,
  },

  // Ghi chú nhỏ như "(không bắt buộc)"
  sectionNote: {
    fontSize: 11.5,
    color: MUTED,
  },

  // ==========================================================
  // F. BƯỚC 1 - NHẬP SỐ TIỀN
  // ==========================================================

  // Khung nhập số tiền
  amountInput: {
    height: 64,

    borderWidth: 1,
    borderColor: "#DDE1E9",
    borderRadius: 10,

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",
  },

  // TextInput nhập tiền
  amountInputText: {
    flex: 1,

    fontSize: 28,
    fontWeight: "500",

    color: NAVY,
  },

  // Ký hiệu "đ"
  currency: {
    fontSize: 22,
    color: MUTED,
  },

  // Grid chứa các mức tiền gợi ý
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 8,

    marginTop: 10,
    marginBottom: 20,
  },

  // Một nút tiền gợi ý
  quickAmount: {
    width: "31.5%",
    minHeight: 45,

    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",
  },

  // Trạng thái nút tiền đang được chọn
  quickAmountSelected: {
    borderColor: theme.buttons.text,
    backgroundColor: theme.buttons.secondaryBackground,
  },

  // Chữ của nút tiền
  quickAmountText: {
    fontSize: 13,
    fontWeight: "600",

    color: NAVY,
  },

  // Chữ khi nút tiền được chọn
  quickAmountTextSelected: {
    color: theme.buttons.text,
  },

  // ==========================================================
  // G. BƯỚC 1 - LỜI NHẮN
  // ==========================================================

  // Khung chứa TextInput lời nhắn
  messageBox: {
    height: 100,

    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,

    padding: 12,

    marginBottom: 8,

    backgroundColor: "#FFFFFF",
  },

  // TextInput nhập lời nhắn
  messageInput: {
    flex: 1,

    textAlignVertical: "top",

    fontSize: 13,
    lineHeight: 19,

    color: TEXT,
  },

  // Bộ đếm ký tự 0/200
  counter: {
    textAlign: "right",

    fontSize: 11,

    color: "#98A1B3",
  },

  // ==========================================================
  // H. BƯỚC 1 - ĐÓNG GÓP ẨN DANH / MINH BẠCH
  // ==========================================================

  // Hàng chứa icon + mô tả + switch
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    paddingVertical: 12,
  },

  // Vùng icon mắt
  anonymousIcon: {
    width: 30,
    alignItems: "center",
  },

  // Tiêu đề "Đóng góp ẩn danh"
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",

    color: NAVY,
  },

  // Mô tả bên dưới
  rowDescription: {
    marginTop: 3,

    fontSize: 11,
    lineHeight: 15,

    color: MUTED,
  },

  // Box thông báo minh bạch
  trustBox: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    backgroundColor: "#FFF1FA",

    borderRadius: 10,

    padding: 11,

    marginTop: 12,
  },

  // Nội dung thông báo minh bạch
  trustText: {
    flex: 1,

    fontSize: 11.5,
    lineHeight: 17,

    color: TEXT,
  },

  // ==========================================================
  // I. BƯỚC 2 - TÓM TẮT SỐ TIỀN
  // ==========================================================

  // Hàng:
  // Số tiền đóng góp              100.000đ
  amountSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 13,

    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,

    marginBottom: 20,
  },

  // Label bên trái
  summaryLabel: {
    fontSize: 13,
    color: MUTED,
  },

  // Số tiền bên phải
  summaryAmount: {
    fontSize: 20,
    fontWeight: "800",

    color: BLUE,
  },

  // ==========================================================
  // J. BƯỚC 2 - PHƯƠNG THỨC THANH TOÁN
  // ==========================================================

  // Danh sách các phương thức
  methodList: {
    gap: 8,
  },

  // Một card phương thức
  methodCard: {
    minHeight: 74,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,

    backgroundColor: "#FFFFFF",
  },

  // Card đang được chọn
  methodSelected: {
    borderColor: theme.buttons.text,

    // Hồng cực nhạt giống mockup
    backgroundColor: theme.buttons.secondaryBackground,
  },

  // Khu vực icon bên trái
  methodIcon: {
    width: 42,
    alignItems: "center",
  },

  // Hàng chứa tên phương thức + badge phổ biến
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  // Tên phương thức
  methodTitle: {
    fontSize: 14,
    fontWeight: "700",

    color: NAVY,
  },

  // Mô tả phương thức
  methodDescription: {
    marginTop: 4,

    fontSize: 11,
    lineHeight: 16,

    color: MUTED,
  },

  // Badge "Phổ biến"
  popularBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 7,

    backgroundColor: "#FCE7F4",
  },

  // Chữ "Phổ biến"
  popularText: {
    fontSize: 9,
    fontWeight: "600",

    color: PINK,
  },

  // Vòng tròn radio chưa chọn
  radio: {
    width: 20,
    height: 20,

    borderRadius: 10,

    borderWidth: 1.5,
    borderColor: "#C9CED8",

    justifyContent: "center",
    alignItems: "center",
  },

  // Viền radio khi đang chọn
  radioSelected: {
    borderColor: theme.buttons.text,
  },

  radioDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: theme.buttons.text,
  },

  // ==========================================================
  // K. BƯỚC 3 - BẢNG XÁC NHẬN
  // ==========================================================

  // Khung chứa các dòng xác nhận
  confirmTable: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,

    marginBottom: 18,
  },

  // Một dòng thông tin
  confirmRow: {
    minHeight: 50,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    gap: 20,

    borderBottomWidth: 1,
    borderBottomColor: BORDER,

    paddingVertical: 10,
  },

  // Tên trường bên trái
  confirmLabel: {
    fontSize: 12,
    color: MUTED,
  },

  // Giá trị bên phải
  confirmValue: {
    flex: 1,

    textAlign: "right",

    fontSize: 12,
    fontWeight: "600",

    color: NAVY,
  },

  // Dùng để làm nổi bật số tiền
  confirmHighlight: {
    fontSize: 18,
    fontWeight: "800",

    color: BLUE,
  },

  // ==========================================================
  // L. BƯỚC 3 - THÔNG TIN CHUYỂN KHOẢN / VIETQR
  // ==========================================================

  // Card bao toàn bộ thông tin chuyển khoản
  bankCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,

    overflow: "hidden",

    marginBottom: 14,

    backgroundColor: "#FFFFFF",
  },

  // Header của card chuyển khoản
  bankHeader: {
    height: 47,

    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    paddingHorizontal: 12,

    backgroundColor: "#F8FBFF",
  },

  // Tiêu đề "Thông tin chuyển khoản"
  bankHeaderTitle: {
    flex: 1,

    fontSize: 14,
    fontWeight: "700",

    color: NAVY,
  },

  // Chữ VIETQR demo
  vietqr: {
    fontSize: 17,
    fontWeight: "900",

    color: "#D71920",
  },

  // Body gồm QR + thông tin tài khoản
  bankBody: {
    flexDirection: "row",

    padding: 12,

    gap: 12,
  },

  // Khu vực QR bên trái
  qrPlaceholder: {
    width: 125,

    alignItems: "center",
    justifyContent: "center",

    borderRightWidth: 1,
    borderRightColor: BORDER,
  },

  // Chữ napas 247 dưới QR
  napas: {
    marginTop: 4,

    fontSize: 11,
    fontWeight: "800",

    color: "#245C9E",
  },

  // Phần thông tin ngân hàng bên phải
  bankInfo: {
    flex: 1,
  },

  // Label:
  // Ngân hàng
  // Số tài khoản
  // Tên tài khoản
  // Nội dung chuyển khoản
  bankLabel: {
    marginTop: 5,

    fontSize: 10,

    color: MUTED,
  },

  // Giá trị thông tin ngân hàng
  bankValue: {
    marginTop: 1,

    fontSize: 11,
    lineHeight: 15,

    fontWeight: "600",

    color: NAVY,
  },

  // Số tài khoản được làm nổi bật hơn
  accountNumber: {
    fontSize: 15,
    fontWeight: "800",

    color: NAVY,
  },

  // Khung chứa nội dung chuyển khoản + icon copy
  transferCode: {
    marginTop: 4,

    minHeight: 35,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 8,

    borderRadius: 7,

    backgroundColor: "#EFF7FF",
  },

  // Mã nội dung chuyển khoản
  transferCodeText: {
    fontSize: 12,
    fontWeight: "700",

    color: BLUE,
  },

  // ==========================================================
  // M. THÔNG BÁO / LƯU Ý
  // ==========================================================

  // Box lưu ý ở bước xác nhận
  noteBox: {
    flexDirection: "row",

    gap: 9,

    padding: 12,

    borderRadius: 10,

    backgroundColor: "#EEF7FF",
  },

  // Tiêu đề "Lưu ý"
  noteTitle: {
    fontSize: 13,
    fontWeight: "700",

    color: NAVY,
  },

  // Nội dung lưu ý
  noteText: {
    marginTop: 4,

    fontSize: 10.5,
    lineHeight: 16,

    color: MUTED,
  },

  // Thông báo dùng cho các phương thức không phải
  // chuyển khoản ngân hàng / VietQR
  paymentNotice: {
    flexDirection: "row",

    gap: 9,

    padding: 14,

    borderRadius: 10,

    backgroundColor: "#F2F8FF",

    marginBottom: 14,
  },

  // Nội dung thông báo thanh toán
  paymentNoticeText: {
    flex: 1,

    fontSize: 12,
    lineHeight: 18,

    color: TEXT,
  },

  // ==========================================================
  // N. THANH NÚT CỐ ĐỊNH PHÍA DƯỚI
  // ==========================================================

  // Thanh trắng phía dưới màn hình
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,

    backgroundColor: "#FFFFFF",
  },

  // Nút chính:
  // Tiếp tục / Tôi đã chuyển khoản / Xác nhận
  continueButton: {
    height: 54,

    borderRadius: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 12,
  },

  // Chữ trong nút chính
  continueButtonText: {
    fontSize: 16,
    fontWeight: "800",

    color: theme.buttons.primaryText,
  },

  // ==========================================================
  // O. BƯỚC 4 - MÀN HÌNH THÀNH CÔNG
  // ==========================================================

  // Nội dung ScrollView của màn cảm ơn
  successContent: {

    paddingHorizontal: 18,

    // Giảm mạnh khoảng trắng trên
    paddingTop: 14,

    paddingBottom: 12,
  },

  // Khu vực chứa icon trái tim
  successArt: {
    alignItems: "center",
  },

  // Hình tròn nền phía sau trái tim
  successCircle: {
    width: 92,
    height: 92,

    borderRadius: 46,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FCE9F5",
  },

  // Tiêu đề:
  // Cảm ơn bạn
  // đã đóng góp!
  successTitle: {
    marginTop: 8,

    textAlign: "center",

    fontSize: 27,
    lineHeight: 33,

    fontWeight: "900",

    color: NAVY,
  },

  // Mô tả bên dưới lời cảm ơn
  successDescription: {
    marginTop: 8,

    textAlign: "center",

    fontSize: 13,
    lineHeight: 19,

    color: MUTED,

    paddingHorizontal: 20,
  },

  // Card chứa thông tin giao dịch
  receiptCard: {
    marginTop: 20,

    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,

    padding: 12,

    backgroundColor: "#FFFFFF",
  },

  // Thông báo đóng góp đã được ghi nhận
  successNotice: {
    marginTop: 16,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    padding: 12,

    borderRadius: 10,

    backgroundColor: "#FFF1FA",
  },

  // Nội dung thông báo
  successNoticeText: {
    flex: 1,

    fontSize: 11.5,
    lineHeight: 17,

    color: TEXT,
  },

  // Nút chính:
  // "Xem lịch sử đóng góp"
  primarySuccessButton: {
    marginTop: 14,

    borderRadius: 12,

    overflow: "hidden",
  },

  primarySuccessGradient: {
    height: 52,

    alignItems: "center",
    justifyContent: "center",
  },

  // Chữ của nút chính
  primarySuccessText: {
    fontSize: 15,
    fontWeight: "800",

    color: theme.buttons.primaryText,
  },

  // Nút phụ:
  // "Về chiến dịch"
  secondaryButton: {
    marginTop: 8,

    height: 50,

    borderWidth: 1.5,
    borderColor: BLUE,
    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",
  },

  // Chữ của nút "Về chiến dịch"
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",

    color: BLUE,
  },
  continuePressable: {
    borderRadius: 14,
    overflow: "hidden",
  },
});

