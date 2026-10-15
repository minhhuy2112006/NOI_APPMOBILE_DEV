import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { useState } from "react";

const images = {
  volunteer: require("../../../assets/campaigns/meals.webp"),
  environment: require("../../../assets/campaigns/community.webp"),
  education: require("../../../assets/campaigns/books.webp"),
};

const articles = [
  {
    id: "1",
    category: "Câu chuyện",
    title: "Chuẩn bị cho lần tình nguyện đầu tiên",
    date: "12 Thg 10, 2026",
    description: "Một vài điều nên hỏi người phụ trách trước ngày tham gia.",
    image: images.volunteer,
  },
  {
    id: "2",
    category: "Hoạt động",
    title: "Phối hợp tốt trong một nhóm tình nguyện",
    date: "05 Thg 10, 2026",
    description: "Công việc rõ ràng giúp mọi người biết mình cần làm gì.",
    image: images.environment,
  },
  {
    id: "3",
    category: "Tin tức",
    title: "Các mục bạn có thể khám phá trên NOI",
    date: "28 Thg 9, 2026",
    description: "Làm quen với Chiến dịch, Đóng góp, Về NOI, Cửa hàng và Tài khoản.",
    image: images.education,
  },
];

const filters = ["Tất cả", "Câu chuyện", "Hoạt động", "Tin tức"];

export default function StoriesScreen() {
  const [selected, setSelected] = useState("Tất cả");

  const filtered =
    selected === "Tất cả"
      ? articles
      : articles.filter((item) => item.category === selected);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#FFF8FC", "#FAF8FF", "#F4F9FF"]}
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

              <Text style={s.headerTitle}>Tin tức & câu chuyện</Text>

              <View style={s.headerSpace} />
            </View>

            <View style={s.hero}>
  <View style={s.heroCopy}>
    <Text style={s.heroTitle}>
    Những câu chuyện{"\n"}
  lan tỏa <Text style={s.heroPink}>yêu thương</Text>
    </Text>

    <Text style={s.heroDescription}>
      Cập nhật tin tức, hoạt động và những câu chuyện tích cực từ cộng đồng NOI.
    </Text>
  </View>

  <View style={s.megaphoneArt} pointerEvents="none">
    <View style={s.artBlue} />
    <View style={s.artPink} />

    <Ionicons
      name="megaphone"
      size={47}
      color="#718FE8"
    />

    <Ionicons
      name="heart"
      size={15}
      color="#ED72BA"
      style={s.artHeart}
    />

    <Ionicons
      name="sparkles"
      size={13}
      color="#E1A449"
      style={s.artSparkle}
    />
  </View>
</View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filters}
            >
              {filters.map((filter) => {
                const active = selected === filter;

                return (
                  <Pressable key={filter} onPress={() => setSelected(filter)}>
                    {active ? (
                      <LinearGradient
                        colors={["#F2B3E3", "#B7D1FF"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={s.filterActive}
                      >
                        <Text style={s.filterActiveText}>{filter}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={s.filter}>
                        <Text style={s.filterText}>{filter}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={s.articleList}>
              {filtered.map((article) => (
                <Pressable
                  key={article.id}
                  style={({ pressed }) => [
                    s.article,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Image
                    source={article.image}
                    style={s.articleImage}
                    resizeMode="cover"
                  />

                  <View style={s.articleContent}>
                    <Text style={s.articleTitle} numberOfLines={2}>
                      {article.title}
                    </Text>

                    <Text style={s.articleDate}>{article.date}</Text>

                    <Text style={s.articleDescription} numberOfLines={2}>
                      {article.description}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={21} color="#173D7B" />
                </Pressable>
              ))}
            </View>
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
    width: "80%",
  },
  
  megaphoneArt: {
    position: "absolute",
  
    right: -3,
    top: -7,
  
    width: 82,
    height: 100,
  
    alignItems: "center",
    justifyContent: "center",
  },
  
  artBlue: {
    position: "absolute",
  
    right: 1,
    top: 4,
  
    width: 47,
    height: 72,
  
    borderRadius: 28,
  
    backgroundColor: "#E1ECFF",
  
    opacity: 0.75,
  
    transform: [{ rotate: "25deg" }],
  },
  
  artPink: {
    position: "absolute",
  
    left: 0,
    bottom: 2,
  
    width: 36,
    height: 42,
  
    borderRadius: 22,
  
    backgroundColor: "#F9E0F2",
  },
  
  artHeart: {
    position: "absolute",
  
    left: 3,
    top: 3,
  },
  
  artSparkle: {
    position: "absolute",
  
    right: 0,
    top: 42,
  },

  heroText: {
    width: "78%",
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

  megaphoneWrap: {
    position: "absolute",

    right: -2,
    top: 28,

    width: 78,
    height: 105,

    alignItems: "center",
    justifyContent: "center",
  },

  heart: {
    position: "absolute",

    top: 0,
    left: 1,
  },

  filters: {
    flexDirection: "row",
  
    gap: 8,
  
    marginBottom: 14,
  },
  
  filterActive: {
    height: 38,
  
    paddingHorizontal: 17,
  
    borderRadius: 14,
  
    alignItems: "center",
    justifyContent: "center",
  },
  
  filterActiveText: {
    fontSize: 12.5,
  
    fontWeight: "700",
  
    color: "#343A70",
  },
  
  filter: {
    height: 38,
  
    paddingHorizontal: 16,
  
    borderRadius: 14,
  
    alignItems: "center",
    justifyContent: "center",
  
    backgroundColor: "#F0F2F7",
  },
  
  filterText: {
    fontSize: 12.5,
  
    color: "#6C788E",
  },

  articleList: {
    gap: 11,
  },
  
  article: {
    minHeight: 121,
  
    padding: 10,
  
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
  
  articleImage: {
    width: 99,
    height: 99,
  
    borderRadius: 15,
  
    backgroundColor: "#EFF1F5",
  },
  
  articleContent: {
    flex: 1,
  
    paddingLeft: 12,
    paddingRight: 5,
  },
  
  articleTitle: {
    fontSize: 14,
    lineHeight: 18,
  
    fontWeight: "800",
  
    color: "#123970",
  },
  
  articleDate: {
    marginTop: 4,
  
    fontSize: 11,
  
    color: "#8995A8",
  },
  
  articleDescription: {
    marginTop: 3,
  
    fontSize: 11.5,
    lineHeight: 16,
  
    color: "#6D7B91",
  },
  
});