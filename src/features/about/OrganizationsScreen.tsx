import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";

/* =========================================================
   ẢNH
   Nếu project của bạn có đường dẫn khác,
   chỉ cần sửa 3 dòng require này.
========================================================= */

const images = {
  environment: require("../../../assets/campaigns/community.webp"),
  education: require("../../../assets/campaigns/books.webp"),
  community: require("../../../assets/campaigns/meals.webp"),
};

/* =========================================================
   TYPES
========================================================= */

type CategoryId =
  | "all"
  | "education"
  | "environment"
  | "community";

type Organization = {
  id: string;
  name: string;
  description: string;
  category: Exclude<CategoryId, "all">;
  campaigns: number;
  image: any;
};

/* =========================================================
   DATA MẪU
========================================================= */

const organizations: Organization[] = [
  {
    id: "mam-xanh",
    name: "Nhóm Mầm Xanh (mẫu)",
    description:
      "Bảo vệ môi trường và phát triển lối sống bền vững.",
    category: "environment",
    campaigns: 2,
    image: images.environment,
  },
  {
    id: "sach-cho-em",
    name: "Nhóm Sách Cho Em (mẫu)",
    description:
      "Hỗ trợ giáo dục và mang cơ hội học tập đến cộng đồng.",
    category: "education",
    campaigns: 1,
    image: images.education,
  },
  {
    id: "bep-chia-se",
    name: "Bếp Chia Sẻ (mẫu)",
    description:
      "Đồng hành và hỗ trợ những hoàn cảnh cần được sẻ chia.",
    category: "community",
    campaigns: 2,
    image: images.community,
  },
];

/* =========================================================
   CATEGORY
========================================================= */

const categories = [
    {
      id: "all" as CategoryId,
      label: "Tất cả",
      icon: null,
    },
    {
      id: "education" as CategoryId,
      label: "Giáo dục",
      icon: "school",
    },
    {
      id: "environment" as CategoryId,
      label: "Môi trường",
      icon: "leaf",
    },
    {
      id: "community" as CategoryId,
      label: "Cộng đồng",
      icon: "people",
    },
  ];

/* =========================================================
   CATEGORY CONFIG
========================================================= */

function getCategoryConfig(
    category: Organization["category"]
  ) {
    switch (category) {
      case "environment":
        return {
          label: "Môi trường",
          icon: "leaf" as const,
  
          color: "#259C69",
          background: "#E9F8EE",
        };
  
      case "education":
        return {
          label: "Giáo dục",
          icon: "school" as const,
  
          color: "#8253C9",
          background: "#F4E7FC",
        };
  
      case "community":
        return {
          label: "Cộng đồng",
          icon: "people" as const,
  
          color: "#D54DA5",
          background: "#FDE7F5",
        };
    }
  }

function getFilterIconColor(id: CategoryId) {
    switch (id) {
      case "education":
        return "#6656B8";
  
      case "environment":
        return "#2FA56F";
  
      case "community":
        return "#6B63B5";
  
      default:
        return "#68738A";
    }
  }

/* =========================================================
   ORGANIZATION CARD
========================================================= */

function OrganizationCard({
  item,
}: {
  item: Organization;
}) {
  const [expanded, setExpanded] = useState(false);

  const category = getCategoryConfig(item.category);

  return (
    <Pressable
      onPress={() => setExpanded((value) => !value)}
      style={({ pressed }) => [
        styles.organizationCard,
        pressed && styles.cardPressed,
      ]}
    >
      {/* đường pastel phía trên */}
      <LinearGradient
        colors={["#F2B3E3", "#B7D1FF"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.cardAccent}
      />

      <View style={styles.cardMain}>
        {/* ẢNH */}
        <Image
          source={item.image}
          style={styles.organizationImage}
          resizeMode="cover"
        />

        {/* NỘI DUNG */}
        <View style={styles.organizationContent}>
          <View style={styles.organizationTitleRow}>
            <Text
              style={styles.organizationName}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            <Ionicons
              name={
                expanded
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color="#6656A5"
            />
          </View>

          <Text
            style={styles.organizationDescription}
            numberOfLines={expanded ? undefined : 2}
          >
            {item.description}
          </Text>

          <View style={styles.organizationBottom}>
            {/* CATEGORY */}
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor:
                    category.background,
                },
              ]}
            >
              <Ionicons
  name={category.icon}
  size={14}
  color={category.color}
/>

              <Text
                style={[
                  styles.categoryBadgeText,
                  {
                    color: category.color,
                  },
                ]}
              >
                {category.label}
              </Text>
            </View>

            {/* SỐ CHIẾN DỊCH */}
            <View style={styles.campaignCount}>
              <Ionicons
                name="stats-chart"
                size={14}
                color="#6869BA"
              />

              <Text style={styles.campaignCountText}>
                {item.campaigns} chiến dịch
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* PHẦN MỞ RỘNG */}
      {expanded && (
        <View style={styles.expandedArea}>
          <View style={styles.expandedLine} />

          <View style={styles.expandedInfo}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color="#66789A"
            />

            <Text style={styles.expandedText}>
              Xem các chiến dịch đang được tổ chức
              triển khai trên NOI.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.detailButtonWrap,
              pressed && {
                opacity: 0.85,
              },
            ]}
          >
            <LinearGradient
              colors={["#F2B3E3", "#B7D1FF"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>
                Xem tổ chức
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#3F467E"
              />
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function OrganizationsScreen() {
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [search, updateSearch] = useState("");
  const setSearch = (value: string) => { updateSearch(value); setPage(0); setShowAll(false); };
  const [selectedCategory, updateCategory] =
    useState<CategoryId>("all");
  const setSelectedCategory = (value: CategoryId) => { updateCategory(value); setPage(0); setShowAll(false); };

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredOrganizations = useMemo(() => {
    const keyword = search
      .trim()
      .toLocaleLowerCase("vi");

    return organizations.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        item.category === selectedCategory;

      const matchesSearch =
        !keyword ||
        item.name
          .toLocaleLowerCase("vi")
          .includes(keyword) ||
        item.description
          .toLocaleLowerCase("vi")
          .includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);
  const pageCount = Math.max(1, Math.ceil(filteredOrganizations.length / 3));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleOrganizations = showAll ? filteredOrganizations : filteredOrganizations.slice(currentPage * 3, currentPage * 3 + 3);


  return (
    <>
      {/* Tắt header mặc định Expo Router */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient
  colors={[
    "#FFF7FC",
    "#F9F8FF",
    "#F4F8FF",
    "#FFF5FB",
  ]}
  style={styles.screen}
>
<SafeAreaView
  style={styles.screen}
  edges={["top", "left", "right"]}
>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [
                styles.backButton,
                pressed && {
                  opacity: 0.55,
                },
              ]}
            >
              <Ionicons
  name="chevron-back"
  size={25}
  color="#122453"
/>
            </Pressable>

            <Text style={styles.headerTitle}>
              Tổ chức
            </Text>

            {/* giữ cân giữa title */}
            <View style={styles.headerPlaceholder} />
          </View>

          {/* =================================================
              HERO
          ================================================= */}

          <View style={styles.hero}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Những đối tác{"\n"}
                <Text style={styles.heroHighlight}>
                  đồng hành{"\n"}cùng NOI
                </Text>
              </Text>
            </View>

            <View style={styles.partnerIcon} accessible accessibilityLabel="Tổ chức đồng hành">
              <LinearGradient colors={['#F8E0F2', '#E0ECFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.partnerIconInner}>
                <Ionicons name="business-outline" size={35} color="#7260B4" />
              </LinearGradient>
            </View>
          </View>

          {/* =================================================
              SEARCH
          ================================================= */}

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={24}
              color="#6756A6"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm tên tổ chức..."
              placeholderTextColor="#929CAD"
              style={styles.searchInput}
              returnKeyType="search"
            />

            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch("")}
                hitSlop={8}
                style={styles.searchAction}
              >
                <Ionicons
                  name="close-circle"
                  size={21}
                  color="#9A94B5"
                />
              </Pressable>
            ) : (
              <View style={styles.searchAction}>
                <Ionicons
                  name="options-outline"
                  size={22}
                  color="#31519A"
                />
              </View>
            )}
          </View>

          {/* =================================================
              CATEGORY FILTER
          ================================================= */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.categoryRow
            }
          >
            {categories.map((item) => {
              const active =
                selectedCategory === item.id;

              if (active) {
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      setSelectedCategory(item.id)
                    }
                  >
                    <LinearGradient
                      colors={[
                        "#F2B3E3",
                        "#B7D1FF",
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={
                        styles.categoryActive
                      }
                    >
                      {item.icon && (
                        <Ionicons
                          name={item.icon as any}
                          size={16}
                          color="#444683"
                        />
                      )}

                      <Text
                        style={
                          styles.categoryActiveText
                        }
                      >
                        {item.label}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    setSelectedCategory(item.id)
                  }
                  style={({ pressed }) => [
                    styles.categoryButton,
                    pressed && {
                      opacity: 0.7,
                    },
                  ]}
                >
                  {item.icon && (
                    <Ionicons
                      name={item.icon as any}
                      size={16}
                      color="#707B8F"
                    />
                  )}

                  <Text
                    style={styles.categoryText}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Khám phá tổ chức
              </Text>

              <Text
                style={styles.sectionDescription}
              >
                Danh sách từ dữ liệu chiến dịch mẫu
                hiện có.
              </Text>
            </View>

            <Text style={styles.resultCount}>
              {filteredOrganizations.length} kết quả
            </Text>
          </View>

          {/* =================================================
              ORGANIZATION LIST
          ================================================= */}

          {filteredOrganizations.length > 0 ? (
            <View style={styles.organizationList}>
              {visibleOrganizations.map((item) => (
                <OrganizationCard
                  key={item.id}
                  item={item}
                />
              ))}
              <View style={styles.pagination}>
                <Pressable accessibilityRole="button" accessibilityLabel="Trang tổ chức trước" accessibilityState={{ disabled: showAll || currentPage === 0 }} disabled={showAll || currentPage === 0} onPress={() => setPage(currentPage - 1)} style={[styles.pageArrow, (showAll || currentPage === 0) && styles.pageDisabled]}><Ionicons name="arrow-back" size={19} color="#63559D" /></Pressable>
                <Text style={styles.pageLabel}>{showAll ? 'Tất cả' : `${currentPage + 1} / ${pageCount}`}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Trang tổ chức tiếp theo" accessibilityState={{ disabled: showAll || currentPage >= pageCount - 1 }} disabled={showAll || currentPage >= pageCount - 1} onPress={() => setPage(currentPage + 1)} style={[styles.pageArrow, (showAll || currentPage >= pageCount - 1) && styles.pageDisabled]}><Ionicons name="arrow-forward" size={19} color="#63559D" /></Pressable>
              </View>
              {filteredOrganizations.length > 3 && <Pressable accessibilityRole="button" onPress={() => { setShowAll(!showAll); setPage(0); }} style={styles.viewAll}><Text style={styles.pageLabel}>{showAll ? 'Thu gọn' : `Xem tất cả (${filteredOrganizations.length})`}</Text></Pressable>}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={30}
                  color="#8D82BA"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Chưa tìm thấy tổ chức
              </Text>

              <Text style={styles.emptyDescription}>
                Hãy thử tên khác hoặc chọn một lĩnh
                vực khác.
              </Text>

              <Pressable
                onPress={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
              >
                <LinearGradient
                  colors={[
                    "#F2B3E3",
                    "#B7D1FF",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.resetButton}
                >
                  <Text style={styles.resetButtonText}>
                    Xem tất cả
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      </LinearGradient>
    </>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     SCREEN
  ======================================================= */

  screen: {
    flex: 1,
    backgroundColor: "#FAF8FF",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: 28,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  
  backButton: {
    width: 38,
    height: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  
  headerPlaceholder: {
    width: 38,
    height: 38,
  },
  
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    color: "#122453",
  },

  /* =======================================================
     HERO
  ======================================================= */

  partnerIcon: { position: 'absolute', right: 4, top: 12 },
  partnerIconInner: { width: 68, height: 68, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  pageArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pageDisabled: { opacity: 0.3 },
  pageLabel: { fontSize: 12, color: '#63559D' },
  viewAll: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  hero: {
    position: "relative",
  
    minHeight: 100,
  
    marginTop: 6,
    marginBottom: 8,
  },
  
  heroContent: {
    width: "68%",
    zIndex: 2,
  },
  
  heroTitle: {
    fontSize: 29,
    lineHeight: 33,
  
    fontWeight: "800",
  
    letterSpacing: -0.6,
  
    color: "#0F376F",
  },
  
  heroHighlight: {
    color: "#E943A5",
  },
  
  heroDescription: {
    marginTop: 14,
  
    fontSize: 14,
    lineHeight: 21,
  
    fontWeight: "400",
  
    color: "#687891",
  },

  heroArt: {
    position: "absolute",
  
    right: -10,
    top: 18,
  
    width: 135,
    height: 165,
  },
  
  blobBlue: {
    position: "absolute",
  
    right: 0,
    top: 7,
  
    width: 82,
    height: 115,
  
    borderRadius: 50,
  
    backgroundColor: "#DCEAFF",
  
    opacity: 0.75,
  
    transform: [{ rotate: "26deg" }],
  },
  
  blobPink: {
    position: "absolute",
  
    left: 12,
    bottom: 7,
  
    width: 67,
    height: 84,
  
    borderRadius: 40,
  
    backgroundColor: "#F6DDF1",
  
    opacity: 0.85,
  
    transform: [{ rotate: "-28deg" }],
  },
  
  heroHeartCircle: {
    position: "absolute",
  
    right: 29,
    top: 57,
  
    width: 52,
    height: 52,
  
    borderRadius: 26,
  
    backgroundColor: "#FFF4FA",
  
    alignItems: "center",
    justifyContent: "center",
  },
  
  smallHeart: {
    position: "absolute",
    right: 5,
    top: 18,
  },
  
  sparkle: {
    position: "absolute",
    left: 17,
    top: 42,
  },

  /* =======================================================
     SEARCH
  ======================================================= */

  searchBox: {
    height: 52,
  
    borderRadius: 18,
  
    backgroundColor: "#FFFFFF",
  
    flexDirection: "row",
    alignItems: "center",
  
    paddingLeft: 16,
    paddingRight: 7,
  
    borderWidth: 1,
    borderColor: "#E4E1EC",
  
    shadowColor: "#52648C",
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  
    elevation: 1,
  },
  
  searchInput: {
    flex: 1,
    height: "100%",
  
    marginLeft: 9,
  
    fontSize: 14,
  
    color: "#173B70",
  },
  
  searchAction: {
    width: 38,
    height: 38,
  
    borderRadius: 13,
  
    alignItems: "center",
    justifyContent: "center",
  
    backgroundColor: "transparent",
  },

  /* =======================================================
     FILTER
  ======================================================= */

  categoryRow: {
    gap: 8,
    paddingTop: 13,
    paddingBottom: 17,
  },
  
  categoryButton: {
    minHeight: 38,
  
    paddingHorizontal: 13,
  
    borderRadius: 14,
  
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  
    gap: 5,
  
    backgroundColor: "#F0F2F7",
  
    borderWidth: 1,
    borderColor: "#EDF0F5",
  },
  
  categoryActive: {
    minHeight: 38,
  
    paddingHorizontal: 15,
  
    borderRadius: 14,
  
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  
    gap: 5,
  },
  
  categoryText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#707B8F",
  },
  
  categoryActiveText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#343A75",
  },

  /* =======================================================
     SECTION HEADER
  ======================================================= */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  
    marginTop: 2,
    marginBottom: 12,
  },
  
  sectionHeaderText: {
    flex: 1,
    paddingRight: 10,
  },
  
  sectionTitle: {
    fontSize: 18,
    lineHeight: 23,
  
    fontWeight: "800",
  
    color: "#123970",
  },
  
  sectionDescription: {
    marginTop: 4,
  
    fontSize: 11.5,
    lineHeight: 17,
  
    color: "#8B97A9",
  },
  
  resultCount: {
    marginTop: 3,
  
    fontSize: 11.5,
  
    color: "#98A2B1",
  },

  /* =======================================================
     ORGANIZATION LIST
  ======================================================= */

  organizationList: {
    gap: 12,
  },
  
  organizationCard: {
    borderRadius: 20,
  
    backgroundColor: "#FFFFFF",
  
    overflow: "hidden",
  
    borderWidth: 1,
    borderColor: "#E9E5EF",
  
    shadowColor: "#52648C",
    shadowOpacity: 0.04,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  cardAccent: {
    position: "absolute",
  
    left: 0,
    right: 0,
    top: 0,
  
    height: 3,
  
    zIndex: 2,
  },
  
  cardMain: {
    minHeight: 126,
  
    flexDirection: "row",
  
    padding: 11,
    paddingTop: 13,
  },
  
  organizationImage: {
    width: 88,
    height: 100,
  
    borderRadius: 15,
  
    alignSelf: "center",
  
    backgroundColor: "#F0F2F5",
  },
  
  organizationContent: {
    flex: 1,
  
    marginLeft: 12,
  
    paddingTop: 2,
  },
  
  organizationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  
    gap: 5,
  },
  
  organizationName: {
    flex: 1,
  
    fontSize: 15.5,
    lineHeight: 20,
  
    fontWeight: "700",
  
    color: "#123970",
  },
  
  organizationDescription: {
    marginTop: 5,
  
    fontSize: 12.5,
    lineHeight: 18,
  
    fontWeight: "400",
  
    color: "#687891",
  },
  
  organizationBottom: {
    marginTop: "auto",
  
    paddingTop: 7,
  
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  
    gap: 5,
  },

  categoryBadge: {
    minHeight: 29,
  
    paddingHorizontal: 9,
  
    borderRadius: 10,
  
    flexDirection: "row",
    alignItems: "center",
  
    gap: 4,
  },
  
  categoryBadgeText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  
  campaignCount: {
    flexDirection: "row",
    alignItems: "center",
  
    gap: 5,
  },
  
  campaignCountText: {
    fontSize: 11.5,
  
    color: "#66789A",
  },

  /* =======================================================
     EXPANDED CARD
  ======================================================= */

  expandedArea: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  expandedLine: {
    height: 1,

    backgroundColor: "#EEEAF3",

    marginBottom: 12,
  },

  expandedInfo: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 8,

    marginBottom: 12,
  },

  expandedText: {
    flex: 1,

    fontSize: 13,
    lineHeight: 19,

    color: "#718099",
  },

  detailButtonWrap: {
    alignSelf: "flex-start",
  },

  detailButton: {
    minHeight: 40,

    borderRadius: 14,

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  detailButtonText: {
    fontSize: 14,

    fontWeight: "700",

    color: "#3F467E",
  },

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  emptyState: {
    alignItems: "center",

    paddingTop: 35,
    paddingBottom: 45,

    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor: "#F3ECFA",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,

    fontWeight: "800",

    color: "#173B70",
  },

  emptyDescription: {
    marginTop: 7,

    textAlign: "center",

    fontSize: 14,
    lineHeight: 21,

    color: "#7B879A",
  },

  resetButton: {
    minHeight: 42,

    marginTop: 18,

    paddingHorizontal: 22,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",
  },

  resetButtonText: {
    fontSize: 14,

    fontWeight: "700",

    color: "#3F467E",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
});