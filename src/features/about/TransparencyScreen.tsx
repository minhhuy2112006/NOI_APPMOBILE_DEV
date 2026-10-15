import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";

const transparencyItems = [
  {
    title: "Công khai thông tin",
    description: "Thông tin chiến dịch, mục tiêu và nhu cầu được trình bày rõ ràng.",
    icon: "document-text-outline",
    iconColor: "#258CE0",
    background: "#E4F3FF",
  },
  {
    title: "Báo cáo định kỳ",
    description: "Tiến độ và kết quả hoạt động được cập nhật trong suốt chiến dịch.",
    icon: "stats-chart-outline",
    iconColor: "#8B5DDD",
    background: "#F0E8FF",
  },
  {
    title: "Chứng từ rõ ràng",
    description: "Hóa đơn, hình ảnh và tài liệu liên quan được lưu trữ minh bạch.",
    icon: "folder-outline",
    iconColor: "#F18B3C",
    background: "#FFF0E2",
  },
  {
    title: "Giám sát cộng đồng",
    description: "Cộng đồng có thể theo dõi, đặt câu hỏi và đóng góp ý kiến.",
    icon: "people-outline",
    iconColor: "#DE4EA8",
    background: "#FCE7F5",
  },
];

export default function TransparencyScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#FFF8FC", "#FAF8FF", "#F3F9FF"]}
        style={s.screen}
      >
        <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
          >
            <View style={s.header}>
              <Pressable onPress={() => router.back()} hitSlop={12} style={s.back}>
                <Ionicons name="chevron-back" size={26} color="#122453" />
              </Pressable>

              <Text style={s.headerTitle}>Cam kết minh bạch</Text>

              <View style={s.headerSpace} />
            </View>

            <View style={s.hero}>
  <View style={s.heroCopy}>
    <Text style={s.heroTitle}>
    Minh bạch để{"\n"}
  lan tỏa <Text style={s.heroPink}>niềm tin</Text>
    </Text>

    <Text style={s.heroDescription}>
      NOI cam kết công khai, rõ ràng và trung thực trong mọi hoạt động.
    </Text>
  </View>

  <View style={s.shieldArt} pointerEvents="none">
    <View style={s.shieldGlow} />

    <Ionicons
      name="shield-outline"
      size={77}
      color="#A98CEB"
    />

    <View style={s.shieldChart}>
      <View style={[s.bar, { height: 19 }]} />
      <View style={[s.bar, { height: 31 }]} />
      <View style={[s.bar, { height: 24 }]} />
    </View>

    <Ionicons
      name="sparkles"
      size={15}
      color="#C781DE"
      style={s.shieldSparkle}
    />
  </View>
</View>

            <View style={s.list}>
              {transparencyItems.map((item) => (
                <Pressable
                  key={item.title}
                  style={({ pressed }) => [
                    s.card,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <View style={[s.iconCircle, { backgroundColor: item.background }]}>
                    <Ionicons
                      name={item.icon as any}
                      size={28}
                      color={item.iconColor}
                    />
                  </View>

                  <View style={s.cardContent}>
                    <Text style={s.cardTitle}>{item.title}</Text>
                    <Text style={s.cardDescription}>{item.description}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#183D7A" />
                </Pressable>
              ))}
            </View>

            <Pressable style={({ pressed }) => pressed && { opacity: 0.88 }}>
              <LinearGradient
                colors={["#F2B3E3", "#B7D1FF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={s.cta}
              >
                <Text style={s.ctaText}>Xem báo cáo minh bạch</Text>
                <Ionicons name="arrow-forward" size={21} color="#343A70" />
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 42,
    height: 42,
    justifyContent: "center",
  },

  headerSpace: { width: 42 },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#122453",
  },

  hero: {
    position: "relative",
  
    marginTop: 22,
    marginBottom: 22,
  },
  
  heroCopy: {
    width: "76%",
  },
  
  shieldArt: {
    position: "absolute",
  
    right: -1,
    top: -2,
  
    width: 92,
    height: 94,
  
    alignItems: "center",
    justifyContent: "center",
  },
  
  shieldGlow: {
    position: "absolute",
  
    width: 80,
    height: 80,
  
    borderRadius: 40,
  
    backgroundColor: "#F1E8FF",
    opacity: 0.5,
  },
  
  shieldChart: {
    position: "absolute",
  
    bottom: 26,
  
    height: 34,
  
    flexDirection: "row",
    alignItems: "flex-end",
  
    gap: 3,
  },
  
  bar: {
    width: 6,
  
    borderRadius: 3,
  
    backgroundColor: "#A17DE5",
  },
  
  shieldSparkle: {
    position: "absolute",
  
    left: 2,
    top: 3,
  },

  heroText: {
    width: "76%",
    zIndex: 2,
  },

  heroTitle: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.65,
    color: "#172033",
  },
  heroPink: {
    color: "#E957AE",
  },
  heroDescription: {
    marginTop: 11,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
    color: "#687A96",
  },

  shield: {
    position: "absolute",
    right: -1,
    top: 21,
    opacity: 0.72,
  },

  list: {
    gap: 10,
  },

  card: {
    minHeight: 105,
  
    paddingHorizontal: 14,
    paddingVertical: 12,
  
    borderRadius: 20,
  
    backgroundColor: "#FFFFFF",
  
    flexDirection: "row",
    alignItems: "center",
  
    borderWidth: 1,
    borderColor: "#E8E5ED",
  
    shadowColor: "#4B5E83",
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  
    elevation: 1,
  },
  
  iconCircle: {
    width: 57,
    height: 57,
  
    borderRadius: 29,
  
    alignItems: "center",
    justifyContent: "center",
  
    marginRight: 13,
  },
  
  cardContent: {
    flex: 1,
  
    paddingRight: 6,
  },
  
  cardTitle: {
    fontSize: 15.5,
    lineHeight: 20,
  
    fontWeight: "800",
  
    color: "#123970",
  },
  
  cardDescription: {
    marginTop: 3,
  
    fontSize: 12.5,
    lineHeight: 18,
  
    color: "#6B7B94",
  },

  cta: {
    height: 55,
  
    marginTop: 13,
  
    borderRadius: 18,
  
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  
    gap: 11,
  },
  
  ctaText: {
    fontSize: 15.5,
  
    fontWeight: "800",
  
    color: "#343A70",
  },
});