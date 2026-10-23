import { theme as buttonTheme , theme } from '../../theme/tokens';
import { PageHeader } from "../../components/PageHeader";
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DonationPanel, type DonationFlow } from "./DonationPanel";
import { ActionBackground, Button } from "../../components/ui";

import { router } from "expo-router";

type Icon = ComponentProps<typeof Ionicons>["name"];

const openDetail = (item: Campaign) => {
  router.push({
    pathname: "/contributions/[id]",
    params: {
      id: item.id,
    },
  });
};

const categories: { name: string; icon: Icon; color: string; tint: string }[] =
  [
    {
      name: "Quỹ dự phòng",
      icon: "shield-checkmark",
      color: "#5D459E",
      tint: "#E0D6FA",
    },
    { name: "Trẻ em", icon: "person", color: "#A92C68", tint: "#FAD0E2" },
    { name: "Người già", icon: "people", color: "#246D96", tint: "#CDE9FA" },
    { name: "Thiên tai", icon: "rainy", color: "#905A1F", tint: "#FFE2B5" },
    { name: "Xóa đói", icon: "restaurant", color: "#2C743C", tint: "#CDECC9" },
    { name: "Y tế", icon: "medkit", color: "#7444A7", tint: "#E4D4F8" },
    { name: "Giáo dục", icon: "school", color: "#246D96", tint: "#CDE9FA" },
    { name: "Môi trường", icon: "leaf", color: "#2C743C", tint: "#CDECC9" },
    { name: "Nhà ở", icon: "home", color: "#A92C68", tint: "#FAD0E2" },
  ];
const contributionActions = [
  { mode: "companion", title: "Thùng đồng hành NOI", icon: "heart-outline", color: "#D95399", tint: "#FDE9F3" },
  { mode: "medical", title: "Y tế khẩn cấp", icon: "medkit-outline", color: "#4989B8", tint: "#E7F3FF" },
  {
    mode: "history",
    title: "Lịch sử đóng góp",
    icon: "time-outline",
    color: "#B66B25",
    tint: "#FFF1DF",
  },
  {
    mode: "receipts",
    title: "Biên nhận",
    icon: "receipt-outline",
    color: "#4D8EF3",
    tint: "#EAF2FF",
  },
  {
    mode: "recurring",
    title: "Đóng góp định kỳ",
    icon: "calendar-outline",
    color: "#975CE6",
    tint: "#F2E9FF",
  },
  {
    mode: "favorites",
    title: "Chiến dịch yêu thích",
    icon: "heart-outline",
    color: "#D94F65",
    tint: "#FDECEF",
  },
] as const;
const campaigns = [
  {
    id: "reserve",
    title: "Quỹ dự phòng cộng đồng",
    category: "Quỹ dự phòng",
    group: "reserve",
    photo: 4,
    description:
      "Nguồn hỗ trợ dự phòng cho các nhu cầu cộng đồng khẩn cấp. Quy chế phân bổ và báo cáo sẽ được công bố khi vận hành thật.",
    raised: 0,
    target: 100000000,
    donors: 0,
    days: 0,
  },
  {
    id: "meal",
    title: "Bữa cơm sẻ chia",
    category: "Xóa đói",
    group: "featured",
    photo: 0,
    description: "Trao bữa ăn ấm áp đến những người khó khăn.",
    raised: 12000000,
    target: 20000000,
    donors: 238,
    days: 12,
  },
  {
    id: "school",
    title: "Tiếp bước đến trường",
    category: "Giáo dục",
    group: "featured",
    photo: 1,
    description: "Hỗ trợ học bổng cho trẻ em có hoàn cảnh khó khăn.",
    raised: 8500000,
    target: 15000000,
    donors: 189,
    days: 8,
  },
  {
    id: "green",
    title: "Gieo mầm xanh",
    category: "Môi trường",
    group: "featured",
    photo: 2,
    description: "Trồng cây, bảo vệ môi trường vì tương lai bền vững.",
    raised: 18000000,
    target: 25000000,
    donors: 330,
    days: 15,
  },
  {
    id: "elderly",
    title: "Nhịp cầu yêu thương",
    category: "Người già",
    group: "organization",
    photo: 3,
    description:
      "Hỗ trợ nhu yếu phẩm, chăm sóc sức khỏe cho người già neo đơn.",
    raised: 28500000,
    target: 50000000,
    donors: 421,
    days: 18,
  },
  {
    id: "flood",
    title: "Chung tay sau bão lũ",
    category: "Thiên tai",
    group: "organization",
    photo: 4,
    description: "Hỗ trợ người dân vùng bị ảnh hưởng bởi thiên tai, bão lũ.",
    raised: 62000000,
    target: 100000000,
    donors: 892,
    days: 10,
  },
  {
    id: "winter",
    title: "Sưởi ấm mùa đông",
    category: "Trẻ em",
    group: "organization",
    photo: 5,
    description: "Trao áo ấm, chăn mềm cho trẻ em vùng cao trong mùa đông.",
    raised: 35000000,
    target: 60000000,
    donors: 512,
    days: 14,
  },
  {
    id: "minh",
    title: "Điều trị cho bé Minh",
    category: "Y tế",
    group: "personal",
    photo: 6,
    description: "Hỗ trợ chi phí điều trị bệnh tim bẩm sinh cho bé Minh.",
    raised: 46200000,
    target: 80000000,
    donors: 615,
    days: 20,
  },
  {
    id: "home",
    title: "Mái ấm cho bà Năm",
    category: "Nhà ở",
    group: "personal",
    photo: 7,
    description: "Xây lại căn nhà an toàn, kiên cố cho bà Năm neo đơn.",
    raised: 32000000,
    target: 70000000,
    donors: 280,
    days: 25,
  },
  {
    id: "children",
    title: "Bữa ăn cho em nhỏ vùng cao",
    category: "Xóa đói",
    group: "personal",
    photo: 8,
    description: "Hỗ trợ bữa ăn dinh dưỡng hằng ngày cho trẻ em vùng cao.",
    raised: 24000000,
    target: 50000000,
    donors: 367,
    days: 17,
  },
];
type Campaign = (typeof campaigns)[number];
const money = (amount: number) => amount.toLocaleString("vi-VN") + "đ";
const colorFor = (item: Campaign) =>
  ["school", "flood", "home"].includes(item.id)
    ? "#488FDB"
    : ["green", "children"].includes(item.id)
      ? "#61B875"
      : "#E45C98";
function Photo({ index }: { index: number }) {
  const [size, setSize] = useState(0);
  return (
    <View
      onLayout={(event) => setSize(event.nativeEvent.layout.width)}
      style={s.photo}
    >
      {size > 0 && (
        <Image
          accessible={false}
          source={require("../../../assets/contributions/campaigns.png")}
          style={{
            position: "absolute",
            width: size * 3,
            height: size * 3,
            left: -(index % 3) * size,
            top: -Math.floor(index / 3) * size,
          }}
        />
      )}
    </View>
  );
}
function Progress({ item }: { item: Campaign }) {
  const percent = Math.round((item.raised / item.target) * 100);
  return (
    <View style={s.progressBlock}>
      <Text style={s.amount}>
        {money(item.raised)}{" "}
        <Text style={s.target}>/ {money(item.target)}</Text>
      </Text>
      <View style={s.progressRow}>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: percent }}
          style={s.track}
        >
          <View
            style={{
              width: `${percent}%`,
              height: "100%",
              backgroundColor: colorFor(item),
              borderRadius: 5,
            }}
          />
        </View>
        <Text style={[s.percent, { color: colorFor(item) }]}>{percent}%</Text>
      </View>
      <View style={s.facts}>
        <Text style={s.fact}>♧ {item.donors} lượt đóng góp</Text>
        {item.id !== "reserve" && (
          <Text style={s.fact}>
            ◷ Còn <Text style={s.days}>{item.days} ngày</Text>
          </Text>
        )}
      </View>
    </View>
  );
}
function DonateButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Đóng góp ngay"
      hitSlop={6}
      onPress={onPress}
      style={(state) => [(({ pressed }) => [
        s.donateButton,
        pressed && {
          opacity: 1,
          transform: [{ scale: 0.98 }],
        },
      ])(state), { overflow: 'hidden', borderColor: 'transparent' }]}
    >
{({ pressed }) => <>
<ActionBackground pressed={pressed} radius={18} /><Ionicons name="heart-outline" size={16} color={buttonTheme.buttons.primaryText} /><Text style={[s.donateButtonText, { color: buttonTheme.buttons.primaryText }]}>Đóng góp</Text>
</>}
</Pressable>
  );
}
function DetailButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={(state) => [(({ pressed }) => [
        s.detailButton,
        pressed && {
          opacity: 1,
          transform: [{ scale: 0.98 }],
        },
      ])(state), { overflow: 'hidden', borderColor: 'transparent' }]}
    >
{({ pressed }) => <>
<ActionBackground pressed={pressed} radius={18} /><Text style={[s.detailButtonText, { color: buttonTheme.buttons.primaryText }]}>Xem chi tiết</Text>

      <Ionicons name="arrow-forward" size={14} color={buttonTheme.buttons.primaryText} />
</>}
</Pressable>
  );
}
export default function ContributionsScreen() {
  const [flow, setFlow] = useState<DonationFlow>(null);
  const openFlow = (next: NonNullable<DonationFlow>) => {
    setSelected(null);
    setPanel(null);
    setAllGroup(null);
    setFlow(next);
  };
  const [category, setCategory] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [panel, setPanel] = useState<"categories" | null>(null);
  const [allGroup, setAllGroup] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const { width, fontScale } = useWindowDimensions();
  const contentWidth = Math.min(width, 680) - 32;
  const compact = width < 370 || fontScale > 1.3;
  const cardWidth = Math.min(240, contentWidth * (compact ? 0.82 : 0.59));
  const filtered = campaigns.filter(
    (item) =>
      (!category || item.category === category) &&
      (!savedOnly || favorites.includes(item.id)),
  );
  const featured = filtered.filter((item) => item.group === "featured");
  const toggleFavorite = (id: string) =>
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  const badge = (item: Campaign) => {
    const cat = categories.find((c) => c.name === item.category)!;
    return (
      <View style={[s.badge, { backgroundColor: cat.tint }]}>
        <Text style={[s.badgeText, { color: cat.color }]}>{cat.name}</Text>
      </View>
    );
  };
  const heading = (title: string, group: string) => (
    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setAllGroup(group)}
        style={s.link}
      >
        <Text style={s.linkText}>Xem tất cả ›</Text>
      </Pressable>
    </View>
  );
  const row = (item: Campaign, hideArrow = false) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={"Xem chi tiết " + item.title}
      onPress={() => {
        setSelected(null);
        setPanel(null);
        setAllGroup(null);

        openDetail(item);
      }}
      style={({ pressed }) => [
        s.row,
        pressed && {
          opacity: 0.88,
          transform: [{ scale: 0.99 }],
        },
      ]}
    >
      {/* ẢNH */}
      <View
        style={{
          width: compact ? 76 : 92,
          alignSelf: "flex-start",
        }}
      >
        <Photo index={item.photo} />

        <View style={s.rowBadge}>{badge(item)}</View>
      </View>

      {/* NỘI DUNG */}
      <View style={s.rowBody}>
        <Text style={s.rowTitle}>{item.title}</Text>

        <Text numberOfLines={2} style={s.description}>
          {item.description}
        </Text>

        <Progress item={item} />
      </View>
      {!hideArrow && (
        <View style={s.rowArrow}>
          <Ionicons name="chevron-forward" size={18} color="#9B8FA4" />
        </View>
      )}
    </Pressable>
  );
  return (
    <LinearGradient colors={theme.gradients.page} style={s.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={s.fill}>
        <ScrollView contentContainerStyle={s.content}>
          <PageHeader
            title="ĐÓNG GÓP"
            subtitle="Góp chút yêu thương, nối dài hy vọng"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.actionRow} contentContainerStyle={{ paddingHorizontal: 2, paddingVertical: 4, gap: 0, alignItems: "flex-start" }}>
            {contributionActions.map((item) => (
              <Pressable
                key={item.mode}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                accessibilityState={
                  item.mode === "favorites"
                    ? { selected: savedOnly }
                    : undefined
                }
                onPress={() => {
                  if (item.mode === "companion") {
                    router.push("/contributions/companion");
                  } else if (item.mode === "medical") {
                    router.push("/contributions/emergency-medical");
                  } else if (item.mode === "favorites") {
                    setSavedOnly(!savedOnly);
                    setCategory("");
                    setPage(0);
                  } else openFlow({ mode: item.mode });
                }}
                style={({ pressed }) => [
                  s.actionCard,
                  (pressed || (item.mode === "favorites" && savedOnly)) && {
                    backgroundColor: "#FCEEF6",
                  },
                ]}
              >
                <View style={[s.actionIcon, { backgroundColor: item.tint }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={s.actionLabel}>
                  {item.mode === "companion" ? "Thùng đồng\nhành NOI" : item.mode === "medical" ? "Y tế\nkhẩn cấp" : item.mode === "history" ? "Lịch sử\nđóng góp" : item.mode === "recurring" ? "Đóng góp\nđịnh kỳ" : item.mode === "favorites" ? "Chiến dịch\nyêu thích" : item.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {heading("Danh mục thiện nguyện", "categories")}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.categories}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat.name}
                accessibilityRole="button"
                accessibilityState={{ selected: category === cat.name }}
                onPress={() => {
                  setCategory(category === cat.name ? "" : cat.name);
                  setPage(0);
                }}
                style={[
                  s.category,
                  {
                    backgroundColor:
                      cat.color === "#A92C68" ? theme.buttons.secondaryBackground : category === cat.name ? cat.color : cat.tint,
                    borderColor: cat.color === "#A92C68" ? theme.buttons.border : cat.color,
                  },
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={18}
                  color={cat.color === "#A92C68" ? theme.buttons.text : category === cat.name ? "#FFFFFF" : cat.color}
                />
                <Text
                  style={[
                    s.categoryText,
                    { color: cat.color === "#A92C68" ? theme.buttons.text : category === cat.name ? "#FFFFFF" : cat.color },
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {(category || savedOnly) && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setCategory("");
                setSavedOnly(false);
                setPage(0);
              }}
              style={s.link}
            >
              <Text style={s.linkText}>
                {category || "Đã yêu thích"} · {filtered.length} kết quả · Xóa
                lọc
              </Text>
            </Pressable>
          )}
          {category === "Quỹ dự phòng" ? (
  <>
    {heading("Quỹ dự phòng", "reserve")}

    {filtered
      .filter((item) => item.group === "reserve")
      .map((item) => row(item))}
  </>
) : (
  <>
    {/* ==============================
        CHIẾN DỊCH NỔI BẬT
    ============================== */}
    {heading("Chiến dịch nổi bật", "featured")}

    {featured.length > 0 ? (
      <>
        <ScrollView
          key={`${category}-${savedOnly}-${cardWidth}`}
          horizontal
          snapToInterval={cardWidth + 10}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={100}
          onScroll={(e) => {
            setPage(
              Math.min(
                featured.length - 1,
                Math.round(
                  e.nativeEvent.contentOffset.x /
                    (cardWidth + 10),
                ),
              ),
            );
          }}
          contentContainerStyle={{
            gap: 10,
            paddingRight: Math.max(
              0,
              contentWidth - cardWidth,
            ),
          }}
          style={{ flexGrow: 0 }}
        >
          {featured.map((item) => (
            <View
              key={item.id}
              style={[
                s.featured,
                { width: cardWidth },
              ]}
            >
              {/* ẢNH */}
              <Pressable
  accessibilityRole="button"
  accessibilityLabel={`Xem chi tiết ${item.title}`}
  onPress={() => openDetail(item)}
>
                <Photo index={item.photo} />

                <View style={s.featuredBadge}>
                  {badge(item)}
                </View>
              </Pressable>

              {/* YÊU THÍCH */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  `${
                    favorites.includes(item.id)
                      ? "Bỏ yêu thích "
                      : "Yêu thích "
                  }${item.title}`
                }
                accessibilityState={{
                  selected: favorites.includes(item.id),
                }}
                onPress={() =>
                  toggleFavorite(item.id)
                }
                style={s.favorite}
              >
                <Ionicons
                  name={
                    favorites.includes(item.id)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={23}
                  color={
                    favorites.includes(item.id)
                      ? "#E54491"
                      : "#FFFFFF"
                  }
                />
              </Pressable>

              {/* NỘI DUNG CARD */}
              <Pressable
  accessibilityRole="button"
  accessibilityLabel={`Xem chi tiết ${item.title}`}
  onPress={() => openDetail(item)}
  style={s.cardBody}
>
                <Text style={s.rowTitle}>
                  {item.title}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    s.description,
                    {
                      minHeight: 34 * fontScale,
                    },
                  ]}
                >
                  {item.description}
                </Text>

                <Progress item={item} />
              </Pressable>

              {/* XEM CHI TIẾT */}
              <View
                style={{
                  padding: 9,
                  paddingTop: 0,
                }}
              >
                <DetailButton
                  onPress={() => openDetail(item)}
                />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* DOT INDICATOR */}
        <View style={s.dots}>
          {featured.map((item, index) => (
            <View
              key={item.id}
              style={[
                s.dot,
                index === page && {
                  backgroundColor: "#BB3195",
                },
              ]}
            />
          ))}
        </View>
      </>
    ) : (
      <Text style={s.empty}>
        Chưa có chiến dịch phù hợp với bộ lọc.
      </Text>
    )}

    {/* ==============================
        CHIẾN DỊCH TỔ CHỨC
    ============================== */}
    {heading(
      "Chiến dịch tổ chức",
      "organization",
    )}

    {filtered
      .filter(
        (item) =>
          item.group === "organization",
      )
      .map((item) => row(item, true))}

    {!filtered.some(
      (item) =>
        item.group === "organization",
    ) && (
      <Text style={s.empty}>
        Chưa có chiến dịch phù hợp.
      </Text>
    )}

    {/* ==============================
        CHIẾN DỊCH CÁ NHÂN
    ============================== */}
    {heading(
      "Chiến dịch cá nhân",
      "personal",
    )}

    {filtered
      .filter(
        (item) => item.group === "personal",
      )
      .map((item) => row(item, true))}

    {!filtered.some(
      (item) => item.group === "personal",
    ) && (
      <Text style={s.empty}>
        Chưa có chiến dịch phù hợp.
      </Text>
    )}
  </>
)}
        </ScrollView>
        <Modal
          visible={selected !== null || panel !== null || allGroup !== null}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setSelected(null);
            setPanel(null);
            setAllGroup(null);
          }}
        >
          <View style={s.overlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              onPress={() => {
                setSelected(null);
                setPanel(null);
                setAllGroup(null);
              }}
            />
            <SafeAreaView edges={["bottom"]} style={s.sheet}>
            <View style={s.sheetHeader}>
                  <Text style={s.sectionTitle}>
                  {selected
  ? selected.title
  : allGroup === "categories" || panel === "categories"
    ? "Danh mục thiện nguyện"
    : allGroup === "organization"
      ? "Chiến dịch tổ chức"
      : allGroup === "personal"
        ? "Chiến dịch cá nhân"
        : allGroup === "featured"
          ? "Chiến dịch nổi bật"
          : "Danh sách chiến dịch"}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Đóng"
                    style={s.menu}
                    hitSlop={10}
                    onPress={() => {
                      setSelected(null);
                      setPanel(null);
                      setAllGroup(null);
                    }}
                  >
                    <Ionicons name="close" size={24} color="#17234F" />
                  </Pressable>
                </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
              >
                
                {selected ? (
                  <>
                    <View style={{ width: 180, alignSelf: "center" }}>
                      <Photo index={selected.photo} />
                    </View>
                    {badge(selected)}
                    <Text style={s.description}>{selected.description}</Text>
                    <Progress item={selected} />
                    <DonateButton
                      onPress={() =>
                        openFlow({ mode: "donate", target: selected })
                      }
                    />
                    <Button
                      title={
                        favorites.includes(selected.id)
                          ? "Bỏ yêu thích"
                          : "Lưu chiến dịch yêu thích"
                      }
                      onPress={() => toggleFavorite(selected.id)}
                    />
                  </>
                ) : allGroup === "categories" || panel === "categories" ? (
                  categories.map((cat) => (
                    <Pressable
                      key={cat.name}
                      accessibilityRole="button"
                      style={[s.category, { backgroundColor: cat.tint }]}
                      onPress={() => {
                        setCategory(cat.name);
                        setPage(0);
                        setAllGroup(null);
                        setPanel(null);
                      }}
                    >
                      <Ionicons name={cat.icon} size={20} color={cat.color} />
                      <Text style={{ color: cat.color }}>{cat.name}</Text>
                    </Pressable>
                  ))
                ) : filtered.filter((item) => item.group === allGroup)
                    .length ? (
                  filtered
                    .filter((item) => item.group === allGroup)
                    .map((item) => row(item))
                ) : (
                  <Text style={s.empty}>Chưa có chiến dịch phù hợp.</Text>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
        <DonationPanel
          flow={flow}
          targets={campaigns}
          onClose={() => setFlow(null)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  actionRow: {
    flexGrow: 0, alignSelf: "stretch", backgroundColor: "#FFFFFF",
    borderRadius: 16, borderWidth: 1, borderColor: "#EAE2ED",
    marginTop: 0, marginBottom: 8,
  },
  actionCard: {
    width: 76, flexShrink: 0, alignItems: "center",
    paddingHorizontal: 2, paddingVertical: 4, gap: 4, borderRadius: 12,
  },
  actionIcon: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: "#F8EDF6",
    alignItems: "center", justifyContent: "center",
  },
  actionLabel: { fontSize: 10, lineHeight: 14, fontWeight: "600", color: "#36323B", textAlign: "center" },
  detailButton: {
    width: "100%",
    minHeight: 36,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,

    paddingHorizontal: 12,
    paddingVertical: 8,

    backgroundColor: theme.buttons.secondaryBackground,
    borderRadius: 18,

    borderWidth: 0,
  },

  detailButtonText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: theme.buttons.primaryText,
  },

  rowHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },

  fill: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  menu: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flexShrink: 1,
    fontSize: 29,
    lineHeight: 37,
    fontWeight: "900",
    color: "#8F2F78",
  },
  subtitle: { fontSize: 12, lineHeight: 18, color: "#5C6A80" },
  heartArt: {
    alignItems: "center",
    justifyContent: "center",
    width: 85,
    transform: [{ rotate: "10deg" }],
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    color: "#8F2F78",
    flexShrink: 1,
  },
  link: { minHeight: 44, justifyContent: "center" },
  linkText: { fontSize: 11, color: theme.buttons.text, fontWeight: "600" },
  categories: { gap: 7, paddingTop: 3, paddingBottom: 9 },
  category: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderBottomWidth: 3,
  },
  categoryText: { fontSize: 11, fontWeight: "700" },
  photo: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    backgroundColor: "#EDEAF3",
  },
  featured: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFFE8",
  },
  featuredBadge: { position: "absolute", left: 7, top: 8 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 10, fontWeight: "600" },
  favorite: {
    position: "absolute",
    right: 0,
    top: 0,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#13214735",
    borderBottomLeftRadius: 16,
  },
  cardBody: { padding: 9, gap: 5 },
  rowTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#22304A",
  },
  description: { fontSize: 11, lineHeight: 17, color: "#5C6A80" },
  progressBlock: { gap: 4, marginTop: 3 },
  amount: { fontSize: 11, lineHeight: 16, fontWeight: "700", color: "#22304A" },
  target: { fontSize: 10, fontWeight: "400", color: "#5C6A80" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  track: { flex: 1, height: 5, borderRadius: 5, backgroundColor: "#EDEEF5" },
  percent: { fontSize: 10, fontWeight: "700" },
  facts: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  fact: { fontSize: 10, lineHeight: 15, color: "#5C6A80" },
  days: { color: "#BB3195", fontWeight: "600" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  dot: { width: 5, height: 5, borderRadius: 4, backgroundColor: "#D3D3E0" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFFE8",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 7,
    paddingRight: 6,
    gap: 8,
  },
  rowBody: { flex: 1, paddingVertical: 7, gap: 3 },
  rowBadge: { position: "absolute", left: 3, top: 4 },
  empty: { fontSize: 12, color: "#868399", paddingVertical: 15 },
  disclaimer: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    color: "#8E829B",
    marginTop: 8,
  },
  rowArrow: {
    width: 24,

    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#151B4255",
  },
  sheet: {
    maxHeight: "82%",
  
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  
    backgroundColor: "#FFFAFE",
  
    overflow: "hidden",
  },
  sheetHeader: {
    height: 48,
  
    flexDirection: "row",
    alignItems: "center",
  
    paddingLeft: 16,
    paddingRight: 8,
  
    borderBottomWidth: 1,
    borderBottomColor: "#EEE8F0",
  
    backgroundColor: "#FFFAFE",
  },
  
  sheetTitle: {
    flex: 1,
  
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  
    color: "#122453",
  },
  
  sheetClose: {
    width: 40,
    height: 40,
  
    alignItems: "center",
    justifyContent: "center",
  },
  
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 10,
  },
  detailButtonFeatured: {
    alignSelf: "center",

    minWidth: 118,
    minHeight: 36,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,

    paddingHorizontal: 16,
    paddingVertical: 7,

    backgroundColor: theme.buttons.secondaryBackground,
    borderRadius: 18,
  },
  donateButton: {
    minHeight: 36,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 6,

    paddingHorizontal: 13,
    paddingVertical: 8,

    backgroundColor: theme.buttons.secondaryBackground,

    borderRadius: 18,
  },

  donateButtonText: {
    fontSize: 11,
    lineHeight: 16,

    fontWeight: "700",

    color: theme.buttons.primaryText,
  },
});

