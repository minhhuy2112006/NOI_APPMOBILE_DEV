import { ActionBackground as BrandActionBackground } from '../../components/ui';
import { theme as buttonTheme , theme } from '../../theme/tokens';
import { saveDemoRegistration, useCampaignRegistration } from './registrationSession';
import { useAssistant, useAssistantContext } from '../assistant/Assistant';
import CampaignTimeline from '../schedule/CampaignTimeline';

import { CampaignRegistration } from "./CampaignRegistration";
import { useState, type ComponentProps } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type DimensionValue,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { campaigns, type Campaign } from "./data";
import {
  campaignDetails,
  participationState,
  type CampaignDetail,
} from "./details";

type Icon = ComponentProps<typeof Ionicons>["name"];
const colors = {
  ink: "#122453",
  muted: "#66718D",
  blue: "#347CD5",
  teal: "#168F89",
  violet: "#7852C5",
  amber: "#BF8128",
  pale: "#F5F6FC",
};
const accents = [colors.blue, colors.teal, colors.violet, colors.amber];
const photos: Record<string, number> = {
  "mam-xanh": require("../../../assets/campaigns/garden.webp"),
  "trang-sach": require("../../../assets/campaigns/books.webp"),
  "bua-com": require("../../../assets/campaigns/meals.webp"),
  "bien-xanh": require("../../../assets/campaigns/community.webp"),
};
const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "tasks", label: "Công việc" },
  { id: "benefits", label: "Quyền lợi" },
  { id: "timeline", label: "Lịch trình" },
  { id: "faq", label: "Câu hỏi thường gặp" },
] as const;
type Tab = (typeof tabs)[number]["id"];
const benefits: { icon: Icon; title: string; text: string }[] = [
  {
    icon: "leaf-outline",
    title: "Trải nghiệm ý nghĩa",
    text: "Góp sức tạo nên những thay đổi tích cực.",
  },
  {
    icon: "people-outline",
    title: "Kết nối bạn mới",
    text: "Đồng hành cùng cộng đồng tình nguyện.",
  },
  {
    icon: "trending-up-outline",
    title: "Rèn luyện kỹ năng",
    text: "Phối hợp nhóm và tổ chức hoạt động.",
  },
  {
    icon: "star-outline",
    title: "Ghi nhận hành trình",
    text: "Lưu lại những trải nghiệm đáng nhớ cùng NOI.",
  },
];

function Section({
  icon,
  title,
  color = colors.blue,
}: {
  icon: Icon;
  title: string;
  color?: string;
}) {
  return (
    <View style={s.section}>
      <Ionicons name={icon} size={23} color={color} />
      <Text accessibilityRole="header" style={s.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}
function InfoRow({
  icon,
  text,
  color,
}: {
  icon: Icon;
  text: string;
  color: string;
}) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={21} color={color} />
      <Text style={s.infoText}>{text}</Text>
    </View>
  );
}
export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const campaign = campaigns.find((item) => item.id === id);
  const detail = campaign ? campaignDetails[campaign.id] : undefined;
  if (!campaign || !detail)
    return (
      <SafeAreaView style={s.empty}>
        <Ionicons name="search-outline" size={38} color={colors.blue} />
        <Text style={s.title}>Không tìm thấy chiến dịch</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/")}
          style={[s.softButton, { overflow: 'hidden', borderColor: 'transparent' }]}
        ><BrandActionBackground radius={0} disabled={false} />
          <Text style={[s.link, { color: buttonTheme.buttons.primaryText }]}>Về danh sách chiến dịch</Text>
        </Pressable>
      </SafeAreaView>
    );
  return <Detail key={campaign.id} campaign={campaign} detail={detail} />;
}

function Detail({
  campaign,
  detail,
}: {
  campaign: Campaign;
  detail: CampaignDetail;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const assistant = useAssistant();
  useAssistantContext("Chiến dịch", { section: tab });
  const [saved, setSaved] = useState(false);
  const joined = useCampaignRegistration(campaign.id);

  const [expanded, setExpanded] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);

  const [preparationExpanded, setPreparationExpanded] = useState(false);

  const [imageOpen, setImageOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 600 && fontScale < 1.3;
  const participation = participationState(
    campaign.registered,
    campaign.capacity,
    joined,
  );
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const share = async () => {
    try {
      await Share.share({
        title: campaign.title,
        message: [
          campaign.title,
          campaign.schedule,
          campaign.location + ", " + campaign.city,
          "Thông tin chiến dịch minh họa trên NOI.",
        ].join("\n"),
      });
    } catch {
      Alert.alert("Chưa thể chia sẻ", "Bạn thử lại sau nhé.");
    }
  };
  const questions = [
    {
      question: "Tôi chưa có kinh nghiệm, có tham gia được không?",
      answer:
        "Bạn có thể bắt đầu với những nhiệm vụ phù hợp. Điều phối viên sẽ hướng dẫn trước hoạt động và hỗ trợ trong quá trình tham gia.",
    },
    { question: "Cần chuẩn bị những gì?", answer: campaign.preparation },
    {
      question: "Chiến dịch diễn ra khi nào, ở đâu?",
      answer:
        campaign.schedule +
        ". " +
        campaign.location +
        ", " +
        campaign.city +
        ". Đây là lịch và địa điểm minh họa.",
    },
    {
      question: "Đăng ký trên app đã giữ chỗ chưa?",
      answer:
        "Hiện đây là bản demo. Thao tác đăng ký chỉ mô phỏng trên màn hình, chưa gửi thông tin đến ban tổ chức và chưa giữ chỗ thực tế.",
    },
    {
      question: "Tôi có thể hủy đăng ký không?",
      answer:
        "Bạn có thể theo dõi đăng ký tại Tài khoản → Đăng ký của tôi.",
    },
    {
      question: "Có hỗ trợ chi phí hoặc giấy chứng nhận không?",
      answer:
        "Các hỗ trợ cụ thể cần được ban tổ chức xác nhận. Giao diện mẫu chưa cam kết chi phí, giấy chứng nhận hoặc điểm thưởng.",
    },
  ];
  const preparationItems = [
    "Nước uống",
    "Mũ hoặc nón",
    "Giày kín mũi",
    "Găng tay (nếu có)",
    "Kem chống nắng",
    "Khăn lau",
    "Áo khoác mỏng",
    "Thuốc cá nhân",
    "Pin dự phòng",
  ];

  const visiblePreparationItems = preparationExpanded
    ? preparationItems
    : preparationItems.slice(0, 5);

  const hiddenPreparationCount =
    preparationItems.length - visiblePreparationItems.length;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.hero}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Xem ảnh chiến dịch"
            onPress={() => setImageOpen(true)}
            style={StyleSheet.absoluteFill}
          >
            <Image
              source={photos[campaign.id]}
              style={s.heroImage}
              resizeMode="cover"
              accessibilityLabel={campaign.title}
            />
          </Pressable>
          <LinearGradient
            pointerEvents="none"
            colors={["#0D1F4938", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.heroToolbar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              onPress={back}
              style={s.iconButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.ink} />
            </Pressable>
            <View style={s.heroActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  saved ? "Bỏ lưu chiến dịch" : "Lưu chiến dịch"
                }
                accessibilityState={{ selected: saved }}
                onPress={() => setSaved(!saved)}
                style={s.iconButton}
              >
                <Ionicons
                  name={saved ? "heart" : "heart-outline"}
                  size={24}
                  color={colors.violet}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chia sẻ chiến dịch"
                onPress={share}
                style={s.iconButton}
              >
                <Ionicons
                  name="share-social-outline"
                  size={23}
                  color={colors.ink}
                />
              </Pressable>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Xem ảnh lớn"
            onPress={() => setImageOpen(true)}
            style={s.photoCount}
          >
            <Ionicons name="images-outline" size={16} color="white" />
            <Text style={s.white}>1/1</Text>
          </Pressable>
        </View>
        <View style={s.sheet}>
          <View style={s.badges}>
            <View style={s.badge}>
              <Text style={s.badgeText}>Tình nguyện viên</Text>
            </View>
            <View
              style={[
                s.badge,
                { backgroundColor: participation.full ? "#FFF2DF" : "#EAF4FF" },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={15}
                color={participation.full ? colors.amber : colors.blue}
              />
              <Text
                style={[
                  s.badgeText,
                  { color: participation.full ? colors.amber : colors.blue },
                ]}
              >
                {participation.full ? "Đủ số lượng" : "Đang tuyển"}
              </Text>
            </View>
          </View>
          <Text accessibilityRole="header" style={s.title}>
            {campaign.title}
          </Text>
          <Text style={s.subtitle}>Cùng NOI lan tỏa những điều tốt đẹp.</Text>
          <Text style={s.organizer}>{campaign.organization}</Text>
          <View style={[s.info, wide && s.infoWide]}>
            <InfoRow
              icon="calendar-outline"
              text={campaign.dateLabel}
              color={colors.blue}
            />
            <InfoRow
              icon="time-outline"
              text={campaign.timeLabel}
              color={colors.violet}
            />
            <InfoRow
              icon="location-outline"
              text={campaign.location + ", " + campaign.city}
              color={colors.teal}
            />
          </View>
          <LinearGradient
            colors={["#F8F2FC", "#F0F7FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.stats, fontScale > 1.3 && s.statsStack]}
          >
            <View style={s.stat}>
              <Ionicons name="people-outline" size={20} color={colors.teal} />
              <Text style={s.statLabel}>Số lượng tuyển</Text>
              <Text style={s.statValue}>{campaign.capacity}</Text>
              <Text style={s.statLabel}>tình nguyện viên</Text>
            </View>
            <View style={s.stat}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.amber}
              />
              <Text style={s.statLabel}>Hạn đăng ký</Text>
              <Text style={s.deadline}>{detail.deadline}</Text>
              <Text style={s.statLabel}>Lịch minh họa</Text>
            </View>
            <View style={s.stat}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color={colors.blue}
              />
              <Text style={s.statLabel}>Đã đăng ký</Text>
              <Text accessibilityLiveRegion="polite" style={s.statValue}>
                {participation.count}/{campaign.capacity}
              </Text>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: campaign.capacity,
                  now: participation.count,
                }}
                style={s.track}
              >
                <LinearGradient
                  colors={["#E957AE", "#7950C6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    s.progress,
                    {
                      width: (participation.progress * 100 +
                        "%") as DimensionValue,
                    },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.tabScroll}
            contentContainerStyle={s.tabBar}
          >
            {tabs.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === item.id }}
                onPress={() => setTab(item.id)}
                style={[s.tab, tab === item.id && s.activeTab]}
              >
                <Text style={[s.tabText, tab === item.id && s.activeTabText]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.tabContent}>
            {tab === "overview" && (
              <>
                <Section
                  icon="document-text-outline"
                  title="Giới thiệu chiến dịch"
                />
                <Text numberOfLines={expanded ? undefined : 3} style={s.body}>
                  {campaign.description}
                  {"\n\n"}Hoạt động do {campaign.organization} điều phối. Mỗi
                  tình nguyện viên sẽ được phân công nhiệm vụ phù hợp và phối
                  hợp cùng nhóm trong suốt chương trình.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => setExpanded(!expanded)}
                  style={[s.readMore, { backgroundColor: "#FFFFFF" }]}
                >
                  <Text style={s.link}>
                    {expanded ? "Thu gọn" : "Xem thêm"}
                  </Text>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.blue}
                  />
                </Pressable>
                <Section
                  icon="people-circle-outline"
                  title="Đối tượng tham gia"
                  color={colors.teal}
                />
                <View style={s.softCard}>
                  <InfoRow
                    icon="person-outline"
                    text="Tình nguyện viên từ 18 tuổi (mẫu)"
                    color={colors.blue}
                  />
                  <InfoRow
                    icon="heart-outline"
                    text={detail.audience}
                    color={colors.teal}
                  />
                  <InfoRow
                    icon="checkmark-circle-outline"
                    text="Có trách nhiệm và phối hợp cùng nhóm."
                    color={colors.violet}
                  />
                </View>

                {/* BẠN CẦN CHUẨN BỊ */}
                <Section
                  icon="bag-handle-outline"
                  title="Bạn cần chuẩn bị những gì?"
                  color={colors.blue}
                />

                <Text style={s.preparationDescription}>
                  Những vật dụng cá nhân cần mang theo để thuận tiện cho hoạt
                  động.
                </Text>

                <View style={s.preparationList}>
                  {visiblePreparationItems.map((item, index) => (
                    <View key={item} style={s.preparationRow}>
                      <View style={s.numberCircle}>
                        <Text style={s.numberText}>{index + 1}</Text>
                      </View>

                      <Text style={s.preparationText}>{item}</Text>
                    </View>
                  ))}
                </View>

                {preparationItems.length > 5 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: preparationExpanded }}
                    onPress={() => setPreparationExpanded(!preparationExpanded)}
                    style={[s.showMorePreparation, { backgroundColor: "#FFFFFF" }]}
                  >
                    <Text style={[s.showMorePreparationText, { color: "#E54698" }]}>
                      {preparationExpanded
                        ? "Thu gọn"
                        : `Xem thêm ${hiddenPreparationCount} mục`}
                    </Text>

                    <Ionicons
                      name={preparationExpanded ? "chevron-up" : "chevron-down"}
                      size={17}
                      color={colors.blue}
                    />
                  </Pressable>
                )}

                <View style={s.sectionDivider} />

                {/* THÔNG TIN CẦN BIẾT */}
                <Section
                  icon="information-circle-outline"
                  title="Thông tin cần biết"
                  color={colors.blue}
                />

                <View style={s.importantInfo}>
  {/* Điểm tập trung */}
  <View style={s.importantInfoRow}>
    <View style={s.importantLabelBox}>
      <View style={s.infoIconCircle}>
        <Ionicons
          name="location-outline"
          size={18}
          color={colors.blue}
        />
      </View>
      
      <Text style={s.importantLabel}>Điểm tập trung</Text>
    </View>

    <View style={s.importantContent}>
      <Text style={s.importantValue}>
        {campaign.location}
      </Text>
      <Text style={s.importantDescription}>
        Có mặt trước 15 phút để điểm danh.
      </Text>
    </View>
  </View>

  {/* Trang phục */}
  <View style={s.importantInfoRow}>
    <View style={s.importantLabelBox}>
      <View style={s.infoIconCircle}>
        <Ionicons
          name="shirt-outline"
          size={18}
          color={colors.blue}
        />
    </View>
      <Text style={s.importantLabel}>Trang phục</Text>
    </View>

    <View style={s.importantContent}>
      <Text style={s.importantValue}>
        Áo sáng màu, quần dài, giày kín mũi.
      </Text>
      <Text style={s.importantDescription}>
        Phù hợp cho hoạt động ngoài trời.
      </Text>
    </View>
  </View>

  {/* Di chuyển */}
  <View style={s.importantInfoRow}>
    <View style={s.importantLabelBox}>
      <View style={s.infoIconCircle}>
        <Ionicons
          name="bus-outline"
          size={18}
          color={colors.blue}
        />
    </View>

      <Text style={s.importantLabel}>Di chuyển</Text>
    </View>

    <View style={s.importantContent}>
      <Text style={s.importantValue}>
        BTC bố trí xe đưa đón từ điểm tập trung.
      </Text>
      <Text style={s.importantDescription}>
        Thông tin chi tiết sẽ được gửi sau khi đăng ký.
      </Text>
    </View>
  </View>

  {/* Ăn uống */}
  <View style={s.importantInfoRow}>
    <View style={s.importantLabelBox}>
      <View style={s.infoIconCircle}>
        <Ionicons
          name="restaurant-outline"
          size={18}
          color={colors.blue}
        />
    </View>

      <Text style={s.importantLabel}>Ăn uống</Text>
    </View>

    <View style={s.importantContent}>
      <Text style={s.importantValue}>
        Có hỗ trợ bữa trưa và nước uống.
      </Text>
      <Text style={s.importantDescription}>
        Bạn có thể mang thêm đồ ăn nhẹ nếu cần.
      </Text>
    </View>
  </View>

  {/* Người phụ trách */}
  <View style={[s.importantInfoRow, s.lastInfoRow]}>
    <View style={s.importantLabelBox}>
      <View style={s.infoIconCircle}>
        <Ionicons
          name="call-outline"
          size={18}
          color={colors.blue}
        />
    </View>

      <Text style={s.importantLabel}>Người phụ trách</Text>
    </View>

    <View style={s.importantContent}>
      <Text style={s.importantValue}>
        - Nguyễn Trường Vỹ: Trưởng ban tự quản
      </Text>
      <Text style={s.importantDescription}>   SDT: 0123 456 789</Text>

      <Text style={s.importantValue}>
        - Lê Thiêm An: Phó ban tự quản
      </Text>
      <Text style={s.importantDescription}>   SDT: 0342 567 890</Text>
    </View>
  </View>
</View>
              </>
            )}
            {tab === "tasks" && (
              <>
                <Section icon="clipboard-outline" title="Bạn sẽ làm gì?" />
                {campaignDetails[campaign.id].tasks.map((task, index) => (
                  <View key={task.title} style={s.taskCard}>
                    <View
                      style={[
                        s.iconHalo,
                        { backgroundColor: accents[index] + "14" },
                      ]}
                    >
                      <Ionicons
                        name={
                          (
                            [
                              "construct-outline",
                              "hand-left-outline",
                              "people-outline",
                              "checkmark-done-outline",
                            ] as const
                          )[index]
                        }
                        size={23}
                        color={accents[index]}
                      />
                    </View>
                    <View style={s.cardCopy}>
                      <Text style={s.itemTitle}>{task.title}</Text>
                      <Text style={s.body}>{task.text}</Text>
                    </View>
                  </View>
                ))}
                <Section
                  icon="checkmark-circle-outline"
                  title="Yêu cầu tham gia"
                  color={colors.teal}
                />
                <View style={s.softCard}>
                  <Text style={s.body}>{detail.audience}</Text>
                  <Text style={s.body}>
                    Đúng giờ, có trách nhiệm và làm theo hướng dẫn của điều phối
                    viên.
                  </Text>
                </View>
                <View style={s.notice}>
                  <Ionicons
                    name="bulb-outline"
                    size={22}
                    color={colors.amber}
                  />
                  <Text style={[s.body, s.cardCopy]}>
                    Chưa có kinh nghiệm? Bạn sẽ được hướng dẫn trước hoạt động.
                  </Text>
                </View>
              </>
            )}
            {tab === "benefits" && (
              <>
                <Section
                  icon="gift-outline"
                  title="Bạn nhận được gì?"
                  color={colors.violet}
                />
                <View style={s.benefitGrid}>
                  {benefits.map((benefit, index) => (
                    <View
                      key={benefit.title}
                      style={[s.benefit, { width: wide ? "48%" : "100%" }]}
                    >
                      <View
                        style={[
                          s.iconHalo,
                          { backgroundColor: accents[index] + "14" },
                        ]}
                      >
                        <Ionicons
                          name={benefit.icon}
                          size={23}
                          color={accents[index]}
                        />
                      </View>
                      <View style={s.cardCopy}>
                        <Text style={s.itemTitle}>{benefit.title}</Text>
                        <Text style={s.body}>{benefit.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <Section
                  icon="shield-checkmark-outline"
                  title="Hỗ trợ trong chương trình"
                  color={colors.teal}
                />
                <View style={s.softCard}>
                  <InfoRow
                    icon="checkmark-circle-outline"
                    text="Hướng dẫn trước hoạt động."
                    color={colors.teal}
                  />
                  <InfoRow
                    icon="checkmark-circle-outline"
                    text="Điều phối viên hỗ trợ và phân công nhiệm vụ."
                    color={colors.blue}
                  />
                </View>
                <View style={s.notice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color={colors.amber}
                  />
                  <Text style={[s.body, s.cardCopy]}>
                    Các hỗ trợ cụ thể cần được ban tổ chức xác nhận trước ngày
                    diễn ra.
                  </Text>
                </View>
              </>
            )}
            {tab === "timeline" && (
              <>
                <Section
                  icon="time-outline"
                  title="Diễn biến chiến dịch"
                  color={colors.violet}
                />
                <View style={s.softCard}>
                  <InfoRow
                    icon="calendar-outline"
                    text={campaign.dateLabel}
                    color={colors.blue}
                  />
                </View>
                <CampaignTimeline campaignId={campaign.id} />
                <View style={s.notice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color={colors.amber}
                  />
                  <Text style={[s.body, s.cardCopy]}>
                    Lịch trình có thể điều chỉnh theo tình hình thực tế.
                  </Text>
                </View>
              </>
            )}
            {tab === "faq" && (
              <>
                <Section
                  icon="chatbubbles-outline"
                  title="Câu hỏi thường gặp"
                  color={colors.teal}
                />
                {questions.map((item, index) => (
                  <View key={item.question} style={s.faqCard}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: faq === index }}
                      onPress={() => setFaq(faq === index ? null : index)}
                      style={s.faqQuestion}
                    >
                      <Ionicons
                        name="help-circle-outline"
                        size={22}
                        color={accents[index % accents.length]}
                      />
                      <Text style={[s.itemTitle, s.cardCopy]}>
                        {item.question}
                      </Text>
                      <Ionicons
                        name={faq === index ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={colors.muted}
                      />
                    </Pressable>
                    {faq === index && (
                      <Text style={s.faqAnswer}>{item.answer}</Text>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <SafeAreaView edges={["bottom"]} style={s.footerSafe} onLayout={event => assistant.setBottomInset(event.nativeEvent.layout.height)}>
        <View style={[s.footer, fontScale > 1.3 && s.statsStack]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
            onPress={() => setSaved(!saved)}
            style={s.save}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={22}
              color={colors.violet}
            />
            <Text style={s.saveLabel}>
              {saved ? "Đã lưu" : "Lưu chiến dịch"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: participation.full || joined }}
            disabled={participation.full || joined}
            onPress={() => setRegistrationOpen(true)}
            style={s.join}
          >
{({ pressed }) => <>
<LinearGradient
              colors={
                participation.full || joined
                  ? theme.buttons.disabledGradient
                  : (pressed ? theme.buttons.pressedGradient : theme.buttons.gradient)
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.joinGradient}
            >
              <Ionicons
                name={
                  joined ? "checkmark-circle-outline" : "person-add-outline"
                }
                size={22}
                color={participation.full || joined ? theme.buttons.disabledText : theme.buttons.primaryText}
              />
              <Text style={[s.joinLabel, (participation.full || joined) && { color: theme.buttons.disabledText }]}>
                {joined
                  ? "Đã đăng ký"
                  : participation.full
                    ? "Đã đủ số lượng"
                    : "Đăng ký tham gia"}
              </Text>
            </LinearGradient>
</>}
</Pressable>
        </View>
      </SafeAreaView>
      <Modal
        visible={imageOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setImageOpen(false)}
      >
        <SafeAreaView style={s.viewer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng ảnh"
            onPress={() => setImageOpen(false)}
            style={s.viewerClose}
          >
            <Ionicons name="close" size={27} color="white" />
          </Pressable>
          <Image
            source={photos[campaign.id]}
            style={s.fullImage}
            resizeMode="contain"
          />
          <Text style={s.viewerCaption}>{campaign.title} · Ảnh minh họa</Text>
        </SafeAreaView>
      </Modal>
      <CampaignRegistration
        visible={registrationOpen}
        campaign={campaign}
        detail={detail}
        photo={photos[campaign.id]}
        available={!participation.full}
        onClose={() => setRegistrationOpen(false)}
        onSubmitted={() => { saveDemoRegistration(campaign.id, 'submit'); }}
        onCancel={() => { saveDemoRegistration(campaign.id, 'cancel'); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingBottom:8, width: "100%", maxWidth: 760, alignSelf: "center" },
  hero: { width: "100%", aspectRatio: 1.9, backgroundColor: "#E3EAF3" },
  heroImage: { width: "100%", height: "100%" },
  heroToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  heroActions: { flexDirection: "row", gap: 8 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFFF5",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCount: {
    position: "absolute",
    right: 14,
    bottom: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#17243BAA",
    padding: 9,
    borderRadius: 13,
    minHeight: 44,
  },
  sheet: {
    marginTop: -18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 12,
  },
  badges: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#F1EAFB",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { color: colors.violet, fontSize: 11, fontWeight: "600" },
  title: { fontSize: 24, lineHeight: 31, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: 13, lineHeight: 20, color: colors.muted },
  organizer: { fontSize: 11, color: colors.teal },
  info: { gap: 10, paddingVertical: 5 },
  infoWide: { flexDirection: "row", flexWrap: "wrap", columnGap: 20 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  infoText: { flexShrink: 1, fontSize: 12, lineHeight: 19, color: colors.ink },
  stats: { flexDirection: "row", padding: 12, borderRadius: 16, gap: 8 },
  statsStack: { flexDirection: "column" },
  stat: { flex: 1, gap: 6, minWidth: 0 },
  statLabel: { fontSize: 10, lineHeight: 15, color: colors.muted },
  statValue: { fontSize: 20, fontWeight: "700", color: colors.ink },
  deadline: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.ink,
  },
  track: {
    height: 6,
    borderRadius: 8,
    backgroundColor: "#DDE5F4",
    overflow: "hidden",
  },
  progress: { height: "100%", borderRadius: 8 },
  tabScroll: { flexGrow: 0 },
  tabBar: { backgroundColor: "#F7F8FC", borderRadius: 12, gap: 3 },
  tab: {
    minHeight: 46,
    paddingHorizontal: 13,
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.blue,
    backgroundColor: "#EFF5FF",
    borderRadius: 10,
  },
  tabText: { color: colors.muted, fontSize: 12 },
  activeTabText: { color: colors.blue, fontWeight: "700" },
  tabContent: { gap: 12, minHeight: 250 },
  section: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 8 },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: colors.ink,
  },
  body: { fontSize: 12, lineHeight: 20, color: colors.muted },
  readMore: {
    minHeight: 44,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  link: { fontSize: 12, color: "#E54698", fontWeight: "600" },
  softCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.pale,
    gap: 12,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    backgroundColor: colors.pale,
    borderRadius: 14,
  },
  iconHalo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: { flex: 1, gap: 4 },
  itemTitle: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#FFF8E9",
  },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", gap: 10 },
  rail: { width: 16, alignItems: "center" },
  node: { width: 10, height: 10, borderRadius: 5, marginTop: 16 },
  line: { width: 1, flex: 1, backgroundColor: "#CDDDED" },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.pale,
    padding: 12,
    borderRadius: 14,
    gap: 3,
    marginBottom: 9,
  },
  time: { fontSize: 12, lineHeight: 18, fontWeight: "700" },
  benefitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 14,
    backgroundColor: colors.pale,
  },
  faqCard: {
    borderRadius: 14,
    backgroundColor: colors.pale,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 14,
    minHeight: 54,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 20,
    color: colors.muted,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  demo: {
    fontSize: 10,
    lineHeight: 16,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },
  footerSafe: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF0F6",
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  save: {
    flex: 0.9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 9,
    backgroundColor: "#F5EDFB",
    borderRadius: 14,
    minHeight: 50,
  },
  saveLabel: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.violet,
    fontWeight: "600",
    flexShrink: 1,
  },
  join: { flex: 1.4, borderRadius: 14, overflow: "hidden" },
  joinGradient: {
    flex: 1,
    minHeight: 50,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  joinLabel: {
    color: theme.buttons.primaryText,
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  white: { color: "white", fontSize: 12, fontWeight: "600" },
  viewer: { flex: 1, backgroundColor: "#0C1426", padding: 16 },
  viewerClose: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  fullImage: { flex: 1, width: "100%" },
  viewerCaption: {
    color: "white",
    textAlign: "center",
    paddingVertical: 16,
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#101C4266",
  },
  confirm: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    gap: 14,
  },
  confirmButton: {
    backgroundColor: colors.violet,
    padding: 15,
    alignItems: "center",
    borderRadius: 12,
    minHeight: 48,
  },
  softButton: { minHeight: 44, padding: 12, alignItems: "center" },
  empty: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  // ================================
  // PREPARATION
  // ================================

  preparationDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    marginTop: -4,
  },

  preparationList: {
    width: "100%",
  },

  preparationRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
  },

  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  numberText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.blue,
  },

  preparationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
  },

  showMorePreparation: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#EEF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  showMorePreparationText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.blue,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#E4EAF2",
    marginVertical: 6,
  },

  // ================================
  // IMPORTANT INFORMATION
  // ================================

  importantInfo: {
    width: "100%",
  },

  importantInfoRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  importantLabelBox: {
    width: 145,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  importantLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.ink,
  },

  importantContent: {
    flex: 1,
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: '#DCE4EF',
    gap: 3,
  },

  importantValue: {
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    color: colors.ink,
  },

  importantDescription: {
    fontSize: 11,
    lineHeight: 18,
    color: colors.muted,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

