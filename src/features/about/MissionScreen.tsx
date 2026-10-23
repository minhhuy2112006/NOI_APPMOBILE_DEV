import { useAboutTypography } from './aboutTypography';
import { type PropsWithChildren } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useAssistantContext } from "../assistant/Assistant";



const images = {
  seed: require("../../../assets/about/mission/mission-seed.png"),
  landscape: require("../../../assets/about/mission/mission-landscape.png"),
  community: require("../../../assets/about/mission/mission-community.png"),
  hands: require("../../../assets/about/mission/mission-hands.png"),
};
const copy = {
  hero: "NOI tồn tại để trao cơ hội cho mọi người được đóng góp, kết nối và cùng hành động vì những giá trị nhân văn và phát triển bền vững.",
  mission:
    "Chúng tôi tin rằng một cộng đồng tốt đẹp hơn có thể được xây dựng từ những hành động nhỏ, khi nhiều người cùng chung tay. NOI tạo ra cơ hội để mọi người kết nối, chia sẻ nguồn lực và cùng nhau thúc đẩy những thay đổi tích cực và bền vững cho xã hội.",
  why: "Trẻ em có hoàn cảnh khó khăn, người già neo đơn, môi trường bị ảnh hưởng và nhiều nhóm cộng đồng vẫn chưa được hỗ trợ đầy đủ. Chúng tôi tin rằng, khi nhiều người cùng đóng góp, những thay đổi tích cực hoàn toàn có thể trở thành hiện thực.",
  future:
    "NOI mong muốn trở thành cầu nối giữa những tấm lòng thiện nguyện với các tổ chức, chiến dịch và cộng đồng đang cần sự hỗ trợ, giúp lan tỏa những giá trị nhân văn và tạo ra những tác động lâu dài.",
};
function PinkCard({ children, scale }: PropsWithChildren<{ scale: number }>) {
  return (
    <LinearGradient
      colors={["#FFF4FA", "#FDECF8", "#FFF4FA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles(scale).card}
    >
      {children}
    </LinearGradient>
  );
}
export default function MissionScreen() {
  const typography = useAboutTypography();
  const { width } = useWindowDimensions();
  const u = Math.min(width, 520) / 853;

  const s = styles(u, false);
  const communitySize = Image.resolveAssetSource(images.community);
  const handsSize = Image.resolveAssetSource(images.hands);

  const communityRatio =
    communitySize.width / communitySize.height;

  const handsRatio =
    handsSize.width / handsSize.height;
  useAssistantContext("Sứ mệnh", { page: "Sứ mệnh", ...copy });
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/about");
  const label = (text: string) => (
    <View style={s.labelRow}>
      <Text style={s.label}>{text}</Text>
      <View style={s.labelLine} />
    </View>
  );
  const leaves = (right = false) => (
    <View
      pointerEvents="none"
      style={[
        s.leaves,
        right && {
          left: undefined,
          right: 14 * u,
          transform: [{ scaleX: -1 }],
        },
      ]}
    >
      <Ionicons
        name="leaf"
        size={44 * u}
        color="#82B99C"
        style={{ transform: [{ rotate: "-38deg" }] }}
      />
      <Ionicons
        name="leaf"
        size={35 * u}
        color="#A5CFB3"
        style={{
          marginLeft: 24 * u,
          marginTop: -14 * u,
          transform: [{ rotate: "18deg" }],
        }}
      />
    </View>
  );
  return (
    <LinearGradient
      colors={["#FFF4FC", "#F5F5FF", "#EFF7FF", "#FFF1FB"]}
      style={s.fill}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top", "left", "right"]} style={s.fill}>
        <View style={s.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại Về NOI"
            onPress={back}
            style={s.back}
          >
            <Ionicons name="chevron-back" size={23} color="#123A70" />
          </Pressable>
          <Text style={[s.headerTitle, typography.header]}>Sứ mệnh</Text>
          <View style={s.back} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          <View style={s.hero}>
            <View pointerEvents="none" style={s.heroBubblePink} />
            <View pointerEvents="none" style={s.heroBubbleBlue} />
            <Text accessibilityRole="header" style={s.heroTitle}>
              Vì một cộng đồng{"\n"}
              <Text style={s.pink}>tốt đẹp hơn</Text>
              <Text style={s.heart}> ♡</Text>
            </Text>
            <View style={s.heroUnderline} />
            <Text style={s.heroCopy}>{copy.hero}</Text>
            <View style={s.seedFrame}>
              <Image
                source={images.seed}
                style={s.seedImage}
                resizeMode="cover"
                accessibilityLabel="Mầm cây được nâng niu trong những bàn tay"
              />
              <LinearGradient
                colors={["#FFF7FD", "#FFF7FD00"]}
                style={s.seedFade}
              />
              <View style={s.seedWaveLeft} />
              <View style={s.seedWaveRight} />
            </View>
            {leaves()}
            <Ionicons
              name="leaf"
              size={28 * u}
              color="#92C7AB"
              style={s.floatingLeaf}
            />
          </View>
          <View style={s.quoteBanner}>
            <Image
              source={images.landscape}
              style={s.image}
              resizeMode="cover"
              accessibilityLabel="Bình minh trên thung lũng"
            />
            <LinearGradient
              colors={["#2B367EBB", "#35458B22", "#35458B00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={s.quoteMark}>“</Text>
            <Text style={s.quoteText}>
              Những hành động nhỏ{"\n"}hôm nay tạo nên những{"\n"}thay đổi lớn
              cho ngày mai.
            </Text>
            <View style={s.quoteUnderline} />
          </View>
          <View style={[s.inset, s.missionCardWrap]}>
            <PinkCard scale={u}>
              {label("SỨ MỆNH CỦA NOI")}
              <Text accessibilityRole="header" style={s.sectionTitle}>
                Nuôi dưỡng <Text style={s.pink}>những giá trị tốt đẹp</Text>
              </Text>
              <Text style={s.body}>{copy.mission}</Text>
              <View style={s.values}>
                {(
                  [
                    {
                      title: "Kết nối",
                      icon: "heart-outline",
                      color: "#E94EA9",
                      bg: "#F8C4DE",
                    },
                    {
                      title: "Chia sẻ",
                      icon: "people",
                      color: "#409CEA",
                      bg: "#CCE6FF",
                    },
                    {
                      title: "Hành động",
                      icon: "leaf",
                      color: "#19AA6A",
                      bg: "#D0F2D5",
                    },
                    {
                      title: "Bền vững",
                      icon: "flower-outline",
                      color: "#F59828",
                      bg: "#FCE8CC",
                    },
                  ] as const
                ).map((value) => (
                  <View style={s.value} key={value.title}>
                    <View style={[s.valueBadge, { backgroundColor: value.bg }]}>
                      <Ionicons
                        name={value.icon}
                        size={37 * u}
                        color={value.color}
                      />
                    </View>
                    <Text style={s.valueTitle}>{value.title}</Text>
                  </View>
                ))}
              </View>
            </PinkCard>
          </View>
          <View style={s.whySection}>
            <LinearGradient colors={["#E6F2FF", "#F5FAFF"]} style={s.whyCopy}>
              {label("VÌ SAO SỨ MỆNH NÀY QUAN TRỌNG?")}
              <Text
                accessibilityRole="header"
                style={[s.sectionTitle, s.center]}
              >
                Xã hội luôn tồn tại{"\n"}những vấn đề cần{" "}
                <Text style={s.blue}>sự chung tay</Text>
              </Text>
              <Text style={s.whyBody}>{copy.why}</Text>
            </LinearGradient>
            <View style={s.communityFrame}>
              <Image
                source={images.community}
                style={s.image}
                resizeMode="cover"
                accessibilityLabel="Những người bạn cùng nhìn về cộng đồng"
              />
              <LinearGradient
                colors={["#F5FAFF", "#F5FAFF00"]}
                style={s.communityFade}
              />
            </View>
          </View>
          <View style={[s.inset, s.futureWrap]}>
            <PinkCard scale={u}>
              {label("CHÚNG TÔI HƯỚNG TỚI")}
              <Text accessibilityRole="header" style={s.sectionTitle}>
                Một cộng đồng <Text style={s.pink}>nhân ái và bền vững</Text>
              </Text>
              <Text style={s.body}>{copy.future}</Text>
              <View style={s.handsFrame}>
                <Image
                  source={images.hands}
                  style={s.image}
                  resizeMode="cover"
                  accessibilityLabel="Những bàn tay cùng chung sức"
                />
                <LinearGradient
                  colors={["#FFF1FA", "#FFF1FA00"]}
                  style={s.handsFade}
                />
              </View>
              {leaves()}
              {leaves(true)}
            </PinkCard>
          </View>
          <View style={s.footer}>
            <Text style={s.footerMark}>“</Text>
            <View style={s.footerCopy}>
              <Text style={s.footerQuote}>
                Một cộng đồng tốt đẹp hơn{"\n"}bắt đầu từ những con người bình
                thường,{"\n"}làm những điều phi thường.
              </Text>
              <View style={s.footerUnderline} />
            </View>
            <View style={s.logoBlock}>
              <Text style={s.logo}>NOI</Text>
              <Text style={s.tagline}>Cùng nhau lan tỏa.</Text>
              <View style={s.logoUnderline} />
            </View>
          </View>
          <View pointerEvents="none" style={s.waves}>
            <View style={s.wavePink} />
            <View style={s.waveBlue} />
            <View style={s.waveLavender} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
const styles = (u: number, loaded: boolean=false) => {
  const serif = loaded
    ? "Lora_400Regular"
    : Platform.OS === "ios"
      ? "Georgia"
      : "serif";

  const italic = loaded
    ? "Lora_400Regular_Italic"
    : serif;

  return StyleSheet.create({
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
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 36 * u,
      fontWeight: "700",
      color: "#10376E",
    },
    content: {
      width: "100%",
      maxWidth: 520,
      alignSelf: "center",
      paddingBottom: 10,
    },
    image: { width: "100%", height: "100%" },
    pink: {
      fontFamily: italic,
      fontWeight: "400",
      color: "#EE579D",
    },
    blue: { color: "#3287E2" },
    center: { textAlign: "center" },
    hero: { paddingTop: 5 * u, overflow: "hidden" },
    heroTitle: {
      fontFamily: serif,
      fontSize: 48 * u,
      lineHeight: 54 * u,
      fontWeight: "400",
      letterSpacing: -1 * u,
      textAlign: "center",
      color: "#0C2D67",
    },
    heart: { fontWeight: "400", color: "#EF47AF" },
    heroUnderline: {
      width: 127 * u,
      height: 4 * u,
      backgroundColor: "#EF4EAE",
      borderRadius: 8 * u,
      alignSelf: "center",
      marginLeft: 120 * u,
      transform: [{ rotate: "-5deg" }],
      marginTop: 7 * u,
    },
    heroCopy: {
      fontSize: 28 * u,
      lineHeight: 40 * u,
      color: "#365D8A",
      textAlign: "center",
      marginHorizontal: 61 * u,
      marginTop: 20 * u,
      zIndex: 2,
    },
    heroBubblePink: {
      position: "absolute",
      width: 180 * u,
      height: 240 * u,
      borderRadius: 120 * u,
      backgroundColor: "#FFE1F8",
      left: -75 * u,
      top: 68 * u,
    },
    heroBubbleBlue: {
      position: "absolute",
      width: 180 * u,
      height: 220 * u,
      borderRadius: 120 * u,
      backgroundColor: "#D4E7FF",
      right: -105 * u,
      top: 12 * u,
    },
    seedFrame: {
      width: "100%",
      height: 220 * u,
      marginTop: 0,
      overflow: "hidden",
    },
    seedImage: {
      position: "absolute",
      width: "100%",
      height: 640 * u,
      top: -100 * u,
    },
    seedFade: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 65 * u,
    },
    seedWaveLeft: {
      position: "absolute",
      width: 250 * u,
      height: 65 * u,
      borderRadius: 100 * u,
      backgroundColor: "#E4EFFF",
      left: -60 * u,
      bottom: -30 * u,
      transform: [{ rotate: "16deg" }],
    },
    seedWaveRight: {
      position: "absolute",
      width: 310 * u,
      height: 65 * u,
      borderRadius: 130 * u,
      backgroundColor: "#EEEFFF",
      right: -50 * u,
      bottom: -25 * u,
      transform: [{ rotate: "-14deg" }],
    },
    leaves: {
      position: "absolute",
      left: 20 * u,
      bottom: 6 * u,
      opacity: 0.85,
    },
    floatingLeaf: {
      position: "absolute",
      top: 105 * u,
      right: 141 * u,
      transform: [{ rotate: "65deg" }],
    },
    quoteBanner: {
      height: 173 * u,
      marginHorizontal: 35 * u,
      borderRadius: 33 * u,
      overflow: "hidden",
      marginTop: -6 * u,
      borderWidth: 1,
      borderColor: "#FFFFFFBB",
      marginBottom: 12 * u,
    },
    quoteMark: {
      position: "absolute",
      top: 3 * u,
      left: 28 * u,
      fontSize: 80 * u,
      lineHeight: 90 * u,
      fontWeight: "800",
      color: "#F6BCF2",
    },
    quoteText: {
      position: "absolute",
      top: 26 * u,
      left: 86 * u,
      color: "#FFFFFF",
      fontSize: 28 * u,
      lineHeight: 35 * u,
      fontStyle: "italic",
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      transform: [{ rotate: "-4deg" }],
    },
    quoteUnderline: {
      position: "absolute",
      width: 115 * u,
      height: 3 * u,
      borderRadius: 5 * u,
      backgroundColor: "#FFFFFF",
      left: 250 * u,
      bottom: 17 * u,
      transform: [{ rotate: "-9deg" }],
    },
    inset: { paddingHorizontal: 35 * u },
    card: {
      borderRadius: 34 * u,
      paddingHorizontal: 26 * u,
      paddingTop: 17 * u,
      paddingBottom: 17 * u,
      borderWidth: 1,
      borderColor: "#FFFFFF",
      overflow: "hidden",
      gap: 14 * u,
    },
    labelRow: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    
    label: {
      width: "100%",
      textAlign: "center",
    
      color: "#123970",
      fontSize: 25 * u,
      lineHeight: 30 * u,
      fontWeight: "700",
      letterSpacing: 0.25 * u,
    },
    
    labelLine: {
      width: 250 * u,
      height: 5 * u,
      borderRadius: 2 * u,
      backgroundColor: "#F281C5",
      marginTop: 5 * u,
    },
    sectionTitle: {
      color: "#113971",
      fontSize: 36 * u,
      lineHeight: 43 * u,
      fontWeight: "700",
      textAlign: "center",
    },
    body: { color: "#48658C", fontSize: 28 * u, lineHeight: 40 * u, textAlign: "justify" },
    values: {
      flexDirection: "row",
      gap: 13 * u,
      marginHorizontal: -9 * u,
      marginTop: 8 * u,
    },
    value: {
      flex: 1,
      minHeight: 115 * u,
    
      borderRadius: 24 * u,
      backgroundColor: "#FFFFFFBB",
    
      alignItems: "center",
      justifyContent: "center",
    
      paddingVertical: 14 * u,
      paddingHorizontal: 6 * u,
      gap: 8 * u,
    },
    valueBadge: {
      width: 65 * u,
      height: 65 * u,
      borderRadius: 34 * u,
      alignItems: "center",
      justifyContent: "center",
    },
    valueTitle: { fontSize: 28 * u, lineHeight: 38 * u, color: "#233F6B" },
    whySection: { marginTop: 0 * u },
    whyCopy: {
      marginHorizontal: 35 * u,
      borderTopLeftRadius: 35 * u,
      borderTopRightRadius: 35 * u,
      paddingHorizontal: 26 * u,
      paddingTop: 17 * u,
      gap: 14 * u,
      zIndex: 1,
    },
    whyBody: {
      color: "#42618C",
      fontSize: 28 * u,
      lineHeight: 40 * u,
      textAlign: "justify",
    },
    communityFrame: {
      height: 174 * u,
    
      marginHorizontal: 35 * u,
      marginTop: 12 * u,
      marginBottom: 20 * u,
    
      borderRadius: 32 * u,
      overflow: "hidden",
    },
    communityFade: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 40 * u,
    },
    futureWrap: { marginTop: 0 * u },
    handsFrame: {
      height: 117 * u,
      marginHorizontal: -26 * u,
      marginBottom: -17 * u,
      marginTop: 4 * u,
    },
    handsFade: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 28 * u,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 69 * u,
      paddingTop: 19 * u,
      paddingBottom: 22 * u,
      gap: 20 * u,
    },
    footerMark: {
      fontSize: 78 * u,
      lineHeight: 90 * u,
      color: "#ED4BA5",
      fontWeight: "800",
      alignSelf: "flex-start",
    },
    footerCopy: { flex: 1 },
    footerQuote: {
      fontSize: 23 * u,
      lineHeight: 31 * u,
      fontStyle: "italic",
      color: "#163970",
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    footerUnderline: {
      width: 103 * u,
      height: 3 * u,
      borderRadius: 4 * u,
      backgroundColor: "#F45DB8",
      alignSelf: "center",
      marginTop: 4 * u,
      transform: [{ rotate: "-9deg" }],
    },
    logoBlock: {
      borderLeftWidth: 1,
      borderLeftColor: "#8CB5EF",
      paddingLeft: 36 * u,
      width: 156 * u,
    },
    logo: {
      fontSize: 31 * u,
      lineHeight: 34 * u,
      fontWeight: "800",
      color: "#153A70",
    },
    tagline: { fontSize: 14 * u, lineHeight: 20 * u, color: "#33598B" },
    logoUnderline: {
      width: 49 * u,
      height: 3 * u,
      borderRadius: 3 * u,
      backgroundColor: "#EF49AD",
      marginTop: 10 * u,
    },
    waves: { height: 68 * u, marginTop: -10 * u, overflow: "hidden" },
    wavePink: {
      position: "absolute",
      width: "100%",
      height: 150 * u,
      borderRadius: 200 * u,
      backgroundColor: "#FCE0FB",
      left: "-15%",
      top: 14 * u,
      transform: [{ rotate: "8deg" }],
    },
    waveBlue: {
      position: "absolute",
      width: "70%",
      height: 100 * u,
      borderRadius: 170 * u,
      backgroundColor: "#CCDEFB",
      right: "-12%",
      top: 13 * u,
      transform: [{ rotate: "-12deg" }],
    },
    waveLavender: {
      position: "absolute",
      width: "80%",
      height: 100 * u,
      borderRadius: 200 * u,
      backgroundColor: "#E0DBFA",
      left: "-10%",
      top: 36 * u,
    },
    missionCardWrap: {
      marginTop: 2 * u,
      marginBottom: 12 * u,
    },
  });
};