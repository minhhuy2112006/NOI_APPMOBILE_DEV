import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { useAssistantContext } from "../assistant/Assistant";
import { introductionCopy } from "./introductionCopy";

/** Dedicated editorial layout: the original reference is 853 px wide.
 * Text remains native and scalable; only the decorative hero is an image. */
export default function IntroductionScreen() {
  const { width } = useWindowDimensions();
  const scale = Math.min(width, 520) / 853;
  const s = styles(scale);
  useAssistantContext("Về NOI", { page: "Về NOI", content: introductionCopy });
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/about");
  const heading = (title: string) => (
    <View style={s.heading}>
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      <View style={s.underline} />
    </View>
  );
  return (
    <LinearGradient
      colors={["#FFF3FA", "#F0F0FF", "#EEF7FF", "#FFF0FA"]}
      style={s.fill}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top", "left", "right"]} style={s.fill}>
        <View style={s.header}>
          <Pressable
            onPress={back}
            accessibilityRole="button"
            accessibilityLabel="Quay lại Về NOI"
            style={s.back}
          >
            <Ionicons name="chevron-back" size={24} color="#0C185C" />
          </Pressable>
          <Text style={s.headerTitle}>Về NOI</Text>
          <View style={s.back} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          <View style={s.hero}>
            <Image
              source={require("../../../assets/about/introduction-hero.png")}
              style={s.heroImage}
              resizeMode="cover"
              accessibilityLabel="Kết nối con người. Vì một cộng đồng tốt đẹp hơn. Bàn tay tạo trái tim dưới ánh hoàng hôn."
            />
          </View>
          <View style={s.sections}>
            <View style={[s.card, s.firstCard]}>
              <View pointerEvents="none" style={s.bubbles}>
                <View style={s.blueBubble} />
                <View style={s.pinkBubble} />
              </View>
              {heading("NOI là gì?")}
              {introductionCopy.what.map((text) => (
                <Text key={text} style={s.body}>
                  {text}
                </Text>
              ))}
            </View>
            <View style={s.card}>
              {heading("Vì sao chúng tôi bắt đầu?")}
              {introductionCopy.why.map((text) => (
                <Text key={text} style={s.body}>
                  {text}
                </Text>
              ))}
            </View>
            <View style={[s.card, s.connections]}>
              <View style={s.connectionHeading}>
                {heading("NOI kết nối những ai?")}
              </View>
              {introductionCopy.audiences.map((item, index) => {
                const color = ["#E842A1", "#297CFF", "#00AA85"][index];
                const tint = ["#FDEBF7", "#EAF2FF", "#E8F5EE"][index];
                const icon = (["people", "business", "leaf"] as const)[index];
                return (
                  <LinearGradient
                    key={item.title}
                    colors={[
                      tint,
                      index === 0
                        ? "#FFF2FA"
                        : index === 1
                          ? "#EFF5FF"
                          : "#EFF8F1",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.audience}
                  >
                    <View style={s.iconColumn}>
                      <View
                        style={[s.iconPetal, { backgroundColor: color + "10" }]}
                      />
                      <Ionicons name={icon} size={59 * scale} color={color} />
                    </View>
                    <View
                      style={[s.divider, { backgroundColor: color + "40" }]}
                    />
                    <View style={s.audienceCopy}>
                      <Text style={[s.audienceTitle, { color }]}>
                        {item.title}
                      </Text>
                      <Text style={s.audienceBody}>{item.text}</Text>
                    </View>
                  </LinearGradient>
                );
              })}
            </View>
            <View style={s.card}>
              {heading("Điều chúng tôi tin tưởng")}
              {introductionCopy.beliefs.map((text) => (
                <Text key={text} style={s.beliefBody}>
                  {text}
                </Text>
              ))}
            </View>
            <LinearGradient
              colors={["#FADEF9", "#FDEAF6", "#EDE7FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.quote}
            >
              <Text style={s.quoteMark}>“</Text>
              <Text style={s.quoteText}>
                Cộng đồng tốt đẹp hơn{"\n"}bắt đầu từ những con người bình
                thường,{"\n"}làm những điều phi thường.
              </Text>
              <Ionicons
                name="heart"
                size={36 * scale}
                color="#F791D9"
                style={s.quoteHeart}
              />
              <View style={s.quoteUnderline} />
            </LinearGradient>
          </View>
          <View pointerEvents="none" style={s.waves}>
            <View style={s.wavePink} />
            <View style={s.wavePurple} />
            <View style={s.waveBlue} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
const styles = (u: number) =>
  StyleSheet.create({
    fill: { flex: 1 },
    header: {
      height: 44,
      width: "100%",
      maxWidth: 520,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
    },
    back: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: "#08165E",
      fontSize: 36 * u,
      fontWeight: "700",
    },
    scroll: {
      width: "100%",
      maxWidth: 520,
      alignSelf: "center",
      paddingBottom: 30,
    },
    hero: { width: "100%", aspectRatio: 2, overflow: "hidden" },
    heroImage: { width: "100%", height: "100%" },
    sections: { paddingHorizontal: 35 * u, gap: 12 * u, marginTop: -23 * u },
    card: {
      paddingHorizontal: 26 * u,
      paddingVertical: 17 * u,
      gap: 14 * u,
      borderRadius: 34 * u,
      backgroundColor: "#FFFFFFB8",
      borderWidth: 1,
      borderColor: "#FFFFFFEF",
      overflow: "hidden",
    },
    firstCard: { backgroundColor: "#FFFFFFC9" },
    heading: { gap: 8 * u, alignItems: "flex-start" },
    title: {
      color: "#07165B",
      fontSize: 36 * u,
      lineHeight: 43 * u,
      fontWeight: "700",
      letterSpacing: -0.5 * u,
    },
    underline: {
      width: 62 * u,
      height: 5 * u,
      borderRadius: 3 * u,
      backgroundColor: "#F7A1EB",
    },
    body: { color: "#617A9F", fontSize: 28 * u, lineHeight: 40 * u, textAlign: "justify" },
    beliefBody: { color: "#617A9F", fontSize: 28 * u, lineHeight: 40 * u, textAlign: "justify" },
    bubbles: {
      position: "absolute",
      right: 0,
      top: 24 * u,
      width: 110 * u,
      height: 150 * u,
    },
    blueBubble: {
      width: 70 * u,
      height: 84 * u,
      borderRadius: 45 * u,
      backgroundColor: "#CDE8FF88",
      position: "absolute",
      right: -2 * u,
      transform: [{ rotate: "25deg" }],
    },
    pinkBubble: {
      width: 77 * u,
      height: 80 * u,
      borderRadius: 45 * u,
      backgroundColor: "#F8C5F288",
      position: "absolute",
      top: 44 * u,
      right: 29 * u,
    },
    connections: { padding: 7 * u, gap: 5 * u },
    connectionHeading: { paddingHorizontal: 19 * u, paddingTop: 7 * u },
    audience: {
      borderRadius: 30 * u,
      borderWidth: 1,
      borderColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 13 * u,
      paddingRight: 18 * u,
    },
    iconColumn: {
      width: 160 * u,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 90 * u,
    },
    iconPetal: {
      position: "absolute",
      width: 99 * u,
      height: 90 * u,
      borderRadius: 30 * u,
      transform: [{ rotate: "18deg" }],
    },
    divider: { width: 2 * u, height: 65 * u, marginRight: 34 * u },
    audienceCopy: { flex: 1, gap: 4 * u },
    audienceTitle: { fontSize: 30 * u, lineHeight: 40 * u, fontWeight: "700" },
    audienceBody: { fontSize: 28 * u, lineHeight: 38 * u, color: "#617A9F", textAlign: "justify" },
    quote: {
      paddingHorizontal: 80 * u,
      paddingTop: 12 * u,
      paddingBottom: 26 * u,
      borderRadius: 32 * u,
      borderWidth: 1,
      borderColor: "#FFFFFFCC",
    },
    quoteText: {
      color: "#AD55F6",
      fontSize: 22 * u,
      lineHeight: 28 * u,
      textAlign: "center",
    },
    quoteMark: {
      position: "absolute",
      left: 32 * u,
      top: 4 * u,
      fontSize: 80 * u,
      lineHeight: 90 * u,
      color: "#F576D9",
      fontWeight: "800",
    },
    quoteHeart: { position: "absolute", right: 38 * u, top: 22 * u },
    quoteUnderline: {
      position: "absolute",
      bottom: 11 * u,
      left: "46%",
      width: 65 * u,
      height: 5 * u,
      borderRadius: 3 * u,
      backgroundColor: "#F78DE4",
    },
    waves: { height: 40 * u, marginTop: -5 * u, overflow: "hidden" },
    wavePink: {
      position: "absolute",
      left: "-15%",
      top: 4 * u,
      width: "75%",
      height: 130 * u,
      backgroundColor: "#F7D9F8",
      borderRadius: 180 * u,
      transform: [{ rotate: "12deg" }],
    },
    wavePurple: {
      position: "absolute",
      left: "10%",
      top: 20 * u,
      width: "100%",
      height: 110 * u,
      backgroundColor: "#DDD9FA",
      borderRadius: 180 * u,
    },
    waveBlue: {
      position: "absolute",
      right: "-15%",
      top: 5 * u,
      width: "45%",
      height: 130 * u,
      backgroundColor: "#BED6FA",
      borderRadius: 150 * u,
      transform: [{ rotate: "-22deg" }],
    },
  });
