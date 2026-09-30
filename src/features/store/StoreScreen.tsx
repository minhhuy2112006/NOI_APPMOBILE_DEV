import { PageHeader } from '../../components/PageHeader';
import { useRef, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PhuocGlow } from "./PhuocGlow";
import { Button, Chip } from "../../components/ui";
import { theme } from "../../theme/tokens";
import { gifts, initialWallet, redeemGift, type Gift } from "./model";

const format = (value: number) => value.toLocaleString("vi-VN");
function ProductImage({ quadrant }: { quadrant: number }) {
  const [size, setSize] = useState(0);
  return (
    <View
      onLayout={(event) => setSize(event.nativeEvent.layout.width)}
      style={s.photo}
    >
      {size > 0 && (
        <Image
          accessible={false}
          source={require("../../../assets/store/gifts.png")}
          style={{
            width: size * 2,
            height: size * 2,
            position: "absolute",
            left: -(quadrant % 2) * size,
            top: -Math.floor(quadrant / 2) * size,
          }}
        />
      )}
    </View>
  );
}
export default function StoreScreen() {
  const scroll = useRef<ScrollView>(null);
  const [catalogY, setCatalogY] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const pageCount = Math.ceil(gifts.length / pageSize);
  const visibleGifts = gifts.slice(page * pageSize, (page + 1) * pageSize);
  const goToPage = (next: number) => {
    setPage(next);
    scroll.current?.scrollTo({ y: catalogY, animated: true });
  };
  const [category, setCategory] = useState("Tất cả");
  const [wallet, setWallet] = useState(initialWallet);
  const [panel, setPanel] = useState<"badges" | "history" | "gift" | null>(
    null,
  );
  const [selected, setSelected] = useState<Gift | null>(null);
  const [message, setMessage] = useState("");
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 350 || fontScale > 1.3;
  const close = () => {
    setPanel(null);
    setSelected(null);
    setMessage("");
  };
  const redeemed = selected ? wallet.redeemed.includes(selected.id) : false;
  const insufficient = selected ? wallet.balance < selected.points : false;
  return (
    <LinearGradient colors={["#FCE6F5", "#E5E8FC", "#FFF0F8"]} style={s.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={s.fill}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <PageHeader title="CỬA HÀNG NOI" subtitle="Việc tốt mỗi ngày, niềm vui trao tay ✨" />
          <LinearGradient
            colors={["#DED5FF", "#FAD6ED", "#F8E9FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.wallet}
          >
            <View style={s.balanceRow}>
              <PhuocGlow />
              <View style={{ flex: 1 }}>
                <Text style={s.walletLabel}>Điểm Phước của bạn</Text>
                <Text accessibilityLiveRegion="polite" style={s.balance}>
                  {format(wallet.balance)}
                </Text>
                <View style={s.rank}>
                  <Ionicons name="leaf" size={14} color="#398360" />
                  <Text style={s.rankText}>Mầm xanh</Text>
                </View>
              </View>
            </View>
            <View style={s.levelCard}>
              <View
                accessibilityRole="progressbar"
                accessibilityLabel="Điểm tích lũy lên hạng"
                accessibilityValue={{
                  min: 0,
                  max: 1500,
                  now: 1250,
                  text: "1.250 trên 1.500 điểm tích lũy",
                }}
                style={s.levelTrack}
              >
                <LinearGradient
                  colors={["#B388F5", "#E986CC", "#FFC77C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.levelFill}
                >
                  <View style={s.trackShine} />
                </LinearGradient>
                <View style={s.levelMarker}>
                  <Ionicons name="flower" size={19} color="#C45196" />
                </View>
              </View>
              <View style={s.levelTop}>
                <Text style={s.levelNumbers}>1.250 / 1.500 Phước</Text>
                <Text style={s.levelNumbers}>Còn 250 là lên hạng 🌷</Text>
              </View>
            </View>
            <View style={s.links}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPanel("badges")}
                style={s.link}
              >
                <Ionicons name="ribbon-outline" size={22} color="#62518F" />
                <Text style={s.linkText}>Huy hiệu</Text>
                <Ionicons name="chevron-forward" size={15} color="#62518F" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPanel("history")}
                style={s.link}
              >
                <Ionicons name="time-outline" size={22} color="#62518F" />
                <Text style={s.linkText}>Lịch sử điểm</Text>
                <Ionicons name="chevron-forward" size={15} color="#62518F" />
              </Pressable>
            </View>
            <Text style={s.caption}>
              ⓘ Điểm Phước không có giá trị tiền tệ.
            </Text>
          </LinearGradient>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filters}
          >
            {["Tất cả", "Quà NOI", "Quà đối tác"].map((label) => (
              <Chip
                key={label}
                label={label}
                selected={category === label}
                onPress={() => {
                  setCategory(label);
                  setPage(0);
                }}
              />
            ))}
          </ScrollView>
          <View onLayout={(event) => setCatalogY(event.nativeEvent.layout.y)}>
            {category !== "Quà đối tác"}
          </View>
          {category === "Quà đối tác" ? (
            <View style={s.empty}>
              <Ionicons
                name="gift-outline"
                size={36}
                color={theme.colors.primary}
              />
              <Text style={s.productTitle}>Quà đối tác đang được chuẩn bị</Text>
              <Text style={s.caption}>
                Bạn có thể khám phá bộ quà NOI trước nhé.
              </Text>
              <Button
                title="Xem quà NOI"
                onPress={() => setCategory("Quà NOI")}
              />
            </View>
          ) : (
            <View style={s.grid}>
              {visibleGifts.map((gift) => {
                const done = wallet.redeemed.includes(gift.id);
                return (
                  <View
                    key={gift.id}
                    style={{ width: compact ? "100%" : "50%", padding: 5 }}
                  >
                    <View style={s.product}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Xem ${gift.title}`}
                        onPress={() => {
                          setSelected(gift);
                          setPanel("gift");
                        }}
                      >
                        <ProductImage quadrant={gift.quadrant} />
                      </Pressable>
                      <View style={s.productBody}>
                        <Text style={s.productTitle}>{gift.title}</Text>
                        <Text style={s.price}>
                          {format(gift.points)}{" "}
                          <Text style={{ fontSize: 13 }}>điểm</Text>
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            setSelected(gift);
                            setPanel("gift");
                          }}
                          style={({ pressed }) => [
                            s.redeem,
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <LinearGradient
                            colors={["#9765F4", "#D75DBF"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.redeemInner}
                          >
                            <Text style={s.redeemText}>
                              {done
                                ? "Đã đổi"
                                : wallet.balance < gift.points
                                  ? "Xem quà"
                                  : "Đổi quà"}
                            </Text>
                          </LinearGradient>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          {category !== "Quà đối tác" && pageCount > 1 && (
            <View style={s.pagination}>
              <Button
                title="‹ Trước"
                disabled={page === 0}
                onPress={() => goToPage(page - 1)}
              />
              <Text accessibilityLiveRegion="polite" style={s.caption}>
                Trang {page + 1}/{pageCount}
              </Text>
              <Button
                title="Tiếp ›"
                disabled={page + 1 === pageCount}
                onPress={() => goToPage(page + 1)}
              />
            </View>
          )}
        </ScrollView>
        <Modal
          visible={panel !== null}
          transparent
          animationType="slide"
          onRequestClose={close}
        >
          <View style={s.overlay}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              onPress={close}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView
              edges={["bottom"]}
              style={s.sheet}
              accessibilityViewIsModal
            >
              <View style={s.sheetHeader}>
                <Text style={s.heading}>
                  {panel === "badges"
                    ? "Huy hiệu của bạn"
                    : panel === "history"
                      ? "Lịch sử điểm"
                      : "Đổi quà"}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Đóng"
                  onPress={close}
                  style={s.close}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={s.sheetBody}>
                {panel === "badges" && (
                  <>
                    <View style={s.badge}>
                      <Ionicons name="leaf" size={48} color="#48986D" />
                      <Text style={s.productTitle}>Mầm xanh</Text>
                    </View>
                    <Text style={s.caption}>
                      Hạng minh họa dựa trên 1.250 điểm tích lũy. Đổi quà trừ
                      điểm khả dụng, không giảm điểm tích lũy xét hạng.
                    </Text>
                  </>
                )}
                {panel === "history" && (
                  <>
                    <View style={s.historyRow}>
                      <Text style={s.productTitle}>Điểm khởi tạo demo</Text>
                      <Text style={s.price}>+1.250</Text>
                    </View>
                    {wallet.history.map((item) => (
                      <View key={item.title} style={s.historyRow}>
                        <Text style={[s.caption, { flex: 1 }]}>
                          {item.title}
                        </Text>
                        <Text style={s.price}>−{format(item.points)}</Text>
                      </View>
                    ))}
                    <Text style={s.caption}>
                      Đây là lịch sử trong phiên demo, chưa có giao dịch trên hệ
                      thống.
                    </Text>
                  </>
                )}
                {panel === "gift" && selected && (
                  <>
                    <View style={{ width: 170, alignSelf: "center" }}>
                      <ProductImage quadrant={selected.quadrant} />
                    </View>
                    <Text style={s.productTitle}>{selected.title}</Text>
                    <Text style={s.caption}>{selected.description}</Text>
                    <Text style={s.price}>{format(selected.points)} điểm</Text>
                    <Text style={s.caption}>
                      Điểm hiện có: {format(wallet.balance)}. Mỗi quà chỉ đổi
                      một lần trong phiên demo; không có đơn hàng hoặc giao quà
                      thực tế.
                    </Text>
                    {message ? (
                      <Text accessibilityLiveRegion="polite" style={s.success}>
                        {message}
                      </Text>
                    ) : null}
                    <Button
                      disabled={redeemed || insufficient}
                      title={
                        redeemed
                          ? "Đã đổi trong phiên này"
                          : insufficient
                            ? "Chưa đủ điểm"
                            : "Xác nhận đổi quà demo"
                      }
                      onPress={() => {
                        setWallet((current) =>
                          redeemGift(current, selected.id),
                        );
                        setMessage(
                          "Đã đổi quà demo. Điểm và lịch sử đã cập nhật.",
                        );
                      }}
                    />
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  hero: { paddingTop: 8, paddingBottom: 10, gap: 3 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
    color: "#81619D",
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#49345F",
  },
  heroAccent: {
    color: "#B33B91",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  heroSticker: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#FFF1CE",
    borderWidth: 1,
    borderColor: "#FFE2A1",
    transform: [{ rotate: "-2deg" }],
  },
  stickerText: {
    color: "#875223",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  levelCard: {
    padding: 7,
    backgroundColor: "#FFFFFFB8",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    gap: 3,
  },
  levelTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E4F5D9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  levelPillText: { fontSize: 11, fontWeight: "700", color: "#417852" },
  levelCheer: { fontSize: 11, fontWeight: "600", color: "#9D518B" },
  levelTitle: { fontSize: 19, fontWeight: "800", color: "#634581" },
  levelTrack: {
    height: 14,
    borderRadius: 14,
    backgroundColor: "#EBE0F6",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginVertical: 4,
  },
  levelFill: { width: "83.333%", height: "100%", borderRadius: 12 },
  trackShine: {
    height: 4,
    backgroundColor: "#FFFFFF70",
    borderRadius: 5,
    marginHorizontal: 6,
    marginTop: 3,
  },
  levelMarker: {
    position: "absolute",
    left: "83.333%",
    marginLeft: -12,
    top: -7,
    width: 24,
    height: 24,
    borderRadius: 15,
    backgroundColor: "#FFF4CE",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "12deg" }],
  },
  levelNumbers: { color: "#796087", fontSize: 11, fontWeight: "700" },
  levelNote: { fontSize: 13, lineHeight: 20, color: "#796087" },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },

  fill: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  wallet: {
    padding: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#FFFFFFC9",
    gap: 4,
  },
  balanceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  star: {
    width: 65,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  walletLabel: { fontSize: 13, fontWeight: "600", color: theme.colors.text },
  balance: { fontSize: 30, fontWeight: "800", color: theme.colors.primary },
  rank: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 5,
    backgroundColor: "#E0F6E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  rankText: { color: "#286A4B", fontSize: 12, fontWeight: "600" },
  track: {
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFFA6",
  },
  progress: { width: "83.333%", height: "100%", borderRadius: 8 },
  caption: { fontSize: 12, lineHeight: 19, color: theme.colors.muted },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF8C",
    paddingTop: 4,
  },
  link: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    minHeight: 44,
    flexGrow: 1,
  },
  linkText: { color: "#514378", fontSize: 13, fontWeight: "500" },
  filters: { gap: 6, paddingVertical: 6 },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: theme.colors.primaryInk,
    flexShrink: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginTop: 10,
  },
  product: {
    backgroundColor: "#FFFFFFED",
    borderRadius: 19,
    padding: 6,
    overflow: "hidden",
  },
  photo: {
    aspectRatio: 1,
    width: "100%",
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#EEE3F5",
  },
  productBody: { padding: 7, gap: 9 },
  productTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: theme.colors.text,
  },
  price: { fontSize: 21, fontWeight: "700", color: theme.colors.primary },
  redeem: { borderRadius: 13, overflow: "hidden" },
  redeemInner: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  redeemText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  demo: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    color: theme.colors.muted,
    marginTop: 4,
  },
  empty: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#FFFFFFDA",
    gap: 14,
    marginTop: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#211A365E",
  },
  sheet: {
    padding: 20,
    maxHeight: "90%",
    backgroundColor: "#FFFAFE",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: { gap: 16, paddingVertical: 16 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECDEEE",
  },
  badge: { alignItems: "center", gap: 8, padding: 18 },
  success: { color: "#276B4B", fontSize: 14, lineHeight: 21 },
});

