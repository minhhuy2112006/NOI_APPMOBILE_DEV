import { paidTotal } from "./model";
import { openAccount } from "./navigation";
import { PageHeader } from "../../components/PageHeader";

import { accountSession, exitDemo, profileSession } from "./session";
import { walletSession } from "../store/session";
import { donationSession } from "../contributions/session";

import { type ComponentProps } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Button } from "../../components/ui";
import { theme } from "../../theme/tokens";

type Icon = ComponentProps<typeof Ionicons>["name"];
const colors = theme.colors;
const menus: {
  title: string;
  subtitle: string;
  icon: Icon;
  color: string;
  tint: string;
  detail: string;
}[] = [
  {
    title: "Hồ sơ cá nhân",
    subtitle: "Xem và cập nhật thông tin của bạn",
    icon: "person",
    color: "#B8459A",
    tint: "#F7D4EF",
    detail: "",
  },
  {
    title: "Đăng ký của tôi",
    subtitle: "Chiến dịch đã đăng ký và công việc được giao",
    icon: "clipboard",
    color: "#9255D1",
    tint: "#F1EAFB",
    detail:
      "Chưa có đăng ký thực tế. Hãy khám phá các chiến dịch ở tab Chiến dịch. Đăng ký demo hiện chưa được lưu vào tài khoản.",
  },
  {
    title: "Điểm danh",
    subtitle: "Check-in, xem lịch sử tham gia",
    icon: "calendar",
    color: "#479779",
    tint: "#E6F5ED",
    detail:
      "Chưa có lịch sử điểm danh. Check-in sẽ khả dụng khi tài khoản và chiến dịch được kết nối với hệ thống.",
  },
  {
    title: "Quyên góp",
    subtitle: "Theo dõi lịch sử và đóng góp của bạn",
    icon: "heart",
    color: "#D54C8D",
    tint: "#FFD7E9",
    detail:
      "Chưa có giao dịch thực tế. Số tiền trên thẻ thống kê chỉ minh họa giao diện, không phải số tiền bạn đã quyên góp.",
  },
  {
    title: "Điểm Phước",
    subtitle: "Xem điểm, hạng và các phần thưởng",
    icon: "star",
    color: "#B47A16",
    tint: "#FFF4D8",
    detail:
      "1.250 là số điểm minh họa. Điểm Phước không có giá trị tiền tệ, chỉ ghi nhận và khuyến khích đóng góp. Chưa có điểm hoặc quà thực tế trong tài khoản.",
  },
  {
    title: "Hỗ trợ",
    subtitle: "Câu hỏi thường gặp và liên hệ với NOI",
    icon: "headset",
    color: "#3686CF",
    tint: "#D5E9FF",
    detail:
      "Đây là bản trải nghiệm giao diện NOI. Kênh liên hệ hỗ trợ chính thức sẽ được bổ sung sau khi xác nhận thông tin từ hệ thống.",
  },
];
const stats: {
  value: string;
  label: string;
  icon: Icon;
  tint: string;
  color: string;
  menu: number;
}[] = [
  {
    value: "12",
    label: "Đăng ký\nhoạt động",
    icon: "clipboard",
    tint: "#F7D4EF",
    color: "#B8459A",
    menu: 1,
  },
  {
    value: "86",
    label: "Giờ tình\nnguyện",
    icon: "time",
    tint: "#E6F5ED",
    color: "#479779",
    menu: 2,
  },
  {
    value: "320.000đ",
    label: "Đã quyên góp",
    icon: "heart",
    tint: "#FFD7E9",
    color: "#D54C8D",
    menu: 3,
  },
  {
    value: "1.250",
    label: "Điểm Phước",
    icon: "star",
    tint: "#FFF4D8",
    color: "#B47A16",
    menu: 4,
  },
];

export default function AccountScreen() {
  const { name, quote } = profileSession.useValue();
  const { active: demoActive } = accountSession.useValue();
  const wallet = walletSession.useValue();
  const donations = donationSession.useValue();
  const donated = paidTotal(donations);
  const currentStats = stats.map((stat) =>
    stat.menu === 4
      ? { ...stat, value: wallet.balance.toLocaleString("vi-VN") }
      : stat.menu === 3
        ? { ...stat, value: donated.toLocaleString("vi-VN") + "đ" }
        : stat,
  );
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || fontScale > 1.2;
  const edit = () => openAccount("edit");
  const openMenu = (index: number) => {
    if (index === 2) {
      router.push("/attendance");
      return;
    }
    const destinations = [
      "profile",
      "registrations",
      null,
      "donations",
      "points",
      "support",
    ] as const;
    const section = destinations[index];
    if (section) openAccount(section);
  };
  const logout = () =>
    Alert.alert(
      "Bạn có chắc muốn đăng xuất?",
      "Bạn đang dùng hồ sơ demo, chưa có phiên đăng nhập Supabase. Tên và giới thiệu sẽ được đặt lại theo luồng demo hiện tại.",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: exitDemo },
      ],
    );
  return (
    <LinearGradient colors={theme.gradients.soft} style={s.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={s.fill}>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.headerArea}>
  <PageHeader
    title="TÀI KHOẢN"
    subtitle="Quản lý hồ sơ và thông tin cá nhân"
  />

  <View style={s.actions}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tìm chiến dịch"
      onPress={() => router.navigate('/')}
      style={s.iconButton}
    >
      <Ionicons
        name="search-outline"
        size={23}
        color={colors.text}
      />
    </Pressable>

    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Thông báo"
      onPress={() =>
        Alert.alert(
          'Thông báo',
          'Chưa kết nối thông báo tài khoản.',
        )
      }
      style={s.iconButton}
    >
      <Ionicons
        name="notifications-outline"
        size={23}
        color={colors.text}
      />
    </Pressable>

    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Trợ giúp"
      onPress={() => openMenu(5)}
      style={s.iconButton}
    >
      <Ionicons
        name="help-circle-outline"
        size={26}
        color={colors.text}
      />
    </Pressable>
  </View>
</View>
          {!demoActive ? (
            <View style={s.guest}>
              <Text style={s.name}>Chào mừng đến với NOI</Text>
              <Text style={s.body}>
                Bạn đã thoát hồ sơ demo. Đăng nhập thật sẽ được bổ sung khi kết
                nối Supabase.
              </Text>
              <Button
                title="Trải nghiệm lại hồ sơ mẫu"
                onPress={() => accountSession.set({ active: true })}
              />
            </View>
          ) : (
            <>
              <LinearGradient
                colors={theme.gradients.profile}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  s.profile,
                  compact && { flexDirection: "column", alignItems: "stretch" },
                ]}
              >
                <View style={s.avatar}>
                  <Image
                    source={require("../../../assets/profile-avatar.png")}
                    accessibilityLabel="Ảnh đại diện"
                    resizeMode="cover"
                    style={{ width: "100%", height: "100%", borderRadius: 38 }}
                  />
                </View>
                <View style={s.profileCopy}>
                  <View style={s.nameRow}>
                    <Text style={s.name}>{name}</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={edit}
                      style={s.edit}
                    >
                      <Ionicons name="pencil" size={13} color="#615BB3" />
                      <Text style={s.editText}>Chỉnh sửa</Text>
                    </Pressable>
                  </View>
                  <View style={s.role}>
                    <Ionicons name="leaf" size={13} color={colors.primary} />
                    <Text style={s.roleText}>Tình nguyện viên</Text>
                  </View>
                  <Text style={s.quote}>“{quote}”</Text>
                </View>
              </LinearGradient>

              <View style={s.stats}>
                {currentStats.map((stat, index) => (
                  <Pressable
                    key={stat.label}
                    accessibilityRole="button"
                    accessibilityLabel={`${stat.value} ${stat.label.replace("\n", " ")} — dữ liệu mẫu`}
                    onPress={() => openMenu(stat.menu)}
                    style={[
                      s.stat,
                      { width: compact ? "50%" : "25%" },
                      index > 0 && !compact && s.divider,
                    ]}
                  >
                    <View style={[s.statIcon, { backgroundColor: stat.tint }]}>
                      <Ionicons name={stat.icon} size={19} color={stat.color} />
                    </View>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statLabel}>{stat.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={s.menuList}>
                {menus.map((menu, index) => (
                  <Pressable
                    key={menu.title}
                    accessibilityRole="button"
                    onPress={() => openMenu(index)}
                    style={({ pressed }) => [s.menu, pressed && s.pressed]}
                  >
                    <View style={[s.menuIcon, { backgroundColor: menu.tint }]}>
                      <Ionicons name={menu.icon} size={23} color={menu.color} />
                    </View>
                    <View style={s.menuCopy}>
                      <Text style={s.menuTitle}>{menu.title}</Text>
                      <Text style={s.subtitle}>{menu.subtitle}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={colors.primary}
                    />
                  </Pressable>
                ))}
              </View>
              <View style={s.menuList}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openAccount("settings")}
                  style={({ pressed }) => [s.menu, pressed && s.pressed]}
                >
                  <View style={[s.menuIcon, { backgroundColor: "#D5E9FF" }]}>
                    <Ionicons
                      name="settings-outline"
                      size={23}
                      color={colors.blue}
                    />
                  </View>
                  <View style={s.menuCopy}>
                    <Text style={s.menuTitle}>Cài đặt</Text>
                    <Text style={s.subtitle}>
                      Tùy chọn ứng dụng và tài khoản
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={colors.primary}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={logout}
                  style={({ pressed }) => [s.menu, pressed && s.pressed]}
                >
                  <View style={[s.menuIcon, { backgroundColor: "#FFE0EC" }]}>
                    <Ionicons
                      name="log-out-outline"
                      size={23}
                      color="#C73F55"
                    />
                  </View>
                  <View style={s.menuCopy}>
                    <Text style={[s.menuTitle, { color: "#C73F55" }]}>
                      Đăng xuất
                    </Text>
                    <Text style={s.subtitle}>Thoát khỏi tài khoản của bạn</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={colors.primary}
                  />
                </Pressable>
              </View>
              <Text style={s.footer}>Mỗi việc tốt đều đáng được ghi nhận.</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brand: { width: 62, transform: [{ rotate: "-6deg" }] },
  logo: { fontSize: 32, fontWeight: "900", letterSpacing: -2 },
  brandCaption: {
    fontSize: 8,
    lineHeight: 11,
    color: "#5C6A80",
    fontStyle: "italic",
  },
  headerArea: {
    position: 'relative',
    marginBottom: -10,
  },
  
  actions: {
    position: 'absolute',
    right: 0,
    top: 14,
  
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  
    zIndex: 2,
  },
  
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 142,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFF8FC",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: { fontSize: 38, fontWeight: "700", color: colors.primary },
  profileCopy: { flex: 1, gap: 7 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  name: { fontSize: 24, fontWeight: "700", color: colors.text, flexShrink: 1 },
  edit: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 22,
    backgroundColor: "#FFFFFFB3",
  },
  editText: { fontSize: 11, color: "#615BB3", fontWeight: "600" },
  role: {
    flexDirection: "row",
    gap: 4,
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: "#F2C6E7",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  roleText: { fontSize: 11, color: colors.primaryInk, fontWeight: "600" },
  quote: { fontSize: 12, lineHeight: 19, color: colors.muted },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 14,
    backgroundColor: "#FFFFFFE8",
    borderRadius: 18,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 4,
  },
  divider: { borderLeftWidth: 1, borderLeftColor: "#EEEAF5" },
  statIcon: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 14, fontWeight: "700", color: colors.text },
  statLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: colors.muted,
    textAlign: "center",
  },
  menuList: { gap: 8 },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    minHeight: 64,
    borderRadius: 15,
    backgroundColor: "#FFFFFFF0",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: { flex: 1, gap: 3 },
  menuTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 11, lineHeight: 17, color: colors.muted },
  pressed: { opacity: 0.65 },
  footer: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
    paddingTop: 5,
  },
  guest: { gap: 20, padding: 24, borderRadius: 20, backgroundColor: "white" },
  body: { fontSize: 15, lineHeight: 24, color: colors.muted },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#17243B66",
  },
  sheet: {
    maxHeight: "90%",
    padding: 22,
    paddingBottom: 36,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "#FFFFFF",
  },
  sheetTitle: { fontSize: 21, fontWeight: "700", color: colors.text, flex: 1 },
  sheetContent: { gap: 15, paddingVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#FAF8FC",
  },
  pageHeaderWrap: {
    flex: 1,
    minWidth: 0,
  },
});
