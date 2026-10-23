import { ActionBackground as BrandActionBackground } from '../../components/ui';
import { theme as buttonTheme } from '../../theme/tokens';
import {
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

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
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

import { profileSession } from "./session";
import { openAccount } from "./navigation";

const ink = "#0B2854";
const muted = "#637A98";
const pink = "#CC168F";

type Detail = {
  label: string;
  value: string;
};

/* =========================================================
   SECTION CARD
   Không icon, không nền màu mè.
========================================================= */

function Panel({
  title,
  children,
  u,
}: PropsWithChildren<{
  title: string;
  u: number;
}>) {
  return (
    <View
      style={[
        s.card,
        {
          paddingHorizontal: 32 * u,
          paddingTop: 27 * u,
          paddingBottom: 30 * u,
          borderRadius: 28 * u,
        },
      ]}
    >
      <Text
        accessibilityRole="header"
        style={[
          s.heading,
          {
            fontSize: Math.max(18, 34 * u),
            lineHeight: Math.max(24, 43 * u),
            marginBottom: 17 * u,
          },
        ]}
      >
        {title}
      </Text>

      {children}
    </View>
  );
}

/* =========================================================
   DANH SÁCH THÔNG TIN
   Chỉ label trái + value phải.
========================================================= */

function Details({
  rows,
  u,
  large,
}: {
  rows: Detail[];
  u: number;
  large: boolean;
}) {
  return (
    <View>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[
            s.detail,
            {
              minHeight: 68 * u,
            },
            index < rows.length - 1 && s.divider,
            large && s.detailLarge,
          ]}
        >
          <Text
            style={[
              s.label,
              {
                fontSize: Math.max(14, 27 * u),
                lineHeight: Math.max(20, 36 * u),
              },
              large && s.auto,
            ]}
          >
            {row.label}
          </Text>

          <Text
            selectable
            style={[
              s.value,
              {
                fontSize: Math.max(14, 27 * u),
                lineHeight: Math.max(20, 36 * u),
              },
              large && s.auto,
            ]}
          >
            {row.value || "Chưa cập nhật"}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* =========================================================
   TAG
   Xám nhạt, chữ navy.
========================================================= */

function Tags({
  value,
  u,
}: {
  value: string;
  u: number;
}) {
  const items = value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    return (
      <Text
        style={[
          s.emptyText,
          {
            fontSize: Math.max(14, 25 * u),
          },
        ]}
      >
        Chưa cập nhật
      </Text>
    );
  }

  return (
    <View
      style={[
        s.tags,
        {
          gap: 12 * u,
        },
      ]}
    >
      {items.map((text, index) => (
        <View
          key={`${text}-${index}`}
          style={[
            s.tag,
            {
              minHeight: 57 * u,
              paddingHorizontal: 31 * u,
              paddingVertical: 10 * u,
              borderRadius: 40 * u,
            },
          ]}
        >
          <Text
            style={[
              s.tagText,
              {
                fontSize: Math.max(13, 25 * u),
                lineHeight: Math.max(18, 32 * u),
              },
            ]}
          >
            {text}
          </Text>
        </View>
      ))}
    </View>
  );
}
function BackgroundDecor({ u }: { u: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* mảng hồng góc phải trên */}
      <LinearGradient
        colors={["rgba(255,193,225,0.55)", "rgba(255,193,225,0.10)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          s.bgBlob,
          {
            width: 260 * u,
            height: 220 * u,
            borderBottomLeftRadius: 180 * u,
            borderTopLeftRadius: 60 * u,
            borderBottomRightRadius: 40 * u,
            borderTopRightRadius: 140 * u,
            top: -20 * u,
            right: -35 * u,
          },
        ]}
      />

      {/* mảng xanh góc trái dưới */}
      <LinearGradient
        colors={["rgba(208,231,255,0.60)", "rgba(208,231,255,0.14)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          s.bgBlob,
          {
            width: 290 * u,
            height: 280 * u,
            borderTopRightRadius: 180 * u,
            borderBottomRightRadius: 80 * u,
            borderTopLeftRadius: 80 * u,
            borderBottomLeftRadius: 150 * u,
            bottom: 110 * u,
            left: -85 * u,
          },
        ]}
      />

      {/* vòng tròn mờ ở giữa */}
      <View
        style={[
          s.bgCircle,
          {
            width: 130 * u,
            height: 130 * u,
            borderRadius: 65 * u,
            top: 310 * u,
            right: 38 * u,
            backgroundColor: "rgba(253,226,244,0.45)",
          },
        ]}
      />

      <View
        style={[
          s.bgCircle,
          {
            width: 88 * u,
            height: 88 * u,
            borderRadius: 44 * u,
            top: 760 * u,
            left: 18 * u,
            backgroundColor: "rgba(226,237,255,0.48)",
          },
        ]}
      />

      <View
        style={[
          s.bgCircle,
          {
            width: 72 * u,
            height: 72 * u,
            borderRadius: 36 * u,
            bottom: 280 * u,
            right: 30 * u,
            backgroundColor: "rgba(253,234,247,0.42)",
          },
        ]}
      />

      {/* pill họa tiết */}
      <View
        style={[
          s.bgPill,
          {
            width: 90 * u,
            height: 28 * u,
            borderRadius: 18 * u,
            top: 170 * u,
            right: 78 * u,
            transform: [{ rotate: "26deg" }],
            backgroundColor: "rgba(255,255,255,0.34)",
          },
        ]}
      />

      <View
        style={[
          s.bgPill,
          {
            width: 72 * u,
            height: 22 * u,
            borderRadius: 14 * u,
            top: 205 * u,
            right: 135 * u,
            transform: [{ rotate: "26deg" }],
            backgroundColor: "rgba(250,214,236,0.40)",
          },
        ]}
      />

      <View
        style={[
          s.bgPill,
          {
            width: 76 * u,
            height: 24 * u,
            borderRadius: 14 * u,
            bottom: 200 * u,
            left: 44 * u,
            transform: [{ rotate: "-18deg" }],
            backgroundColor: "rgba(220,236,255,0.42)",
          },
        ]}
      />
    </View>
  );
}
export default function ProfileScreen() {
  const profile = profileSession.useValue();

  const { width, fontScale } = useWindowDimensions();

  /*
   * Ảnh thiết kế reference khoảng 941px.
   * Giữ scale theo chiều rộng để layout trên iPhone
   * gần mockup nhất.
   */
  const u = Math.min(width, 640) / 941;

  const large = fontScale > 1.2;

  const picking = useRef(false);
  const [busy, setBusy] = useState(false);

  const changePhoto = async () => {
    if (picking.current) return;

    picking.current = true;
    setBusy(true);

    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
        });

      if (
        !result.canceled &&
        result.assets[0]?.uri
      ) {
        profileSession.set((current) => ({
          ...current,
          avatarUri: result.assets[0].uri,
        }));
      }
    } catch {
      Alert.alert(
        "Không mở được ảnh",
        "Bạn hãy thử chọn ảnh lại.",
      );
    } finally {
      picking.current = false;
      setBusy(false);
    }
  };

  return (
    <LinearGradient
      colors={[
        "#F9DFF0",
        "#F3E7FB",
        "#E6F0FF",
        "#DCEEFF",
      ]}
      locations={[0, 0.24, 0.62, 1]}
      style={s.fill}
    >
      <BackgroundDecor u={u} />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView
        edges={["top", "left", "right"]}
        style={s.fill}
      >
        {/* ================= HEADER ================= */}

        <View style={s.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại Tài khoản"
            style={s.back}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/account")
            }
          >
            <Ionicons
              name="chevron-back"
              size={30}
              color={pink}
            />
          </Pressable>

          <Text
            accessibilityRole="header"
            style={[
              s.title,
              {
                fontSize: Math.max(
                  24,
                  42 * u,
                ),
              },
            ]}
          >
            Hồ sơ cá nhân
          </Text>

          <View style={s.back} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.content,
            {
              paddingHorizontal: 42 * u,
              gap: 20 * u,
              paddingBottom: 28,
            },
          ]}
        >
          {/* ================= PROFILE HERO ================= */}

          <View
            style={[
              s.card,
              s.identity,
              {
                paddingHorizontal: 28 * u,
                paddingVertical: 27 * u,
                gap: 28 * u,
                borderRadius: 28 * u,
              },
              large && s.identityLarge,
            ]}
          >
            {/* Nhấn trực tiếp avatar để thay ảnh */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thay ảnh đại diện"
              accessibilityState={{
                disabled: busy,
                busy,
              }}
              disabled={busy}
              onPress={changePhoto}
              style={{
                width: 182 * u,
                height: 182 * u,
              }}
            >
              <Image
                source={
                  profile.avatarUri
                    ? {
                        uri: profile.avatarUri,
                      }
                    : require(
                        "../../../assets/profile-avatar.png"
                      )
                }
                resizeMode="cover"
                accessibilityLabel={`Ảnh đại diện ${profile.name}`}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 91 * u,
                }}
              />
            </Pressable>

            <View
              style={[
                s.identityCopy,
                {
                  gap: 11 * u,
                },
                large && s.auto,
              ]}
            >
              <Text
                style={[
                  s.name,
                  {
                    fontSize: Math.max(
                      19,
                      37 * u,
                    ),
                    lineHeight: Math.max(
                      25,
                      44 * u,
                    ),
                  },
                ]}
              >
                {profile.name}
              </Text>

              <View
                style={[
                  s.role,
                  {
                    paddingHorizontal: 21 * u,
                    paddingVertical: 8 * u,
                  },
                ]}
              >
                <Text
                  style={[
                    s.roleText,
                    {
                      fontSize: Math.max(
                        13,
                        25 * u,
                      ),
                    },
                  ]}
                >
                  Tình nguyện viên
                </Text>
              </View>

              <Text
                style={[
                  s.memberText,
                  {
                    fontSize: Math.max(
                      13,
                      25 * u,
                    ),
                  },
                ]}
              >
                Thành viên từ 2026
              </Text>
            </View>

            
          </View>

          {/* ================= PERSONAL INFO ================= */}

          <Panel
            title="Thông tin cá nhân"
            u={u}
          >
            <Details
              u={u}
              large={large}
              rows={[
                {
                  label: "Họ và tên",
                  value: profile.name,
                },
                {
                  label: "Ngày sinh",
                  value: profile.birthday,
                },
                {
                  label: "Giới tính",
                  value: profile.gender,
                },
                {
                  label: "Số điện thoại",
                  value: profile.phone,
                },
                {
                  label: "Email",
                  value: profile.email,
                },
                {
                  label:
                    "Khu vực sinh sống",
                  value: profile.city,
                },
              ]}
            />
          </Panel>

          {/* ================= EMERGENCY ================= */}

          <Panel
            title="Liên hệ khẩn cấp"
            u={u}
          >
            <Details
              u={u}
              large={large}
              rows={[
                {
                  label: "Họ và tên",
                  value:
                    profile.emergencyName,
                },
                {
                  label: "Mối quan hệ",
                  value:
                    profile.emergencyRelationship,
                },
                {
                  label: "Số điện thoại",
                  value:
                    profile.emergencyPhone,
                },
              ]}
            />
          </Panel>

          {/* ================= SKILLS ================= */}

          <Panel
            title="Kỹ năng"
            u={u}
          >
            <Tags
              value={profile.skills}
              u={u}
            />
          </Panel>

          {/* ================= INTERESTS ================= */}

          <Panel
            title="Lĩnh vực quan tâm"
            u={u}
          >
            <Tags
              value={profile.interests}
              u={u}
            />
          </Panel>
          <Pressable
  accessibilityRole="button"
  onPress={() => openAccount("edit")}
  style={(state) => [(({ pressed }) => [
    s.bottomEditButton,
    { opacity: pressed ? 0.7 : 1 },
  ])(state), { overflow: 'hidden', borderColor: 'transparent' }]}
><BrandActionBackground radius={0} disabled={false} />
  <LinearGradient
    colors={buttonTheme.buttons.gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={s.bottomEditGradient}
  >
    <Text style={[s.bottomEditText, { color: buttonTheme.buttons.primaryText }]}>
      Chỉnh sửa hồ sơ
    </Text>
  </LinearGradient>
</Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* =========================================================
   STYLES
========================================================= */

const s = StyleSheet.create({
  fill: {
    flex: 1,
  },

  header: {
    height: 68,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: ink,
    letterSpacing: -0.6,
  },

  content: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingTop: 12,
  },

  card: {
    backgroundColor: "#FFFFFFF6",

    shadowColor: "#8FA8C8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,

    elevation: 2,
  },

  /* PROFILE */

  identity: {
    flexDirection: "row",
    alignItems: "center",
  },

  identityLarge: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  identityCopy: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: ink,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  role: {
    alignSelf: "flex-start",
    borderRadius: 30,
    backgroundColor: "#FDEAF7",
  },

  roleText: {
    color: pink,
    fontWeight: "500",
  },

  memberText: {
    color: muted,
  },

  /* SECTION */

  heading: {
    color: ink,
    fontWeight: "800",
    letterSpacing: -0.35,
  },

  /* DETAIL ROW */

  detail: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailLarge: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingVertical: 8,
  },

  label: {
    width: "48%",
    color: muted,
  },

  value: {
    flex: 1,
    minWidth: 0,
    color: ink,
  },

  divider: {
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: "#DCE4EF",
  },

  auto: {
    width: "auto",
    flex: 0,
  },

  /* TAGS */

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  tag: {
    backgroundColor: "#F2F4F8",
    alignItems: "center",
    justifyContent: "center",
  },

  tagText: {
    color: ink,
    fontWeight: "400",
  },

  emptyText: {
    color: muted,
  },
  bgBlob: {
    position: "absolute",
  },
  
  bgCircle: {
    position: "absolute",
  },
  
  bgPill: {
    position: "absolute",
  },
  bottomEditButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: -10,
  },
  
  bottomEditGradient: {
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  
  bottomEditText: {
    color: "#122453",
    fontSize: 15,
    fontWeight: "700",
  },
});
