import { type ComponentProps, type PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export const pink = "#ED1685";

export function Icon({
  name,
  size = 22,
  color = pink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Heading({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={s.heading}>
      {children}
    </Text>
  );
}

export function Copy({ children }: PropsWithChildren) {
  return <Text style={s.copy}>{children}</Text>;
}

export function Panel({ children }: PropsWithChildren) {
  return <View style={s.panel}>{children}</View>;
}

export function Link({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={s.link}
    >
      <Text style={s.linkText}>{title}</Text>
      <Icon name="chevron-forward" size={18} />
    </Pressable>
  );
}

export function Action({
  title,
  icon,
  onPress,
  filled = false,
}: {
  title: string;
  icon?: IconName;
  onPress: () => void;
  filled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.action,
        filled && s.filled,
        { opacity: pressed ? 0.65 : 1 },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={20}
          color={filled ? "#fff" : pink}
        />
      )}

      <Text
        style={[
          s.actionText,
          filled && { color: "#fff" },
        ]}
      >
        {title}
      </Text>

      {!icon && (
        <Icon
          name="chevron-forward"
          size={16}
          color={filled ? "#fff" : pink}
        />
      )}
    </Pressable>
  );
}

export function Layout({
  title,
  children,
  rose = false,
  help,
}: PropsWithChildren<{
  title: string;
  rose?: boolean;
  help?: () => void;
}>) {
  return (
    <LinearGradient
      colors={
        rose
          ? ["#FFF0F8", "#FCEBF6", "#FFF1F8"]
          : ["#FCE6F5", "#EAE9FC", "#E0F3FF"]
      }
      style={s.fill}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={s.fill}
      >
        <View style={s.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại Tài khoản"
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/account")
            }
            style={s.headerAction}
          >
            <Icon name="chevron-back" size={26} />
          </Pressable>

          <Text
            accessibilityRole="header"
            style={s.title}
          >
            {title}
          </Text>

          {help ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thông tin"
              onPress={help}
              style={s.headerAction}
            >
              <Icon
                name="help-circle-outline"
                size={25}
              />
            </Pressable>
          ) : (
            <View style={s.headerAction} />
          )}
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export function Sheet({
  title,
  visible,
  close,
  children,
}: PropsWithChildren<{
  title: string;
  visible: boolean;
  close: () => void;
}>) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={s.scrim}
      >
        <View style={s.sheet}>
          <View style={s.sectionHead}>
            <Heading>{title}</Heading>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              onPress={close}
              style={s.headerAction}
            >
              <Icon name="close" />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              s.sheetContent
            }
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Quick({
  title,
  description,
  icon,
  onPress,
  color = pink,
  arrow = false,
}: {
  title: string;
  description: string;
  icon: IconName;
  onPress: () => void;
  color?: string;
  arrow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.quick,
        { opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <View
        style={[
          s.iconCircle,
          {
            backgroundColor:
              color + "16",
          },
        ]}
      >
        <Icon
          name={icon}
          color={color}
          size={27}
        />
      </View>

      <Text style={s.quickTitle}>
        {title}
      </Text>

      <Text style={s.quickCopy}>
        {description}
      </Text>

      {arrow && (
        <View style={s.smallArrow}>
          <Icon
            name="chevron-forward"
            size={18}
          />
        </View>
      )}
    </Pressable>
  );
}
export const s = StyleSheet.create({
    fill: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", minHeight: 58 },
    headerAction: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontSize: 21,
      fontWeight: "700",
      color: "#06184C",
    },
    content: {
      width: "100%",
      maxWidth: 700,
      alignSelf: "center",
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 8,
      gap: 10,
    },
    panel: {
      backgroundColor: "#FFFFFFE8",
      borderRadius: 19,
      padding: 10,
      gap: 9,
    },
    heading: {
      color: "#07164E",
      fontSize: 18,
      lineHeight: 23,
      fontWeight: "700",
      flexShrink: 1,
    },
    copy: { color: "#7283A6", fontSize: 13, lineHeight: 18 },
    sectionHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
    },
    link: { flexDirection: "row", alignItems: "center", minHeight: 40, gap: 2 },
    linkText: { color: pink, fontSize: 12 },
    action: {
      flex: 1,
      minHeight: 42,
      paddingHorizontal: 7,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#F33393",
      backgroundColor: "#FFFFFFA8",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 5,
    },
    actionText: {
      color: pink,
      fontWeight: "600",
      fontSize: 12,
      flexShrink: 1,
      textAlign: "center",
    },
    filled: { backgroundColor: "#F4378D" },
    actions: { flexDirection: "row", gap: 8 },
    searchPanel: { padding: 7, borderRadius: 17, backgroundColor: "#FFFFFFED" },
    search: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 11,
      minHeight: 41,
      borderWidth: 1,
      borderColor: "#E5E8FA",
      borderRadius: 30,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      fontSize: 14,
      color: "#102252",
      paddingVertical: 8,
    },
    clear: { padding: 8 },
    hero: {
      borderRadius: 17,
      borderWidth: 1,
      borderColor: "#FFFFFF",
      minHeight: 112,
      overflow: "hidden",
      justifyContent: "center",
    },
    heroCopy: {
      width: "65%",
      paddingLeft: 18,
      paddingVertical: 12,
      gap: 7,
      zIndex: 1,
    },
    heroTitle: {
      fontSize: 21,
      lineHeight: 25,
      fontWeight: "700",
      color: "#071A51",
    },
    agent: {
      position: "absolute",
      right: -7,
      bottom: -7,
      width: "40%",
      height: "103%",
    },
    quickRow: { flexDirection: "row", gap: 6 },
    quick: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#E8E9F7",
      borderRadius: 14,
      paddingHorizontal: 8,
      paddingTop: 9,
      paddingBottom: 10,
      alignItems: "center",
      gap: 6,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    quickTitle: {
      color: "#06174F",
      fontWeight: "700",
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
    },
    quickCopy: {
      color: "#7889AC",
      fontSize: 11,
      lineHeight: 16,
      textAlign: "center",
    },
    smallArrow: {
      alignSelf: "flex-end",
      backgroundColor: "#FFECF6",
      borderRadius: 20,
      padding: 4,
    },
    outline: {
      borderWidth: 1,
      borderColor: "#E9ECFA",
      borderRadius: 15,
      paddingHorizontal: 12,
    },
    faqRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 40,
      paddingVertical: 9,
      gap: 8,
    },
    faqTitle: { color: "#091850", fontSize: 13, lineHeight: 18, flex: 1 },
    divider: { borderTopWidth: 1, borderTopColor: "#EBEDF7" },
    answer: { paddingBottom: 12 },
    contact: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#FFFFFF",
      padding: 14,
      gap: 13,
      overflow: "hidden",
    },
    contactCopy: { width: "70%", gap: 5, zIndex: 1 },
    envelope: {
      position: "absolute",
      top: 8,
      right: 12,
      transform: [{ rotate: "-10deg" }],
      opacity: 0.85,
    },
    envelopeHeart: { position: "absolute", top: 20, left: 26 },
    scrim: { flex: 1, backgroundColor: "#07153866", justifyContent: "flex-end" },
    sheet: {
      maxHeight: "85%",
      backgroundColor: "#FFF9FE",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 18,
      paddingBottom: 28,
    },
    sheetContent: { gap: 14, paddingBottom: 16 },
    input: {
      borderWidth: 1,
      borderColor: "#E3D9EE",
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: "#142450",
      backgroundColor: "#FFFFFF",
    },
    message: { minHeight: 130, textAlignVertical: "top" },
    mutedButton: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: "#E8E4ED",
      color: "#737687",
      textAlign: "center",
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: "#FFFFFFBF",
      borderRadius: 16,
      overflow: "hidden",
      marginTop: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 13,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTab: { borderBottomColor: pink },
    tabText: { fontWeight: "700", color: "#7D83A1", fontSize: 16 },
    filterRow: { alignItems: "flex-end", marginVertical: -5 },
    filter: {
      flexDirection: "row",
      gap: 5,
      minHeight: 32,
      alignItems: "center",
      paddingHorizontal: 6,
    },
    caption: { color: "#7A829F", fontSize: 11 },
    registration: {
      backgroundColor: "#FFFFFFDC",
      padding: 11,
      borderRadius: 19,
      gap: 14,
      marginBottom: 2,
    },
    registrationTop: { flexDirection: "row", gap: 12 },
    campaignImage: { width: "32%", aspectRatio: 0.96, borderRadius: 12 },
    registrationCopy: { flex: 1, gap: 7 },
    campaignTitle: {
      color: "#091D56",
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "700",
    },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    badgeText: { color: "#4373AD", fontSize: 11, fontWeight: "600" },
    meta: { flexDirection: "row", gap: 7 },
    metaText: { flex: 1, color: "#7986A9", fontSize: 12, lineHeight: 17 },
    registrationActions: { flexDirection: "row", gap: 7 },
    registrationStatus: {
      flex: 1,
      minHeight: 40,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: "#EDE5F1",
      backgroundColor: "#FAF6FC",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 6,
      gap: 5,
    },
    statusText: {
      color: "#536184",
      fontWeight: "600",
      fontSize: 11,
      flexShrink: 1,
    },
    taskImage: { width: 74, height: 80, borderRadius: 12 },
    balancePanel: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#FFFFFF",
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    medal: { width: 80, height: 82, alignItems: "center" },
    medalHeart: { position: "absolute", top: 21 },
    balanceCopy: { flex: 1, minWidth: 140 },
    balance: { fontSize: 42, fontWeight: "800", color: "#E5086B" },
    pointUnit: { fontSize: 18, fontWeight: "700" },
    balanceAction: { marginLeft: "auto", minWidth: 120 },
    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      gap: 10,
    },
    historyIcon: {
      width: 50,
      height: 56,
      borderRadius: 10,
      backgroundColor: "#FFEBF6",
      alignItems: "center",
      justifyContent: "center",
    },
    historyCopy: { flex: 1, gap: 4 },
    historyTitle: {
      color: "#0B1A51",
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
    pointsBadge: {
      backgroundColor: "#FDEAF4",
      borderRadius: 12,
      paddingVertical: 9,
      paddingHorizontal: 8,
    },
    pointsBadgeText: { color: "#E90F75", fontSize: 12, fontWeight: "700" },
    pointsIntro: {
      borderWidth: 1,
      borderColor: "#FFFFFF",
      borderRadius: 18,
      padding: 15,
      minHeight: 135,
      justifyContent: "center",
    },
    introCopy: { width: "75%", gap: 10, zIndex: 1 },
    gift: {
      position: "absolute",
      right: 6,
      bottom: 4,
      transform: [{ rotate: "8deg" }],
    },
    giftHeart: { position: "absolute", left: 34, top: 48 },
    filterTagsScroll: {
        marginHorizontal: -2,
      },
      
      filterTagsContent: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 2,
        paddingVertical: 4,
        paddingRight: 16,
      },
      
      filterTag: {
        minHeight: 36,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E4E8F0",
        backgroundColor: "#FFFFFFCC",
        alignItems: "center",
        justifyContent: "center",
      },
      
      filterTagActive: {
        backgroundColor: "#FDEAF6",
        borderColor: "#ED1685",
      },
      
      filterTagText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7690",
      },
      
      filterTagTextActive: {
        color: "#C51682",
      },
      
  });
  