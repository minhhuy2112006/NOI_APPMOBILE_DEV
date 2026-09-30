import { BrandHeader } from "../../components/BrandHeader";
import { useState, type ComponentProps } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui";

import { theme } from "../../theme/tokens";

type Topic = {
  title: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  tint: string;
  body: string;
};
const topics: Topic[] = [
  {
    title: "Về NOI",
    icon: "shield-checkmark",
    color: "#CD459F",
    tint: "#FCE0F0",
    body: "NOI là nền tảng kết nối hoạt động tình nguyện và quyên góp, giúp mỗi người tìm cơ hội đóng góp phù hợp và đồng hành cùng cộng đồng.",
  },
  {
    title: "Sứ mệnh",
    icon: "heart",
    color: "#D64A91",
    tint: "#FFDDEC",
    body: "Kết nối con người vì một cộng đồng tốt đẹp hơn. NOI hướng đến việc khuyến khích những hành động tốt, từ đóng góp thời gian đến hỗ trợ nguồn lực cho cộng đồng.",
  },
  {
    title: "Cách hoạt động",
    icon: "sparkles",
    color: "#C846A5",
    tint: "#F9DFF0",
    body: "Hành trình tình nguyện\n\n1. Tổ chức đăng chiến dịch hoặc nhu cầu.\n2. Tình nguyện viên tìm kiếm và đăng ký.\n3. Xét chọn và xác nhận.\n4. Chuẩn bị và phối hợp.\n5. Điểm danh và tổng kết.\n\nQuyên góp bắt đầu từ đề xuất và xác minh, sau đó đóng góp theo chiến dịch hoặc quỹ dự phòng và theo dõi cập nhật tiến độ.",
  },
  {
    title: "Các tổ chức",
    icon: "people",
    color: "#9250CC",
    tint: "#EEDFFA",
    body: "Khám phá các tổ chức và chiến dịch do họ thực hiện. Danh sách tổ chức chính thức sẽ được hiển thị sau khi kết nối dữ liệu; bản hiện tại chưa có danh bạ được xác minh.",
  },
  {
    title: "Doanh nghiệp",
    icon: "business",
    color: "#9554CC",
    tint: "#EFE0FB",
    body: "Không gian dành cho doanh nghiệp tìm hiểu cách đồng hành với các hoạt động cộng đồng. Thông tin chương trình hợp tác và kênh liên hệ chính thức đang được chuẩn bị.",
  },
  {
    title: "Minh bạch",
    icon: "shield-checkmark",
    color: "#A54BC0",
    tint: "#F1DDF7",
    body: "Theo dõi cập nhật chiến dịch và tiến độ gây quỹ. Bản ứng dụng hiện tại chưa có báo cáo tài chính, chứng từ hoặc giao dịch thực tế; nội dung sẽ được kết nối từ hệ thống NOI.",
  },
  {
    title: "Đối tác",
    icon: "globe",
    color: "#6B5BC9",
    tint: "#E7E3FD",
    body: "Thông tin các đối tác đồng hành cùng NOI sẽ được cập nhật tại đây. Chưa công bố danh sách đối tác trong bản trải nghiệm này.",
  },
  {
    title: "FAQ",
    icon: "help",
    color: "#665BC9",
    tint: "#E7E3FD",
    body: "Làm sao để tham gia?\nMở tab Chiến dịch, tìm hoạt động và xem chi tiết. Đăng ký hiện là thao tác demo.\n\nĐiểm Phước có đổi thành tiền không?\nKhông. Điểm chỉ dùng ghi nhận và khuyến khích đóng góp.\n\nỨng dụng đã nhận quyên góp thật chưa?\nChưa. Thanh toán và dữ liệu tài khoản chưa được kết nối.",
  },
  {
    title: "NOI AI",
    icon: "chatbubbles",
    color: "#4E71D3",
    tint: "#DDE7FF",
    body: "Trợ lý NOI AI đang được chuẩn bị để hỗ trợ tìm hiểu nền tảng. Hiện chưa kết nối dịch vụ AI nên chưa thể trò chuyện hoặc đưa ra gợi ý cá nhân hóa.",
  },
];

export default function AboutScreen() {
  const [selected, setSelected] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const { width, fontScale } = useWindowDimensions();
  const columns = width < 330 || fontScale > 1.3 ? 2 : 3;
  return (
    <LinearGradient colors={theme.gradients.page} style={s.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={s.fill}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
<BrandHeader title="Về NOI" subtitle="Kết nối con người vì một cộng đồng tốt đẹp hơn" large />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Video giới thiệu NOI — đang chuẩn bị"
            onPress={() =>
              setSelected({
                title: "Video giới thiệu NOI",
                body: "Video giới thiệu đang được chuẩn bị. Bạn có thể tìm hiểu NOI qua các mục bên dưới.",
              })
            }
            style={({ pressed }) => [s.hero, pressed && { opacity: 0.85 }]}
          >
            <Image
              source={require("../../../assets/about-garden.webp")}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
            />
            <View style={s.play}>
              <Ionicons name="play" size={28} color={theme.colors.blue} />
            </View>
            <LinearGradient colors={['transparent', '#172D23DB']} style={s.videoLabel}><Text style={s.videoHeading}>Cùng nhau tạo nên{'\n'}những thay đổi tích cực</Text><Text style={s.videoText}>Vì một cộng đồng tốt đẹp hơn</Text></LinearGradient>
          </Pressable>
          <View style={s.grid}>
            {topics.map((topic) => (
              <View
                key={topic.title}
                style={{ width: `${100 / columns}%`, padding: 4 }}
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelected(topic)}
                  style={({ pressed }) => [
                    s.tile,
                    pressed && { backgroundColor: "#F7DFF0" },
                  ]}
                >
                  <View style={[s.iconHalo, { backgroundColor: topic.tint }]}>
                    <Ionicons name={topic.icon} size={29} color={topic.color} />
                  </View>
                  <Text style={s.tileLabel}>{topic.title}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
        <Modal
          visible={selected !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelected(null)}
        >
          <View style={s.overlay}>
            <SafeAreaView
              edges={["bottom"]}
              style={s.sheet}
              accessibilityViewIsModal
            >
              <View style={s.sheetHeader}>
                <Text accessibilityRole="header" style={s.sheetTitle}>
                  {selected?.title}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Đóng"
                  style={s.close}
                  onPress={() => setSelected(null)}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={s.sheetBody}>
                <Text style={s.body}>{selected?.body}</Text>
                <Button title="Đóng" onPress={() => setSelected(null)} />
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  heading: {
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 20,
    overflow: "hidden",
  },
  decoration: {
    position: "absolute",
    right: 12,
    bottom: -10,
    opacity: 0.55,
    transform: [{ rotate: "-20deg" }],
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: theme.colors.primaryInk,
    marginBottom: 7,
  },
  subtitle: { fontSize: 15, lineHeight: 22, color: theme.colors.muted },
  hero: {
    aspectRatio: 1.8,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D5E8D2",
    marginBottom: 8,
  },
  play: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFFE8",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },
  videoLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40, paddingBottom: 12,
    paddingHorizontal: 12,
    pointerEvents: "none",
  },
  videoHeading: { color: "#FFFFFF", fontSize: 17, lineHeight: 22, fontWeight: "700" }, videoText: { color: "#FFFFFF", fontSize: 12, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  tile: {
    minHeight: 105,
    borderRadius: 16,
    backgroundColor: "#FFFFFFE8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 13,
    gap: 9,
  },
  iconHalo: {
    height: 46,
    width: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#17243B66",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    padding: 22,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.primaryInk,
    flex: 1,
  },
  close: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: { paddingVertical: 16, gap: 24 },
  body: { fontSize: 16, lineHeight: 26, color: theme.colors.text },
});




