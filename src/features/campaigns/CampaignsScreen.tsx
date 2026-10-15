import { PageHeader } from "../../components/PageHeader";
import { useCallback, useRef, useState, type ComponentProps } from "react";
import {
  AppState,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { ActionBackground, Button, Chip } from "../../components/ui";
import { theme } from "../../theme/tokens";
import type { Campaign } from "./data";
import { applyFilters, emptyFilters, options, type Filters } from "./filters";
import {
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";

import { useFonts } from "expo-font";

type IconName = ComponentProps<typeof Ionicons>["name"];
const photos: Record<string, number> = {
  "mam-xanh": require("../../../assets/campaigns/garden.webp"),
  "trang-sach": require("../../../assets/campaigns/books.webp"),
  "bua-com": require("../../../assets/campaigns/meals.webp"),
  "bien-xanh": require("../../../assets/campaigns/community.webp"),
};
const shortTitles: Record<string, string> = {
  "mam-xanh": "Gieo mầm xanh",
  "trang-sach": "Một trang sách",
  "bua-com": "Gửi một bữa cơm",
  "bien-xanh": "Làm sạch bờ biển",
};
const categoryStyles: Record<
  string,
  { icon: IconName; color: string; background: string }
> = {
  "Môi trường": {
    icon: "leaf-outline",
    color: "#267637",
    background: "#D8F6D3",
  },
  "Giáo dục": {
    icon: "school-outline",
    color: "#395CCC",
    background: "#E7EDFF",
  },
  "Cộng đồng": { icon: "people", color: "#BB3595", background: "#FCE4F4" },
  "Khẩn cấp": {
    icon: "heart-outline",
    color: "#B54864",
    background: "#FFE9EE",
  },
};
const fields: { key: keyof typeof options; label: string; all: string }[] = [
  { key: "city", label: "Tỉnh / thành", all: "Tất cả địa phương" },
  { key: "category", label: "Lĩnh vực", all: "Tất cả lĩnh vực" },
  { key: "resource", label: "Loại nguồn lực", all: "Tất cả nguồn lực" },
  { key: "skill", label: "Kỹ năng", all: "Mọi kỹ năng" },
  { key: "format", label: "Hình thức", all: "Mọi hình thức" },
  { key: "status", label: "Trạng thái", all: "Mọi trạng thái" },
];
function CampaignCard({
  item,
  small = false,
}: {
  item: Campaign;
  small?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  const badge = categoryStyles[item.category] ?? categoryStyles["Cộng đồng"];
  const full = item.registered >= item.capacity;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        "Xem " + item.title + (full ? ", đã đủ số lượng" : "")
      }
      onPress={() =>
        router.push({ pathname: "/campaigns/[id]", params: { id: item.id } })
      }
      style={({ pressed }) => [s.card, pressed && { opacity: 1 }]}
    >
{({ pressed }) => <>
<View style={[s.photoFrame, small && s.smallPhotoFrame]}>
        <Image
          source={photos[item.id]}
          resizeMode="cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </View>
      <View style={s.cardBody}>
        {/* TÊN CHIẾN DỊCH */}
        <Text
          numberOfLines={2}
          style={[
            s.cardTitle,
            small && s.smallTitle,
            { minHeight: (small ? 16 : 18) * 2 * fontScale },
          ]}
        >
          {shortTitles[item.id] || item.title}
        </Text>

        {/* DANH MỤC / HASHTAG */}
        <View style={[s.categoryBadge, { backgroundColor: badge.background }]}>
          <Ionicons name={badge.icon} size={12} color={badge.color} />

          <Text style={[s.categoryLabel, { color: badge.color }]}>
            {item.category}
          </Text>
        </View>
        <Text
          numberOfLines={2}
          style={[s.description, { minHeight: 36 * fontScale }]}
        >
          {item.description}
        </Text>
        <View style={s.metaRow}>
          <Ionicons name="calendar-outline" size={14} color="#5C6A80" />
          <Text style={[s.meta, { minHeight: 16 * fontScale }]}>
            {item.dateLabel}
          </Text>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="time-outline" size={14} color="#5C6A80" />
          <Text style={[s.meta, { minHeight: 16 * fontScale }]}>
            {item.timeLabel}
          </Text>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="location" size={14} color="#5C6A80" />
          <Text
            numberOfLines={2}
            style={[s.meta, { minHeight: 30 * fontScale }]}
          >
            {item.location}
            {", "}
            {item.city}
          </Text>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="people" size={16} color="#5C6A80" />
          <Text style={s.capacity}>
            {item.registered}/{item.capacity}
            <Text style={s.meta}>{" tình nguyện viên"}</Text>
          </Text>
        </View>
        {small ? (
          <View style={s.progress}>
            <LinearGradient
              colors={["#BF2D96", "#E66FB5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: "100%",
                borderRadius: 5,
                width: `${Math.min(100, (item.registered / item.capacity) * 100)}%`,
              }}
            />
          </View>
        ) : (
          <View style={s.detailButton}>
            <ActionBackground pressed={pressed} radius={18} /><Text style={s.detailText}>Xem chi tiết</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.buttons.primaryText} />
          </View>
        )}
        <Text
          accessibilityElementsHidden={!full}
          importantForAccessibility={full ? "auto" : "no-hide-descendants"}
          style={[s.fullLabel, { minHeight: 14 * fontScale }]}
        >
          {full ? "Đã đủ số lượng" : " "}
        </Text>
      </View>
</>}
</Pressable>
  );
}
export default function CampaignsScreen() {
  const [fontsLoaded] = useFonts({
    Lora_600SemiBold,
    Lora_700Bold,
  });
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters });
  const [draft, setDraft] = useState<Filters>({ ...emptyFilters });
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<keyof typeof options | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [localCity, setLocalCity] = useState("TP. Hồ Chí Minh");
  const [cityPicker, setCityPicker] = useState(false);
  const [slide, setSlide] = useState(0);
  const reducedMotion = useReducedMotion();
  const [autoPlay, setAutoPlay] = useState(false);
  const pauseUntil = useRef(0);
  const direction = useRef(1);
  const offset = useRef(0);
  const touching = useRef(false);
  
  const pauseInteraction = () => {
    pauseUntil.current = Date.now() + 7000;
  };
  const carouselRef = useRef<ScrollView>(null);
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 350 || fontScale > 1.3;
  
  const viewportWidth = Math.min(width, 680) - 32;

  const cardWidth = Math.min(240, viewportWidth * (singleColumn ? 0.82 : 0.59));

  const results = applyFilters(filters);
  const nearby = results.filter(
    (item) => item.city === (filters.city || localCity),
  );
  // Keep featured records first, then show other discovery cards as in the reference.
  const highlights = [...results].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );
  const activeCount = Object.values(filters).filter(Boolean).length;
  const currentSlide = Math.min(slide, Math.max(0, highlights.length - 1));
  const carouselKey = JSON.stringify(filters) + ":" + cardWidth;
  const highlightCount = highlights.length;
  const maxOffset = Math.max(
    0,
    highlightCount * (cardWidth + 10) - 10 - viewportWidth,
  );
  useFocusEffect(
    useCallback(() => {
      if (
        !autoPlay ||
        reducedMotion ||
        showAll ||
        open ||
        cityPicker ||
        maxOffset <= 0
      )
        return;
      let frame = 0;
      let last = 0;
      const tick = (now: number) => {
        const dt = last ? Math.min(now - last, 50) / 1000 : 0;
        last = now;
        if (
          AppState.currentState === "active" &&
          !touching.current &&
          Date.now() >= pauseUntil.current
        ) {
          offset.current = Math.max(
            0,
            Math.min(maxOffset, offset.current + direction.current * 40 * dt),
          );
          if (offset.current >= maxOffset) direction.current = -1;
          if (offset.current <= 0) direction.current = 1;
          carouselRef.current?.scrollTo({ x: offset.current, animated: false });
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [autoPlay, reducedMotion, showAll, open, cityPicker, maxOffset]),
  );
  
  const startFilter = () => {
    setDraft({ ...filters });
    setExpanded(null);
    setOpen(true);
  };
  const clearFilters = () => {
    setFilters({ ...emptyFilters });
    setSlide(0);
  };
  const grid = (items: Campaign[]) => (
    <View style={s.grid}>
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            width: cardWidth,
          }}
        >
          <CampaignCard item={item} />
        </View>
      ))}
    </View>
  );
  return (
    <LinearGradient colors={theme.gradients.page} style={s.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={s.fill}>
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title="CHIẾN DỊCH NOI"
            subtitle="Góp một chút sức, lan tỏa yêu thương"
            brand={
              <View style={s.brand}>
                <Text style={s.logo}>
                  <Text style={{ color: "#BC3F9D" }}>N</Text>
                  <Text style={{ color: "#8A5BD0" }}>O</Text>
                  <Text style={{ color: "#4875DA" }}>I</Text>
                </Text>
                <Text style={s.brandCaption}>Cùng nhau lan tỏa</Text>
              </View>
            }
          />
          <View style={s.searchRow}>
            <View style={s.search}>
              <Ionicons name="search-outline" size={23} color="#18295F" />
              <TextInput
                accessibilityLabel="Tìm chiến dịch"
                placeholder="Tìm chiến dịch…"
                placeholderTextColor="#5C6A80"
                value={filters.query}
                onChangeText={(query) => {
                  setFilters({ ...filters, query });
                  setSlide(0);
                }}
                style={s.searchInput}
              />
              {filters.query ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Xóa từ khóa"
                  onPress={() => {
                    setFilters({ ...filters, query: "" });
                    setSlide(0);
                  }}
                  style={s.clear}
                >
                  <Ionicons name="close-circle" size={18} color="#8C82A3" />
                </Pressable>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Mở bộ lọc, ${activeCount} tiêu chí đang chọn`}
              onPress={startFilter}
              style={s.filterButton}
            >
              <Ionicons name="options-outline" size={25} color="#172761" />
              {activeCount > 0 && <Text style={s.count}>{activeCount}</Text>}
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chips}
          >
            {["", ...options.category].map((category) => {
              const selected = filters.category === category;
              const badge = categoryStyles[category];
              return (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setFilters({ ...filters, category });
                    setSlide(0);
                  }}
                  style={[
                    s.categoryChip,
                    selected && { backgroundColor: theme.buttons.secondaryBackground },
                  ]}
                >
                  {badge && (
                    <Ionicons
                      name={badge.icon}
                      size={18}
                      color={selected ? theme.buttons.text : badge.color}
                    />
                  )}
                  <Text style={[s.chipText, selected && { color: theme.buttons.text }]}>
                    {category || "Tất cả"}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={s.section}>
            <Text accessibilityRole="header" style={s.sectionTitle}>
              {showAll ? "Tất cả chiến dịch" : "Chiến dịch nổi bật"}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setShowAll(!showAll);
                setSlide(0);
              }}
              style={s.more}
            >
              <Text style={s.moreText}>
                {showAll ? "Thu gọn" : "Xem tất cả"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#BB3195" />
            </Pressable>
          </View>
          {activeCount > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={clearFilters}
              style={s.reset}
            >
              <Text style={s.moreText}>
                {results.length} kết quả · Xóa bộ lọc
              </Text>
            </Pressable>
          )}
          {results.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="search-outline" size={28} color="#A784BA" />
              <Text style={s.note}>
                Chưa có chiến dịch phù hợp. Thử tiêu chí khác nhé.
              </Text>
              <Button title="Xóa bộ lọc" onPress={clearFilters} />
            </View>
          ) : showAll ? (
            grid(results)
          ) : (
            <>
              <ScrollView
                key={carouselKey}
                onLayout={() => {
                  offset.current = 0;
                  direction.current = 1;
                  setSlide(0);
                  carouselRef.current?.scrollTo({ x: 0, animated: false });
                }}
                ref={carouselRef}
                horizontal
                onTouchStart={() => {
                  touching.current = true;
                  pauseInteraction();
                }}
                onTouchEnd={() => {
                  touching.current = false;
                  pauseInteraction();
                }}
                onTouchCancel={() => {
                  touching.current = false;
                  pauseInteraction();
                }}
                onScrollBeginDrag={pauseInteraction}
                onMomentumScrollEnd={pauseInteraction}
                snapToInterval={cardWidth + 10}
                style={s.carouselViewport}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const x = event.nativeEvent.contentOffset.x;
                  if (touching.current || Date.now() < pauseUntil.current)
                    offset.current = Math.max(0, Math.min(maxOffset, x));
                  setSlide(
                    Math.min(
                      highlights.length - 1,
                      Math.round(x / (cardWidth + 10)),
                    ),
                  );
                }}
                scrollEventThrottle={16}
                contentContainerStyle={s.carousel}
              >
                {highlights.map((item) => (
                  <View key={item.id} style={{ width: cardWidth }}>
                    <CampaignCard item={item} />
                  </View>
                ))}
              </ScrollView>
              <View style={s.dots}>
                {!reducedMotion && highlights.length > 1 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      autoPlay
                        ? "Tạm dừng tự chuyển chiến dịch"
                        : "Bật tự chuyển chiến dịch"
                    }
                    onPress={() => setAutoPlay(!autoPlay)}
                    style={s.dotHit}
                  >
                    <Ionicons
                      name={autoPlay ? "pause" : "play"}
                      size={15}
                      color="#BB3195"
                    />
                  </Pressable>
                )}
                {highlights
                  .slice(0, Math.ceil(maxOffset / (cardWidth + 10)) + 1)
                  .map((item, index) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Đến chiến dịch ${index + 1}`}
                      accessibilityState={{ selected: index === currentSlide }}
                      onPress={() => {
                        pauseInteraction();
                        carouselRef.current?.scrollTo({
                          x: Math.min(maxOffset, index * (cardWidth + 10)),
                          animated: !reducedMotion,
                        });
                        setSlide(index);
                      }}
                      style={s.dotHit}
                    >
                      <View
                        style={[s.dot, index === currentSlide && s.dotActive]}
                      />
                    </Pressable>
                  ))}
              </View>
            </>
          )}
          <View style={[s.section, { flexWrap: "wrap" }]}>
            <Text accessibilityRole="header" style={s.sectionTitle}>
              Gần bạn
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chọn địa phương"
              onPress={() => setCityPicker(true)}
              style={s.cityButton}
            >
              <Ionicons name="location" size={16} color="#4C7AEB" />
              <Text style={s.cityText}>{filters.city || localCity}</Text>
              <Ionicons name="chevron-down" size={15} color="#5C6A80" />
            </Pressable>
          </View>
          {nearby.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + 10}
              decelerationRate="fast"
              contentContainerStyle={{
                gap: 10,
                paddingRight: 0,
              }}
            >
              {nearby.map((item) => (
                <View key={item.id} style={{ width: cardWidth }}>
                  <CampaignCard item={item} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={s.empty}>
              <Text style={s.note}>
                Chưa có hoạt động phù hợp tại địa phương này.
              </Text>
              <Button
                title="Chọn địa phương khác"
                onPress={() => setCityPicker(true)}
              />
            </View>
          )}
          <LinearGradient
            colors={["#F9CDEA", "#F3E6FF", "#E4DDFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.banner}
          >
            <View style={s.bannerArt}>
              <Ionicons name="heart" size={38} color="#EE6DA9" />
              <Ionicons
                name="hand-left-outline"
                size={25}
                color="#CE7CAE"
                style={{ marginTop: -9, transform: [{ rotate: "-25deg" }] }}
              />
            </View>
            <Text style={s.bannerText}>
              Những điều tốt đẹp{"\n"}cùng nhau lan lên
            </Text>
            <Ionicons
              accessible={false}
              name="heart-outline"
              size={20}
              color="#C44B9E"
            />
          </LinearGradient>
        </ScrollView>
        <Modal
          visible={cityPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setCityPicker(false)}
        >
          <View style={s.overlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              accessibilityRole="button"
              accessibilityLabel="Đóng chọn địa phương"
              onPress={() => setCityPicker(false)}
            />
            <SafeAreaView edges={["bottom"]} style={s.sheet}>
              <View style={s.section}>
                <Text style={s.sheetTitle}>Chọn địa phương</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Đóng"
                  style={s.more}
                  onPress={() => setCityPicker(false)}
                >
                  <Ionicons name="close" size={23} color="#18295F" />
                </Pressable>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {options.city.map((city) => (
                  <Pressable
                    key={city}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: city === (filters.city || localCity),
                    }}
                    onPress={() => {
                      setLocalCity(city);
                      setFilters({ ...filters, city: "" });
                      setSlide(0);
                      setCityPicker(false);
                    }}
                    style={s.cityOption}
                  >
                    <Text style={s.cityText}>{city}</Text>
                    {city === (filters.city || localCity) && (
                      <Ionicons name="checkmark" size={20} color="#BB3195" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={s.overlay}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng bộ lọc, bỏ thay đổi chưa áp dụng"
              onPress={() => setOpen(false)}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView
              edges={["bottom"]}
              style={s.sheet}
              accessibilityViewIsModal
            >
              <View style={s.handle} />
              <View style={s.section}>
                <Text accessibilityRole="header" style={s.sheetTitle}>
                  Bộ lọc
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setDraft({ ...emptyFilters });
                    setExpanded(null);
                  }}
                  style={s.more}
                >
                  <Text style={s.moreText}>↻ Đặt lại</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Đóng bộ lọc"
                  onPress={() => setOpen(false)}
                  style={s.more}
                >
                  <Ionicons name="close" size={22} color={theme.colors.text} />
                </Pressable>
              </View>
              <Text style={s.note}>
                Tùy chỉnh tiêu chí để tìm chiến dịch phù hợp với bạn
              </Text>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={s.form}
              >
                <Text style={s.fieldLabel}>Từ khóa</Text>
                <TextInput
                  accessibilityLabel="Từ khóa bộ lọc"
                  placeholder="Tên chiến dịch, tổ chức, địa điểm"
                  value={draft.query}
                  onChangeText={(query) => setDraft({ ...draft, query })}
                  style={s.input}
                />
                {fields.map((field) => (
                  <View key={field.key}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: expanded === field.key }}
                      onPress={() =>
                        setExpanded(expanded === field.key ? null : field.key)
                      }
                      style={s.field}
                    >
                      <Text style={s.fieldLabel}>{field.label}</Text>
                      <View style={s.select}>
                        <Text style={s.selectText}>
                          {draft[field.key] || field.all}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={17}
                          color="#8A50DB"
                        />
                      </View>
                    </Pressable>
                    {expanded === field.key && (
                      <View style={s.choices}>
                        {["", ...options[field.key]].map((value) => (
                          <Chip
                            key={value}
                            label={value || field.all}
                            selected={draft[field.key] === value}
                            onPress={() => {
                              setDraft({ ...draft, [field.key]: value });
                              setExpanded(null);
                            }}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
              <Button
                title={`Áp dụng bộ lọc · ${applyFilters(draft).length} kết quả`}
                onPress={() => {
                  setFilters({ ...draft });
                  setOpen(false);
                  setShowAll(true);
                }}
              />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  header: {
    paddingTop: 14,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brand: { width: 62, transform: [{ rotate: "-6deg" }] },
  logo: { fontSize: 32, fontWeight: "900", letterSpacing: -2 },
  brandCaption: {
    fontSize: 8,
    lineHeight: 11,
    color: "#5C6A80",
    fontStyle: "italic",
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 23, lineHeight: 30, fontWeight: "900", color: "#8F2F78" },
  subtitle: { fontSize: 11, lineHeight: 17, color: "#5C6A80", marginTop: 3 },
  headerHeart: {
    position: "absolute",
    right: 0,
    top: 3,
    opacity: 0.4,
    transform: [{ rotate: "18deg" }],
  },
  searchRow: { flexDirection: "row", gap: 8 },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFFE8",
    borderRadius: 24,
    paddingHorizontal: 13,
  },
  searchInput: { flex: 1, minHeight: 46, fontSize: 14, color: "#22304A" },
  clear: {
    minHeight: 44,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    width: 48,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.buttons.secondaryBackground,
    borderRadius: 22,
  },
  count: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#BB3195",
    color: "white",
    fontSize: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  chips: { gap: 7, paddingVertical: 12 },
  categoryChip: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFFD9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 24,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: "#22304A" },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    color: "#8F2F78",
    flexShrink: 1,
  },
  more: {
    minHeight: 44,
    paddingHorizontal: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  moreText: { fontSize: 12, fontWeight: "600", color: theme.buttons.text },
  reset: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  carouselViewport: { flexGrow: 0, flexShrink: 0 },
  carousel: { gap: 10, alignItems: "stretch" },
  card: {
    flexGrow: 1,
    backgroundColor: "#FFFFFFE8",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  photoFrame: {
    backgroundColor: "#F0EAF6",
    width: "100%",
    aspectRatio: 1.5,
    overflow: "hidden",
    flexShrink: 0,
  },
  smallPhotoFrame: { aspectRatio: 1.6 },
  cardBody: {
    padding: 8,
    gap: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 12,
    marginTop: -17,

    borderWidth: 0,
    borderColor: "#FFFFFF",
  },

  categoryLabel: {
    fontSize: 9,
    fontWeight: "700",
    flexShrink: 1,
  },

  cardTitle: {
    fontFamily: "Lora_700Bold",
    fontSize: 16,
    lineHeight: 18,
    color: "#22304A",

    width: "100%",
  },
  smallTitle: {
    fontFamily: "Lora_700Bold",
    fontSize: 12,
    lineHeight: 17,
  },

  description: {
    fontSize: 11,
    lineHeight: 16,
    color: "#5C6A80",
  },

  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 5 },

  meta: {
    fontSize: 10,
    lineHeight: 15,
    color: "#5C6A80",
    flexShrink: 1,
  },

  capacity: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#22304A",
    flexShrink: 1,
  },
  progress: {
    height: 6,
    borderRadius: 5,
    backgroundColor: "#ECEAF8",
    marginTop: 2,
  },
  detailButton: {
    marginTop: 3,
    backgroundColor: theme.buttons.secondaryBackground,
    borderRadius: 18,

    height: 36,
    paddingHorizontal: 10,

    gap: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  detailText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: theme.buttons.primaryText,
  },
  fullLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: "#93718A",
    textAlign: "center",
    width: "100%",
    fontWeight: "600",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dotHit: {
    minWidth: 30,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: "#DCD5EE" },
  dotActive: { backgroundColor: "#BB3195", width: 9, height: 9 },
  cityButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFFDE",
    borderWidth: 1,
    borderColor: "#E3E3F8",
    borderRadius: 22,
    paddingHorizontal: 10,
  },
  cityText: { fontSize: 11, color: "#22304A", flexShrink: 1 },
  cityOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE5F5",
  },
  banner: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerArt: { alignItems: "center", width: 46 },
  bannerText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
    fontStyle: "italic",
    fontWeight: "600",
    color: "#8F2F78",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 9,
    lineHeight: 14,
    color: "#817597",
    textAlign: "center",
    paddingTop: 8,
  },
  note: { fontSize: 12, lineHeight: 18, color: "#6F6C87" },
  empty: {
    padding: 18,
    backgroundColor: "#FFFFFFD9",
    gap: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#211A365E",
  },
  sheet: {
    backgroundColor: "#FCF9FF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "88%",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  handle: {
    height: 4,
    width: 38,
    borderRadius: 4,
    backgroundColor: "#CECEE0",
    alignSelf: "center",
    marginTop: 10,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
  },
  form: { paddingVertical: 14, gap: 12 },
  field: { flexDirection: "row", alignItems: "center", gap: 10 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text,
    flexShrink: 1,
  },
  select: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E7DEFC",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 5,
  },
  selectText: { flex: 1, fontSize: 12, color: theme.colors.text },
  input: {
    borderWidth: 1,
    borderColor: "#E7DEFC",
    borderRadius: 12,
    padding: 12,
    minHeight: 44,
    color: theme.colors.text,
    fontSize: 13,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 8 },
});

