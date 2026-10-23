import { ActionBackground as BrandActionBackground , ActionBackground } from '../../components/ui';
import { theme as buttonTheme , theme } from '../../theme/tokens';
import { useAssistant, useAssistantContext } from '../assistant/Assistant';


import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { campaignData, type CampaignDetail } from "./campaignData";

type IconName = ComponentProps<typeof Ionicons>["name"];
type TabKey = "intro" | "updates" | "transparent" | "donors";

const PINK = "#E957AE";
const NAVY = "#122453";
const TEXT = "#22304A";
const MUTED = "#66718D";
const BORDER = "#E8EAF0";
const LIGHT = "#F7F8FB";

const photos = {
  meal: require("../../../assets/campaigns/meals.webp"),
  community: require("../../../assets/campaigns/community.webp"),
  garden: require("../../../assets/campaigns/garden.webp"),
  books: require("../../../assets/campaigns/books.webp"),
};

export default function ContributionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log("ID từ URL:", id);
  console.log("Campaign:", campaignData[id ?? ""]);
  const [tab, setTab] = useState<TabKey>("intro");
  const assistant = useAssistant();
  useAssistantContext("Chi tiết đóng góp", { section: tab });
  const [liked, setLiked] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const campaign = campaignData[id as keyof typeof campaignData];

  if (!campaign) {
    return (
      <SafeAreaView style={s.safe}>
        <Text>Không tìm thấy chiến dịch.</Text>
      </SafeAreaView>
    );
  }

  const percent = Math.min(
    100,
    Math.round((campaign.raised / campaign.target) * 100),
  );

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          style={s.headerButton}
        >
          <Ionicons name="chevron-back" size={25} color={NAVY} />
        </Pressable>

        <Text numberOfLines={1} style={s.headerTitle}>
          {campaign.title}
        </Text>

        <View style={s.headerActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setLiked(!liked)}
            style={s.headerButton}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={23}
              color={PINK}
            />
          </Pressable>

          <Pressable style={s.headerButton}>
            <Ionicons name="share-outline" size={23} color={NAVY} />
          </Pressable>
        </View>
      </View>

      {/* NỘI DUNG */}
      {/* NỘI DUNG */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <CampaignSummary campaign={campaign} percent={percent} />

        <Tabs
          active={tab}
          donors={campaign.donors}
          onChange={(nextTab) => {
            setTab(nextTab);

            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({
                y: 0,
                animated: false,
              });
            });
          }}
        />

        {tab === "intro" && <Introduction campaign={campaign} />}

        {tab === "updates" && <Updates campaign={campaign} />}

        {tab === "transparent" && <Transparency campaign={campaign} />}

        {tab === "donors" && <Donors campaign={campaign} />}
      </ScrollView>

      {/* CTA CỐ ĐỊNH */}
      <View style={s.bottomBar} onLayout={event => assistant.setBottomInset(event.nativeEvent.layout.height)}>
        <Pressable
          style={(state) => [(({ pressed }) => [
            s.donateButton,
            pressed && { opacity: 1 },
          ])(state), { overflow: 'hidden', borderColor: 'transparent' }]}
          onPress={() => {
            // Bước sau sẽ mở DonationPanel ở đây.
            router.push(`/contributions/donate/${campaign.id}`);
          }}
        >
{({ pressed }) => <>
<ActionBackground pressed={pressed} radius={8} />
          <Text style={[s.donateButtonText, { color: buttonTheme.buttons.primaryText }]}>Đóng góp ngay</Text>
</>}
</Pressable>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   PHẦN ĐẦU CHIẾN DỊCH
========================================================= */

function CampaignSummary({
  campaign,
  percent,
}: {
  campaign: {
    title: string;
    subtitle: string;
    image: number;
    raised: number;
    target: number;
    donors: number;
    daysLeft: number;
    followers: number;
  };
  percent: number;
}) {
  return (
    <>
      <View style={s.hero}>
        <Image source={campaign.image} style={s.heroImage} resizeMode="cover" />

        <View style={s.photoCount}>
          <Text style={s.photoCountText}>1/6</Text>
        </View>
      </View>

      <View style={s.summary}>
        <Text style={s.title}>{campaign.title}</Text>
        <Text style={s.subtitle}>{campaign.subtitle}</Text>

        {/* TỔ CHỨC */}
        <View style={s.organization}>
          <View style={s.organizationLogo}>
            <Text style={s.logoN}>N</Text>
            <Text style={s.logoO}>O</Text>
            <Text style={s.logoI}>I</Text>
          </View>

          <View style={s.organizationCopy}>
            <View style={s.organizationNameRow}>
              <Text numberOfLines={1} style={s.organizationName}>
                NOI – Cùng nhau lan tỏa
              </Text>

              <Ionicons name="checkmark-circle" size={15} color="#347CD5" />
            </View>

            <Text style={s.organizationType}>Đơn vị tổ chức</Text>
          </View>

          <Pressable style={[s.followButton, { overflow: 'hidden', borderColor: 'transparent' }]}><BrandActionBackground radius={0} disabled={false} />
            <Text style={[s.followText, { color: buttonTheme.buttons.primaryText }]}>Theo dõi</Text>
          </Pressable>
        </View>

        {/* SỐ TIỀN */}
        <View style={s.moneyRow}>
          <View style={s.moneyCopy}>
            <Text style={s.raised}>{money(campaign.raised)}</Text>

            <Text style={s.target}>
              {" / "}
              {money(campaign.target)}
            </Text>
          </View>

          <Text style={s.percent}>{percent}%</Text>
        </View>

        {/* PROGRESS */}
        <View style={s.progressTrack}>
          <View
            style={[
              s.progressFill,
              {
                width: `${percent}%`,
              },
            ]}
          />
        </View>

        {/* THỐNG KÊ */}
        <View style={s.stats}>
          <Stat
            icon="people-outline"
            value={campaign.donors.toString()}
            label="lượt đóng góp"
          />

          <View style={s.statDivider} />

          <Stat
            icon="time-outline"
            value={`Còn ${campaign.daysLeft} ngày`}
            label="Kết thúc gây quỹ"
          />

          <View style={s.statDivider} />

          <Stat
            icon="heart-outline"
            value={campaign.followers.toLocaleString("vi-VN")}
            label="người quan tâm"
          />
        </View>
      </View>
    </>
  );
}

/* =========================================================
   TABS
========================================================= */

function Tabs({
  active,
  donors,
  onChange,
}: {
  active: TabKey;
  donors: number;
  onChange: (value: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "intro", label: "Giới thiệu" },
    { key: "updates", label: "Cập nhật (12)" },
    { key: "transparent", label: "Minh bạch" },
    { key: "donors", label: `Nhà hảo tâm (${donors})` },
  ];

  return (
    <View style={s.tabs}>
      {tabs.map((item) => {
        const selected = item.key === active;

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={s.tab}
          >
            <Text
              numberOfLines={1}
              style={[s.tabText, selected && s.tabTextActive]}
            >
              {item.label}
            </Text>

            {selected && <View style={s.tabIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

/* =========================================================
   TAB GIỚI THIỆU
========================================================= */

function Introduction({ campaign }: { campaign: CampaignDetail }) {
  return (
    <View style={s.tabContent}>
      <SectionTitle>Về chiến dịch</SectionTitle>

      <Text style={s.paragraph}>{campaign.subtitle}</Text>

      <Pressable style={[s.readMoreButton, { overflow: 'hidden', backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }]}>
        <Text style={[s.readMore, { color: "#E54698" }]}>Xem thêm</Text>

        <Ionicons name="chevron-forward" size={14} color={"#E54698"} />
      </Pressable>

      <View style={s.infoGrid}>
        <InfoItem
          icon="people-outline"
          title="Đối tượng hỗ trợ"
          value={campaign.beneficiary}
        />

        <InfoItem
          icon="location-outline"
          title="Khu vực hỗ trợ"
          value={campaign.location}
        />

        <InfoItem
          icon="calendar-outline"
          title="Thời gian"
          value={campaign.duration}
        />

        <InfoItem
          icon="restaurant-outline"
          title="Hình thức hỗ trợ"
          value={campaign.supportType}
        />
      </View>

      <View style={s.separator} />

      {/* CÂU CHUYỆN */}
      <SectionTitle>Câu chuyện chiến dịch</SectionTitle>

      <Text style={s.paragraph}>{campaign.story}</Text>

      {/* GALLERY */}
      <View style={s.sectionDivider} />
      <SectionTitle>Hình ảnh và video thực tế</SectionTitle>

      <Gallery items={campaign.gallery} />

      <View style={s.separator} />

      {/* MỤC TIÊU */}
      <SectionTitle>Mục tiêu chiến dịch</SectionTitle>

      <Text style={s.paragraph}>{campaign.goalDescription}</Text>

      <View style={s.goalRow}>
        {campaign.goalStats.map((item, index) => (
          <Goal
            key={index}
            icon={item.icon}
            value={item.value}
            label={item.label}
          />
        ))}
      </View>
    </View>
  );
}

/* =========================================================
   GALLERY
========================================================= */

/* =========================================================
   GALLERY
========================================================= */

function Gallery({ items }: { items: MediaItem[] }) {
  const { width } = useWindowDimensions();

  const [galleryVisible, setGalleryVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const horizontalPadding = 32;
  const gap = 6;

  // Chiều rộng thực tế của vùng nội dung
  const contentWidth = Math.min(width, 680) - horizontalPadding;

  // Chỉ hiển thị tối đa 3 ảnh preview
  const previewItems = items.slice(0, 3);

  // Mỗi hàng luôn tối đa 3 ảnh
  const columns = Math.max(1, previewItems.length);
  const itemWidth = (contentWidth - gap * (columns - 1)) / columns;

  // ========================================================
  // MỞ MEDIA VIEWER
  // ========================================================

  const openViewer = (index: number) => {
    // Không có ảnh/video thì không mở
    if (!items[index]) {
      return;
    }

    setSelectedIndex(index);
    setViewerVisible(true);
  };

  // ========================================================
  // KHÔNG CÓ ẢNH / VIDEO
  // ========================================================

  if (items.length === 0) {
    return (
      <View
        style={{
          paddingVertical: 22,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="images-outline" size={30} color="#A0A8B8" />

        <Text
          style={{
            marginTop: 8,
            fontSize: 13,
            lineHeight: 19,
            color: "#748097",
            textAlign: "center",
          }}
        >
          Chưa có hình ảnh hoặc video cập nhật.
        </Text>
      </View>
    );
  }

  // ========================================================
  // CÓ ẢNH / VIDEO
  // ========================================================

  return (
    <>
      {/* NÚT XEM TẤT CẢ */}
      <Pressable onPress={() => setGalleryVisible(true)} style={[s.viewAllButton, { overflow: 'hidden', borderColor: 'transparent' }]}><BrandActionBackground radius={0} disabled={false} />
        <Text style={[s.viewAll, { color: buttonTheme.buttons.primaryText }]}>Xem tất cả {items.length} ảnh & video</Text>

        <Ionicons name="chevron-forward" size={12} color={buttonTheme.buttons.primaryText} />
      </Pressable>

      {/* DANH SÁCH ẢNH / VIDEO */}
      <View style={s.gallery}>
        {previewItems.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => index === 2 && items.length > 3 ? setGalleryVisible(true) : openViewer(index)}
            style={[
              s.galleryItem,
              {
                width: itemWidth,
                height: itemWidth * 0.78,
              },
            ]}
          >
            <Image
              source={item.source}
              style={s.absoluteImage}
              resizeMode="cover"
            />

            {/* VIDEO */}
            {item.type === "video" && (
              <>
                <View style={s.imageShade} />

                <View style={s.playButton}>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </View>

                {item.duration && (
                  <Text style={s.duration}>{item.duration}</Text>
                )}
              </>
            )}

            {/* ẢNH CUỐI */}
            {index === 2 && items.length > 3 && (
              <View style={s.galleryCount}>
                <Text style={s.galleryCountText}>+{items.length - 3}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Modal visible={galleryVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setGalleryVisible(false)}>
        <SafeAreaProvider>
          <SafeAreaView style={s.updateGalleryScreen}>
            <View style={s.updateGalleryHeader}>
              <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={s.updateGalleryBack} onPress={() => setGalleryVisible(false)}>
                <Ionicons name="chevron-back" size={26} color={NAVY} />
              </Pressable>
              <View style={s.updateGalleryHeaderCenter}>
                <Text numberOfLines={1} style={s.updateGalleryTitle}>Hình ảnh và video thực tế</Text>
                <Text style={s.updateGalleryCount}>{items.length} ảnh & video</Text>
              </View>
              <View style={s.updateGalleryBack} />
            </View>
            <ScrollView contentContainerStyle={s.updateGalleryContent}>
              <View style={s.updateGalleryGrid}>
                {items.map((item, index) => (
                  <Pressable key={index} accessibilityRole="button" accessibilityLabel={'Xem ảnh hoặc video ' + (index + 1)} style={s.updateGalleryGridItem} onPress={() => openViewer(index)}>
                    <Image source={item.source} resizeMode="cover" style={s.updateGalleryGridImage} />
                    {item.type === 'video' && <View style={s.playButton}><Ionicons name="play" size={16} color="#FFFFFF" /></View>}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {galleryVisible && items[selectedIndex] && <MediaViewer visible={viewerVisible} items={items} index={selectedIndex} onIndexChange={setSelectedIndex} onClose={() => setViewerVisible(false)} />}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      {/* MEDIA VIEWER */}
      {!galleryVisible && items[selectedIndex] && (
        <MediaViewer
          visible={viewerVisible}
          items={items}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={() => setViewerVisible(false)}
        />
      )}
    </>
  );
}

type MediaItem = {
  type: "image" | "video";
  source: number;
  duration?: string;
};

function MediaViewer({
  visible,
  items,
  index,
  onIndexChange,
  onClose,
}: {
  visible: boolean;
  items: MediaItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  if (!item) {
    return null;
  }

  const previous = () => {
    onIndexChange(index === 0 ? items.length - 1 : index - 1);
  };

  const next = () => {
    onIndexChange(index === items.length - 1 ? 0 : index + 1);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
      <SafeAreaView style={s.viewer}>
        <View style={s.viewerHeader}>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng ảnh" onPress={onClose} hitSlop={12} style={s.viewerButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>

          <Text style={s.viewerCounter}>
            {index + 1}/{items.length}
          </Text>

          <View style={s.viewerButton} />
        </View>

        <View style={s.viewerBody}>
          <Image
            source={item.source}
            resizeMode="contain"
            style={s.viewerImage}
          />

          {item.type === "video" && (
            <Pressable style={s.viewerPlay}>
              <Ionicons name="play" size={32} color="#FFFFFF" />
            </Pressable>
          )}

          <Pressable
            onPress={previous}
            style={[s.viewerArrow, s.viewerArrowLeft]}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </Pressable>

          <Pressable onPress={next} style={[s.viewerArrow, s.viewerArrowRight]}>
            <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={s.viewerType}>
          {item.type === "video"
            ? `Video${item.duration ? ` · ${item.duration}` : ""}`
            : "Hình ảnh thực tế"}
        </Text>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
/* =========================================================
   TAB CẬP NHẬT
========================================================= */

/* =========================================================
   TAB CẬP NHẬT
========================================================= */

function Updates({ campaign }: { campaign: CampaignDetail }) {
  console.log("CAMPAIGN:", campaign.id, campaign.title);

  console.log("UPDATES:", campaign.updates);

  const updates = campaign.updates ?? [];

  // Chưa có cập nhật
  if (updates.length === 0) {
    return (
      <View style={s.tabContent}>
        <View
          style={{
            paddingVertical: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="newspaper-outline" size={32} color="#A0A8B8" />

          <Text
            style={{
              marginTop: 10,
              fontSize: 13,
              lineHeight: 19,
              color: MUTED,
              textAlign: "center",
            }}
          >
            Chiến dịch chưa có cập nhật mới.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.tabContent}>
      {updates.map((item, index) => (
        <TimelinePost
          key={`${campaign.id}-update-${index}`}
          date={item.date}
          title={item.title}
          text={item.text}
          images={item.images ?? []}
          likes={item.likes ?? 0}
          comments={item.comments ?? 0}
          last={index === updates.length - 1}
        />
      ))}
    </View>
  );
}

function TimelinePost({
  date,
  title,
  text,
  images,
  likes,
  comments,
  last = false,
}: {
  date: string;
  title: string;
  text: string;
  images: number[];
  likes: number;
  comments: number;
  last?: boolean;
}) {
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const viewerItems: MediaItem[] = images.map((source) => ({
    type: "image",
    source,
  }));

  const openGallery = () => {
    if (images.length === 0) return;

    setGalleryVisible(true);
  };

  const openImage = (index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  };
  return (
    <View style={s.timelineRow}>
      <View style={s.timelineRail}>
        <View style={s.timelineDot}>
          <View style={s.timelineDotInner} />
        </View>

        {!last && <View style={s.timelineLine} />}
      </View>

      <View style={s.timelineContent}>
        <Text style={s.timelineDate}>{date}</Text>

        <Text style={s.timelineTitle}>{title}</Text>

        <Text style={s.paragraph}>{text}</Text>

        {images.length > 0 && (
          <>
            {/* 3 ẢNH XEM TRƯỚC */}
            <View style={s.updateGallery}>
              {images.slice(0, 3).map((source, index) => {
                const showMore = index === 2 && images.length > 3;
                const remaining = images.length - 3;

                return (
                  <Pressable
                    key={index}
                    style={s.updateImageWrap}
                    onPress={() => {
                      if (showMore) {
                        openGallery();
                      } else {
                        openImage(index);
                      }
                    }}
                  >
                    <Image
                      source={source}
                      resizeMode="cover"
                      style={s.updatePreviewImage}
                    />

                    {showMore && (
                      <>
                        <View style={s.updateImageOverlay} />

                        <View style={s.updateMoreCenter}>
                          <Text style={s.updateMore}>+{remaining}</Text>
                        </View>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* XEM TẤT CẢ */}
            <Pressable style={[s.updateViewAll, { overflow: 'hidden', backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }]} onPress={openGallery}>
              <Ionicons name="images-outline" size={16} color={"#E54698"} />

              <Text style={[s.updateViewAllText, { color: "#E54698" }]}>
                Xem tất cả {images.length} ảnh
              </Text>

              <Ionicons name="chevron-forward" size={14} color={"#E54698"} />
            </Pressable>
          </>
        )}
        <View style={s.socialRow}>
  <View style={s.socialItem}>
    <Ionicons
      name="heart-outline"
      size={21}
      color={PINK}
    />
    <Text style={s.socialText}>{likes}</Text>
  </View>

  <View style={s.socialItem}>
    <Ionicons
      name="chatbubble-outline"
      size={19}
      color={NAVY}
    />
    <Text style={s.socialText}>{comments}</Text>
  </View>

  <View
    style={[
      s.socialItem,
      { marginLeft: "auto" },
    ]}
  >
    <Ionicons
      name="share-outline"
      size={20}
      color={NAVY}
    />
    <Text style={s.socialText}>Chia sẻ</Text>
  </View>
</View>

{/* ==========================================
    THƯ VIỆN ẢNH CẬP NHẬT
========================================== */}
<Modal
  visible={galleryVisible}
  animationType="slide"
  presentationStyle="fullScreen"
  statusBarTranslucent={false}
  onRequestClose={() => setGalleryVisible(false)}
>
  <SafeAreaProvider>
  <SafeAreaView
    style={s.updateGalleryScreen}
    edges={["top", "left", "right", "bottom"]}
  >
    {/* HEADER - DÙNG ĐÚNG CHUẨN CỦA MINH BẠCH */}
    <View style={s.updateGalleryHeader}>
      <Pressable
        style={s.updateGalleryBack}
        hitSlop={12}
        onPress={() => setGalleryVisible(false)}
      >
        <Ionicons
          name="chevron-back"
          size={26}
          color={NAVY}
        />
      </Pressable>

      <View style={s.updateGalleryHeaderCenter}>
        <Text style={s.updateGalleryTitle}
        numberOfLines={1}>
          Hình ảnh cập nhật
        </Text>

        <Text style={s.updateGalleryCount}>
          {images.length} ảnh
        </Text>
      </View>
      
      {/* Cân bằng với nút quay lại bên trái */}
      <View pointerEvents="none" style={s.updateGalleryBack} />
    </View>

    {/* LƯỚI ẢNH - GIỐNG MINH BẠCH */}
    <ScrollView
      contentContainerStyle={s.updateGalleryContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.updateGalleryGrid}>
        {images.map((source, index) => (
          <Pressable
            key={index}
            style={s.updateGalleryGridItem}
            onPress={() => openImage(index)}
          >
            <Image
              source={source}
              resizeMode="cover"
              style={s.updateGalleryGridImage}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>

    {viewerItems.length > 0 && (
      <MediaViewer
        visible={viewerVisible}
        items={viewerItems}
        index={selectedIndex}
        onIndexChange={setSelectedIndex}
        onClose={() => setViewerVisible(false)}
      />
    )}
  </SafeAreaView>
  </SafeAreaProvider>
</Modal>

</View>
</View>
);
}

/* =========================================================
   TAB MINH BẠCH
========================================================= */

/* =========================================================
   TAB MINH BẠCH
========================================================= */

function Transparency({ campaign }: { campaign: CampaignDetail }) {
  const reports = campaign.transparency ?? [];

  // Tổng tiền đã nhận chính là số tiền chiến dịch đã gây quỹ
  const received = campaign.raised;

  // Tổng số tiền đã sử dụng
  const used = reports.reduce((total, item) => {
    return total + (item.amountValue ?? 0);
  }, 0);

  // % tiền đã sử dụng
  const usedPercent =
    received > 0 ? Math.min(100, Math.round((used / received) * 100)) : 0;

  return (
    <View style={s.tabContent}>
      {/* =====================================================
          TỔNG QUAN SỬ DỤNG QUỸ
      ===================================================== */}

      <SectionTitle>Tổng quan sử dụng quỹ</SectionTitle>

      <View style={s.fundCards}>
        {/* ĐÃ NHẬN */}
        <View style={s.fundCard}>
          <Text style={s.fundLabel}>Đã nhận</Text>

          <Text style={s.fundReceived}>{money(received)}</Text>
        </View>

        {/* ĐÃ SỬ DỤNG */}
        <View style={s.fundCard}>
          <Text style={s.fundLabel}>Đã sử dụng</Text>

          <Text style={s.fundUsed}>{money(used)}</Text>
        </View>
      </View>

      {/* THANH TIẾN ĐỘ SỬ DỤNG QUỸ */}
      <View style={s.fundProgressRow}>
        <View style={s.fundProgress}>
          <View
            style={[
              s.fundProgressFill,
              {
                width: `${usedPercent}%`,
              },
            ]}
          />
        </View>

        <Text style={s.fundPercent}>{usedPercent}%</Text>
      </View>

      <View style={s.separator} />

      {/* =====================================================
          BÁO CÁO SỬ DỤNG QUỸ
      ===================================================== */}

      <SectionTitle>Báo cáo sử dụng quỹ</SectionTitle>

      {reports.length === 0 ? (
        <View
          style={{
            paddingVertical: 24,
            alignItems: "center",
          }}
        >
          <Ionicons name="document-text-outline" size={30} color="#A0A8B8" />

          <Text
            style={{
              marginTop: 9,
              fontSize: 13,
              color: MUTED,
              textAlign: "center",
            }}
          >
            Chưa có báo cáo sử dụng quỹ.
          </Text>
        </View>
      ) : (
        reports.map((item, index) => (
          <FundReport
            key={`${campaign.id}-report-${index}`}
            phase={item.phase}
            title={item.title}
            amount={item.amount}
            date={item.date}
            receipts={item.receipts ?? []}
            actualImages={item.actualImages ?? []}
            last={index === reports.length - 1}
          />
        ))
      )}
    </View>
  );
}

function FundReport({
  phase,
  title,
  amount,
  date,
  receipts,
  actualImages,
  last = false,
}: {
  phase: string;
  title: string;
  amount: string;
  date: string;
  receipts: number[];
  actualImages: number[];
  last?: boolean;
}) {
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryImages, setGalleryImages] = useState<number[]>([]);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Mở thư viện
  const openGallery = (title: string, images: number[]) => {
    if (images.length === 0) return;

    setGalleryTitle(title);
    setGalleryImages(images);
    setGalleryVisible(true);
  };

  // Mở một ảnh trong thư viện
  const openImage = (index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  };

  const viewerItems: MediaItem[] = galleryImages.map((source) => ({
    type: "image",
    source,
  }));

  return (
    <View style={[s.report, last && s.reportLast]}>
      {/* THÔNG TIN BÁO CÁO */}
      <View style={s.reportTitleRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.reportTitle}>{title}</Text>
          <Text style={s.reportDate}>{date}</Text>
        </View>

        <Text style={s.reportAmount}>{amount}</Text>
      </View>
      {/* 2 TÍNH NĂNG */}
      <View style={s.evidenceRow}>
        {/* HÓA ĐƠN */}
        <Pressable
          style={s.evidenceCard}
          onPress={() => openGallery("Hóa đơn, chứng từ", receipts)}
        >
          <View style={s.evidenceIconBlue}>
            <Ionicons name="receipt-outline" size={20} color="#347CD5" />
          </View>

          <Text style={s.evidenceTitle}>Hóa đơn, chứng từ</Text>

          <View style={s.evidenceBottom}>
            <Text style={s.evidenceCount}>{receipts.length} tài liệu</Text>

            <Ionicons name="chevron-forward" size={15} color={MUTED} />
          </View>
        </Pressable>

        {/* HÌNH ẢNH THỰC TẾ */}
        <Pressable
          style={s.evidenceCard}
          onPress={() => openGallery("Hình ảnh thực tế", actualImages)}
        >
          <View style={s.evidenceIconPink}>
            <Ionicons name="images-outline" size={20} color={PINK} />
          </View>

          <Text style={s.evidenceTitle}>Hình ảnh thực tế</Text>

          <View style={s.evidenceBottom}>
            <Text style={s.evidenceCount}>{actualImages.length} hình ảnh</Text>

            <Ionicons name="chevron-forward" size={15} color={MUTED} />
          </View>
        </Pressable>
      </View>
      {/* TRANG THƯ VIỆN */}
      {/* TRANG THƯ VIỆN */}
<Modal
  visible={galleryVisible}
  animationType="slide"
  presentationStyle="fullScreen"
  statusBarTranslucent={false}
  onRequestClose={() => setGalleryVisible(false)}
>
  <SafeAreaProvider>
  <SafeAreaView
    style={s.updateGalleryScreen}
    edges={["top", "left", "right", "bottom"]}
  >
    {/* HEADER */}
    <View style={s.updateGalleryHeader}>
      <Pressable
        style={s.updateGalleryBack}
        hitSlop={12}
        onPress={() => setGalleryVisible(false)}
      >
        <Ionicons
          name="chevron-back"
          size={26}
          color={NAVY}
        />
      </Pressable>

      <View style={s.updateGalleryHeaderCenter}>
        <Text style={s.updateGalleryTitle}>
          {galleryTitle}
        </Text>

        <Text style={s.updateGalleryCount}>
          {galleryImages.length} ảnh
        </Text>
      </View>

      {/* Cân bằng với nút quay lại */}
      <View style={s.updateGalleryBack} />
    </View>

    {/* LƯỚI ẢNH */}
    <ScrollView
      contentContainerStyle={s.updateGalleryContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.updateGalleryGrid}>
        {galleryImages.map((source, index) => (
          <Pressable
            key={index}
            style={s.updateGalleryGridItem}
            onPress={() => openImage(index)}
          >
            <Image
              source={source}
              resizeMode="cover"
              style={s.updateGalleryGridImage}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>

    {/* XEM ẢNH TOÀN MÀN HÌNH */}
    {viewerItems.length > 0 && (
      <MediaViewer
        visible={viewerVisible}
        items={viewerItems}
        index={selectedIndex}
        onIndexChange={setSelectedIndex}
        onClose={() => setViewerVisible(false)}
      />
    )}
  </SafeAreaView>
  </SafeAreaProvider>
</Modal>
    </View>
  );
}

function DocumentRow({ title }: { title: string }) {
  return (
    <Pressable style={s.documentRow}>
      <Ionicons name="document-text-outline" size={21} color="#526583" />

      <Text style={s.documentTitle}>{title}</Text>

      <Ionicons name="chevron-forward" size={17} color="#9AA3B2" />
    </Pressable>
  );
}

/* =========================================================
   NHÀ HẢO TÂM
========================================================= */

/* =========================================================
   NHÀ HẢO TÂM
========================================================= */

function Donors({ campaign }: { campaign: CampaignDetail }) {
  const donors = campaign.donorList ?? [];

  return (
    <View style={s.tabContent}>
      {/* TIÊU ĐỀ */}
      <View style={s.donorHeading}>
        <View>
          <SectionTitle>Nhà hảo tâm</SectionTitle>

          <Text style={s.donorSubtitle}>
            {campaign.donors.toLocaleString("vi-VN")} người đã đồng hành cùng
            chiến dịch
          </Text>
        </View>
      </View>

      {/* CHƯA CÓ DANH SÁCH */}
      {donors.length === 0 ? (
        <View
          style={{
            paddingVertical: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="people-outline" size={32} color="#A0A8B8" />

          <Text
            style={{
              marginTop: 9,
              fontSize: 13,
              lineHeight: 19,
              color: MUTED,
              textAlign: "center",
            }}
          >
            Chưa có thông tin nhà hảo tâm được hiển thị.
          </Text>
        </View>
      ) : (
        donors.map((item, index) => (
          <View key={`${campaign.id}-donor-${index}`} style={s.donor}>
            {/* AVATAR */}
            <View style={s.avatar}>
              <Ionicons name="person" size={20} color="#77829A" />
            </View>

            {/* THÔNG TIN */}
            <View style={s.donorCopy}>
              <View style={s.donorTop}>
                <Text numberOfLines={1} style={s.donorName}>
                  {item.name}
                </Text>

                <Text style={s.donorAmount}>{item.amount}</Text>
              </View>

              <Text style={s.donorTime}>{item.time}</Text>

              {!!item.message && (
                <Text style={s.donorMessage}>{item.message}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

/* =========================================================
   COMPONENT NHỎ
========================================================= */

function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) {
  return (
    <View style={s.stat}>
      <Ionicons name={icon} size={19} color={NAVY} />

      <View style={s.statCopy}>
        <Text numberOfLines={1} style={s.statValue}>
          {value}
        </Text>

        <Text numberOfLines={2} style={s.statLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function InfoItem({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
  value: string;
}) {
  return (
    <View style={s.infoItem}>
      <Ionicons name={icon} size={19} color="#526583" />

      <View style={s.infoCopy}>
        <Text style={s.infoTitle}>{title}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Goal({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) {
  return (
    <View style={s.goal}>
      <Ionicons name={icon} size={22} color={PINK} />

      <Text style={s.goalValue}>{value}</Text>
      <Text style={s.goalLabel}>{label}</Text>
    </View>
  );
}

function money(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

/* =========================================================
   STYLE
========================================================= */

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingHorizontal: 6,
    backgroundColor: "#FFFFFF",
  },

  headerButton: {
    width: 42,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: NAVY,
  },

  headerActions: {
    width: 84,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  scrollContent: {
    paddingBottom: 75,
  },

  hero: {
    width: "100%",
    aspectRatio: 1.72,
    backgroundColor: "#ECEFF3",
    position: "relative",
    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  photoCount: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#111827CC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  summary: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },

  title: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    color: NAVY,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
  },

  organization: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  organizationLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#DDE3ED",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },

  logoN: {
    fontSize: 11,
    fontWeight: "900",
    color: PINK,
  },

  logoO: {
    fontSize: 11,
    fontWeight: "900",
    color: "#7852C5",
  },

  logoI: {
    fontSize: 11,
    fontWeight: "900",
    color: "#347CD5",
  },

  organizationCopy: {
    flex: 1,
    minWidth: 0,
  },

  organizationNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  organizationName: {
    maxWidth: "88%",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: NAVY,
  },

  organizationType: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 15,
    color: MUTED,
  },

  followButton: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.buttons.border,
  },

  followText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.buttons.text,
  },

  moneyRow: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "baseline",
  },

  moneyCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
  },

  raised: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    color: PINK,
  },

  target: {
    fontSize: 12,
    color: MUTED,
  },

  percent: {
    fontSize: 18,
    fontWeight: "900",
    color: PINK,
  },

  progressTrack: {
    marginTop: 8,
    height: 7,
    backgroundColor: "#E9EBF1",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: PINK,
    borderRadius: 10,
  },

  stats: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "stretch",
  },

  stat: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
    minWidth: 0,
  },

  statCopy: {
    flex: 1,
    minWidth: 0,
  },

  statValue: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    color: NAVY,
  },

  statLabel: {
    marginTop: 1,
    fontSize: 9,
    lineHeight: 13,
    color: MUTED,
  },

  statDivider: {
    width: 1,
    marginHorizontal: 8,
    backgroundColor: BORDER,
  },

  tabs: {
    minHeight: 49,
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
  },

  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 2,
  },

  tabText: {
    fontSize: 10,
    lineHeight: 14,
    color: "#59657B",
    textAlign: "center",
  },

  tabTextActive: {
    color: PINK,
    fontWeight: "800",
  },

  tabIndicator: {
    position: "absolute",
    height: 2,
    left: 8,
    right: 8,
    bottom: 0,
    borderRadius: 2,
    backgroundColor: PINK,
  },

  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 6,
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 21,

    color: MUTED,
    textAlign: "justify",
    justifyContent: "flex-start",
  },

  readMoreButton: {
    marginTop: 3,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  readMore: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#347CD5",
  },

  infoGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
  },

  infoItem: {
    width: "50%",
    minHeight: 67,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },

  infoCopy: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: NAVY,
  },

  infoValue: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: MUTED,
  },

  separator: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 18,
  },

  galleryHeading: {
    marginTop: 14,
  },

  viewAllButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
    marginBottom: 9,
  },

  viewAll: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
    color: "#347CD5",
  },

  gallery: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },

  galleryItem: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F2F3F5",
    position: "relative",
  },

  galleryCount: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000055",
  },

  galleryCountText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  imageShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00000055",
  },

  playButton: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000055",
  },

  duration: {
    position: "absolute",
    right: 5,
    bottom: 4,
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  morePhotos: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
    width: "100%",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  goalRow: {
    marginTop: 13,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
  },

  goal: {
    flex: 1,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 7,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },

  goalValue: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
  },

  goalLabel: {
    marginTop: 1,
    fontSize: 8.5,
    lineHeight: 12,
    color: MUTED,
    textAlign: "center",
  },

  timelineRow: {
    flexDirection: "row",
  },

  timelineRail: {
    width: 24,
    alignItems: "center",
  },

  timelineDot: {
    marginTop: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
  },

  timelineDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },

  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: "#E3E5EB",
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 7,
    paddingBottom: 22,
  },

  timelineDate: {
    fontSize: 10,
    lineHeight: 14,
    color: MUTED,
  },

  timelineTitle: {
    marginTop: 2,
    marginBottom: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: NAVY,
  },

  updateGallery: {
    marginTop: 10,
    flexDirection: "row",
    gap: 6,
  },

  updateImageWrap: {
    flex: 1,
    height: 82,
    borderRadius: 7,
    overflow: "hidden",
    backgroundColor: "#F2F3F5",
    position: "relative",
  },

  updatePreviewImage: {
    width: "100%",
    height: "100%",
  },

  updateImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  updateMoreCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  updateMore: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  updateViewAll: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingVertical: 4,
  },

  updateViewAllText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "#347CD5",
  },

  updateGalleryScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  
  updateGalleryHeader: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  
    // Header luôn nằm trong vùng an toàn
    position: "relative",
    zIndex: 20,
    elevation: 4,
  },
  
  updateGalleryBack: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    elevation: 5,
  },
  
  updateGalleryHeaderCenter: {
    flex: 1,
    minWidth: 0,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  
  updateGalleryTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
  },
  
  updateGalleryCount: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 13,
    color: MUTED,
    textAlign: "center",
  },

  updateGalleryContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 30,
  },

  updateGalleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  
  updateGalleryGridItem: {
    width: "49%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F2F3F5",
  },
  
  updateGalleryGridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#F2F3F5",
  },

  socialRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },

  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  socialText: {
    fontSize: 10,
    color: MUTED,
  },

  // =========================================================
  // MINH BẠCH
  // =========================================================

  fundCards: {
    flexDirection: "row",
    gap: 10,
  },

  fundCard: {
    flex: 1,
    padding: 13,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
  },

  fundLabel: {
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },

  fundReceived: {
    marginTop: 5,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    color: NAVY,
  },

  fundUsed: {
    marginTop: 5,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    color: PINK,
  },

  fundProgressRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  fundProgress: {
    flex: 1,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#E9EBF1",
    overflow: "hidden",
  },

  fundProgressFill: {
    height: "100%",
    backgroundColor: PINK,
    borderRadius: 10,
  },

  fundPercent: {
    fontSize: 14,
    fontWeight: "900",
    color: PINK,
  },

  // ======================
  // BÁO CÁO SỬ DỤNG QUỸ
  // ======================

  report: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  reportLast: {
    borderBottomWidth: 0,
  },
  reportTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  reportTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    color: NAVY,
  },

  reportAmount: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
    color: PINK,
  },

  reportDate: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },

  reportActions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  reportMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  reportMetaText: {
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },

  reportLink: {
    marginLeft: "auto",
  },

  reportLinkText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    color: "#347CD5",
  },

  documentRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  documentTitle: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#4E5A70",
  },

  donorHeading: {
    marginBottom: 4,
  },

  donorSubtitle: {
    marginTop: -3,
    fontSize: 10,
    color: MUTED,
  },

  donor: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F6",
    alignItems: "center",
    justifyContent: "center",
  },

  donorCopy: {
    flex: 1,
  },

  donorTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  donorName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
  },

  donorAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: PINK,
  },

  donorTime: {
    marginTop: 2,
    fontSize: 9,
    color: "#9098A7",
  },

  donorMessage: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: "#5C6678",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 14,

    backgroundColor: "#FFFFFFFA",

    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  donateButton: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.buttons.secondaryBackground,
  },

  donateButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.buttons.primaryText,
  },
  viewer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  viewerHeader: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    zIndex: 100,
    elevation: 10,
    backgroundColor: "#000000",
  },

  viewerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 101,
    elevation: 11,
  },

  viewerCounter: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  viewerBody: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },

  viewerImage: {
    width: "100%",
    height: "100%",
  },

  viewerPlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 58,
    height: 58,
    marginLeft: -29,
    marginTop: -29,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000099",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  viewerArrow: {
    position: "absolute",
    top: "50%",
    width: 44,
    height: 52,
    marginTop: -26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000055",
  },

  viewerArrowLeft: {
    left: 0,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },

  viewerArrowRight: {
    right: 0,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },

  viewerType: {
    minHeight: 44,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 12,
  },
  absoluteImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E6E8EC",
    marginTop: 14,
    marginBottom: 14,
  },
  // =========================================================
  // NHÀ HẢO TÂM
  // =========================================================
  evidenceRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  evidenceCard: {
    flex: 1,
    minHeight: 105,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    backgroundColor: "#FFFFFF",
  },

  evidenceIconBlue: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4FF",
  },

  evidenceIconPink: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCEAF6",
  },

  evidenceTitle: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: NAVY,
  },

  evidenceBottom: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  evidenceCount: {
    fontSize: 10,
    lineHeight: 14,
    color: MUTED,
  },
  galleryScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  galleryHeader: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },

  galleryBackButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  galleryHeaderCenter: {
    flex: 1,
    alignItems: "center",
  },

  galleryHeaderTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    color: NAVY,
  },

  galleryHeaderCount: {
    marginTop: 1,
    fontSize: 10,
    color: MUTED,
  },

  galleryHeaderSpace: {
    width: 44,
  },

  galleryContent: {
    padding: 3,
  },

  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#F2F3F5",
  },
});

