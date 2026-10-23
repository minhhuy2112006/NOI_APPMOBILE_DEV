import AccountUtilityScreen from './AccountUtilityScreen';
import { LinearGradient } from 'expo-linear-gradient';
import DonationsScreen from './DonationsScreen';
import ProfileScreen from "./ProfileScreen";
import RegistrationsScreen from "./RegistrationsScreen";
import PointsScreen from "./PointsScreen";
import SupportScreen from "./SupportScreen";
import SettingsScreen from "./SettingsScreen";

import { useState, type PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { Button, Card, Chip } from "../../components/ui";
import { theme } from "../../theme/tokens";
import { useAssistantContext } from "../assistant/Assistant";
import { donationSession } from "../contributions/session";
import { accountSession, profileSession } from "./session";
import {
  donationLabels,
  donationMatches,
  paidTotal,
  sections,
  type Section,
} from "./model";

const money = (value: number) => value.toLocaleString("vi-VN") + "đ";
function Copy({ children }: PropsWithChildren) {
  return <Text style={s.body}>{children}</Text>;
}
function Heading({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={s.heading}>
      {children}
    </Text>
  );
}
function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  numeric = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numeric?: boolean;
}) {
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={numeric ? "number-pad" : "default"}
        maxLength={multiline ? 1000 : 100}
        style={[
          s.input,
          multiline && { minHeight: 90, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
function Filters({
  values,
  value,
  onChange,
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={s.filters}>
      {values.map((label) => (
        <Chip
          key={label}
          label={label}
          selected={label === value}
          onPress={() => onChange(label)}
        />
      ))}
    </View>
  );
}

function EditProfile() {
  const [draft, setDraft] = useState(profileSession.read);
  const [error, setError] = useState("");
  const fields: {
    key: keyof typeof draft;
    label: string;
    multiline?: boolean;
    numeric?: boolean;
  }[] = [
    { key: "name", label: "Họ và tên" },
    { key: "birthday", label: "Ngày sinh" },
    { key: "gender", label: "Giới tính" },
    { key: "city", label: "Khu vực sinh sống" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Số điện thoại" },
    { key: "emergencyName", label: "Liên hệ khẩn cấp — Họ và tên" },
    { key: "emergencyRelationship", label: "Mối quan hệ" },
    { key: "emergencyPhone", label: "Số điện thoại khẩn cấp" },
    { key: "quote", label: "Giới thiệu bản thân", multiline: true },
    { key: "skills", label: "Kỹ năng", multiline: true },
    { key: "interests", label: "Sở thích", multiline: true },
    { key: "purpose", label: "Mục tiêu thiện nguyện", multiline: true },
    { key: "goalHours", label: "Mục tiêu số giờ", numeric: true },
    { key: "goalYear", label: "Năm", numeric: true },
  ];
  const save = () => {
    if (!draft.name.trim()) {
      setError("Vui lòng nhập tên hiển thị.");
      return;
    }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      setError("Email chưa hợp lệ.");
      return;
    }
    if (
      !/^\d+$/.test(draft.goalHours) ||
      Number(draft.goalHours) < 1 ||
      Number(draft.goalHours) > 10000 ||
      !/^\d{4}$/.test(draft.goalYear)
    ) {
      setError("Nhập mục tiêu 1–10.000 giờ và năm gồm 4 chữ số.");
      return;
    }
    profileSession.set({
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
    });
    if (router.canGoBack()) router.back();
    else
      router.replace({
        pathname: "/account/[section]",
        params: { section: "profile" },
      });
  };
  return (
    <>
      <LinearGradient colors={['#FFEAF5', '#EBEFFF', '#E6F3FF']} style={s.editHero}>
        <Text style={s.eyebrow}>HỒ SƠ CỦA BẠN</Text>
        <Text style={s.heading}>Thêm một chút về bạn</Text>
        <Copy>Thông tin đầy đủ giúp NOI kết nối bạn với những hoạt động phù hợp.</Copy>
      </LinearGradient>
      {[
        { title: 'Thông tin cá nhân', description: 'Để mọi người hiểu và kết nối với bạn.', from: 0, to: 6 },
        { title: 'Liên hệ khẩn cấp', description: 'Người có thể liên hệ khi bạn cần hỗ trợ.', from: 6, to: 9 },
        { title: 'Điều làm nên bạn', description: 'Chia sẻ thế mạnh và những điều bạn quan tâm.', from: 9, to: 12 },
        { title: 'Hành trình thiện nguyện', description: 'Đặt một mục tiêu cho những việc tốt sắp tới.', from: 12, to: 15 },
      ].map(group => <View key={group.title} style={s.editPanel}>
        <Heading>{group.title}</Heading><Copy>{group.description}</Copy>
        {fields.slice(group.from, group.to).map(field => <Field key={field.key} label={field.label} multiline={field.multiline} numeric={field.numeric} value={draft[field.key]} onChangeText={value => setDraft(current => ({ ...current, [field.key]: value }))} />)}
      </View>)}
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      <Button title="Lưu thay đổi" onPress={save} />
    </>
  );
}

function Donations() {
  const entries = donationSession.useValue();
  const [filter, setFilter] = useState("Tất cả");
  const total = paidTotal(entries);
  const visible = entries.filter((e) => donationMatches(e, filter));
  return (
    <>
      <Card>
        <Heading>Tổng số đã quyên góp</Heading>
        <Text style={s.total}>{money(total)}</Text>
        <Copy>
          Chỉ tính giao dịch được hệ thống xác nhận. Thao tác demo không cộng
          vào tổng thực tế.
        </Copy>
      </Card>
      <Heading>Lịch sử đóng góp</Heading>
      <Filters
        values={["Tất cả", "Đã thanh toán", "Đang chờ", "Đã hủy"]}
        value={filter}
        onChange={setFilter}
      />
      {!visible.length && (
        <Card>
          <Copy>Chưa có giao dịch trong mục này.</Copy>
        </Card>
      )}
      {visible.map((e) => (
        <Card key={e.id}>
          <Heading>{e.target}</Heading>
          <Text style={s.label}>{money(e.amount)}</Text>
          <Copy>{e.date}</Copy>
          <Copy>
            {e.status
              ? donationLabels[e.status]
              : "Thao tác demo · Chưa có thanh toán"}
          </Copy>
          <Copy>{e.id}</Copy>
          {e.method ? <Copy>{e.method}</Copy> : null}
        </Card>
      ))}
      <Card>
        <Heading>Phương thức thanh toán</Heading>
        <Copy>Chuyển khoản ngân hàng · VietQR · MoMo</Copy>
        <Copy>
          Các phương thức đang có trong luồng đóng góp mẫu. Chưa liên kết ví,
          thẻ hoặc tài khoản thanh toán thật.
        </Copy>
        <Button
          title="Khám phá chiến dịch đóng góp"
          onPress={() => router.navigate("/contributions")}
        />
      </Card>
    </>
  );
}
function Unavailable({ section }: { section: Section }) {
  const copy: Partial<Record<Section, string>> = {
    password:
      "Đổi mật khẩu cần phiên đăng nhập thật và dịch vụ xác thực. Hồ sơ demo không có mật khẩu để thay đổi.",
    security:
      "Mobile chưa kết nối xác thực tài khoản. Chưa thể quản lý xác thực hai bước hoặc phiên đăng nhập.",
    devices:
      "Chưa có dữ liệu phiên đăng nhập từ máy chủ. Không hiển thị thiết bị giả hoặc mô phỏng thao tác thu hồi phiên.",
    terms:
      "Điều khoản sử dụng chính thức chưa được cấu hình trong mobile. Nội dung sẽ được bổ sung khi có văn bản đã công bố.",
    privacy:
      "Chính sách bảo mật chính thức chưa được cấu hình trong mobile. Trang này chưa thay thế văn bản pháp lý của NOI.",
  };
  return (
    <Card>
      <Heading>Chưa khả dụng</Heading>
      <Copy>{copy[section]}</Copy>
    </Card>
  );
}
export default function AccountDetailScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const section =
    typeof params.section === "string" &&
    Object.hasOwn(sections, params.section)
      ? (params.section as Section)
      : null;
  const session = accountSession.useValue();
  useAssistantContext("Tài khoản", {
    section: section ? sections[section] : "Không tìm thấy",
    source: "demo",
  });
  const title = section ? sections[section] : "Không tìm thấy trang";
  if (session.active && section && (section === 'password' || section === 'security' || section === 'devices' || section === 'terms' || section === 'privacy')) return <AccountUtilityScreen section={section} />;
  if (session.active && section === "profile") return <ProfileScreen />;
  if (session.active && section === "settings") return <SettingsScreen />;
  if (session.active && section === "support") return <SupportScreen />;
  if (session.active && section === "registrations")
    return <RegistrationsScreen />;
  if (session.active && section === "points") return <PointsScreen />;
  if (session.active && section === "donations") return <DonationsScreen />;
  return (
    <LinearGradient colors={["#FFF0F8", "#F1EDFD", "#E5F3FF"]} style={s.fill}><SafeAreaView edges={["top", "left", "right", "bottom"]} style={s.page}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/account")
          }
          style={s.back}
        >
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" style={s.title}>
          {title}
        </Text>
      </View>
      <KeyboardAvoidingView
        style={s.fill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          {!session.active ? (
            <Card>
              <Copy>Bạn đã thoát hồ sơ demo.</Copy>
              <Button
                title="Về Tài khoản"
                onPress={() => router.replace("/account")}
              />
            </Card>
          ) : !section ? (
            <Card>
              <Copy>Trang không tồn tại.</Copy>
              <Button
                title="Về Tài khoản"
                onPress={() => router.replace("/account")}
              />
            </Card>
          ) : section === "edit" ? (
            <EditProfile />
          ) : section === "donations" ? (
            <Donations />
          ) : (
            <Unavailable section={section} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView></LinearGradient>
  );
}
const s = StyleSheet.create({
  editHero: { padding: 20, borderRadius: 22, gap: 9, borderWidth: 1, borderColor: '#FFFFFF' },
  eyebrow: { color: '#AD6699', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  editPanel: { padding: 14, borderRadius: 22, gap: 10, backgroundColor: '#FFFFFFDD', borderWidth: 1, borderColor: '#FFFFFF' },
  segment: {
    flexDirection: "row",
    backgroundColor: "#ECEEF6",
    borderRadius: 14,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
  },
  segmentSelected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C9D6FF",
  },
  registrationRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  taskStrip: {
    backgroundColor: "#F3F0FD",
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  fill: { flex: 1 },
  page: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingRight: 16 },
  back: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 34, color: theme.colors.text },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: "700",
    paddingVertical: 10,
    textAlign: "center",
    marginRight: 32,
  },
  content: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 10,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    color: theme.colors.text,
    fontWeight: "700",
  },
  body: { fontSize: 14, lineHeight: 22, color: theme.colors.muted },
  label: {
    fontSize: 15,
    lineHeight: 23,
    color: theme.colors.text,
    fontWeight: "600",
  },
  group: { gap: 6 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  rowCopy: { flex: 1 },
  chevron: { fontSize: 24, color: theme.colors.muted },
  input: {
    padding: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    color: theme.colors.text,
    fontSize: 16,
  },
  identity: { flexDirection: "row", gap: 16, alignItems: "center" },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  photo: { width: "100%", aspectRatio: 2, borderRadius: 12 },
  total: { fontSize: 28, fontWeight: "700", color: theme.colors.text },
  track: {
    height: 8,
    backgroundColor: "#EBEAF2",
    borderRadius: 4,
    overflow: "hidden",
  },
  progress: { height: "100%", backgroundColor: "#B7D1FF" },
  error: { color: "#AD3045" },
  faq: { minHeight: 44, justifyContent: "center" },
});

