import { theme as buttonTheme } from '../../theme/tokens';
import ParticipationEditorial from "./ParticipationEditorial";
import HowItWorksScreen from "./HowItWorksScreen";
import IntroductionScreen from "./IntroductionScreen";
import MissionScreen from "./MissionScreen";
import OrganizationsScreen from "./OrganizationsScreen";
import ImpactScreen from "./ImpactScreen";
import TransparencyScreen from "./TransparencyScreen";
import StoriesScreen from "./StoriesScreen";

import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, type ComponentProps, type PropsWithChildren } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ActionBackground } from "../../components/ui";
import { campaigns } from "../campaigns/data";
import { useAssistantContext } from "../assistant/Assistant";
import {
  articles,
  stories,
  topics,
  type Paragraph,
  type SectionId,
} from "./content";

type Icon = ComponentProps<typeof Ionicons>["name"];
type Tone = "pink" | "blue" | "purple" | "green" | "orange";
const tones: Record<Tone, [string, string]> = {
  pink: ["#FBE3F4", "#D954A8"],
  blue: ["#E3F0FF", "#3889E7"],
  purple: ["#EDE6FF", "#8861D8"],
  green: ["#DFF8EE", "#31A78B"],
  orange: ["#FFF0E4", "#E68C48"],
};
const photos = {
  // ② Về NOI
  hands: require("../../../assets/about/about-hands-heart.png"),

  // ③ Sứ mệnh
  seed: require("../../../assets/about/about-mission-seed.png"),

  // ④ Cách hoạt động
  kindness: require("../../../assets/about/about-how-it-works.png"),

  // Các ảnh khác
  meals: require("../../../assets/campaigns/meals.webp"),
  books: require("../../../assets/campaigns/books.webp"),
  community: require("../../../assets/campaigns/community.webp"),
};
const titles: Record<SectionId, [string, string]> = {
  introduction: ["Kết nối con người", "vì một cộng đồng tốt đẹp hơn"],
  mission: [
    "Vì một cộng đồng\ntốt đẹp hơn",
    "NOI tồn tại để trao cơ hội cho mọi người được đóng góp, kết nối và cùng hành động vì những giá trị nhân văn và phát triển bền vững.",
  ],
  "how-it-works": [
    "Từ lòng tốt\nđến hành động",
    "NOI giúp quá trình tham gia và đóng góp trở nên đơn giản, minh bạch và hiệu quả.",
  ],
  organizations: [
    "Những đối tác\nđồng hành cùng NOI",
    "NOI hợp tác cùng các tổ chức phi lợi nhuận, nhóm cộng đồng, trường học và đơn vị xã hội trên khắp Việt Nam.",
  ],
  impact: ["Những thay đổi\ntừ những hành động nhỏ", ""],

  transparency: [
    "Minh bạch để\nlan tỏa niềm tin",
    "NOI cam kết công khai, rõ ràng và trung thực trong mọi hoạt động.",
  ],
  join: [
    "Mỗi người đều có thể\ngóp sức",
    "Bạn có thể tham gia theo nhiều cách phù hợp với khả năng và thời gian của mình.",
  ],
  stories: ["Những câu chuyện\nlan tỏa yêu thương", ""],
  standards: [
    "Cùng giữ NOI\nlà nơi an toàn và tích cực",
    "Để xây dựng một cộng đồng văn minh, thân thiện và tôn trọng lẫn nhau, chúng ta đặt ra những tiêu chuẩn sau:",
  ],
};
const concise = {
  "how-it-works": [
    [
      "Khám phá",
      "Tìm hiểu các chiến dịch và tổ chức phù hợp với bạn.",
      "search-outline",
      "blue",
    ],
    [
      "Tham gia",
      "Đăng ký tham gia, đóng góp thời gian, hiện vật hoặc tài chính.",
      "document-text-outline",
      "pink",
    ],
    [
      "Kết nối",
      "Được hướng dẫn, chuẩn bị và kết nối với cộng đồng cùng chung mục tiêu.",
      "people",
      "purple",
    ],
    [
      "Lan tỏa",
      "Chia sẻ trải nghiệm để truyền cảm hứng đến nhiều người hơn.",
      "paper-plane-outline",
      "blue",
    ],
  ],
  standards: [
    [
      "Tôn trọng",
      "Tôn trọng mọi người, mọi hoàn cảnh và sự khác biệt.",
      "heart",
      "pink",
    ],
    [
      "Trung thực",
      "Cung cấp thông tin chính xác, không gian lận.",
      "chatbubble-outline",
      "purple",
    ],
    [
      "Văn minh",
      "Giao tiếp tích cực, không kỳ thị hay phân biệt.",
      "people-outline",
      "blue",
    ],
    [
      "An toàn",
      "Đảm bảo an toàn cho bản thân và cộng đồng trong mọi hoạt động.",
      "shield-checkmark-outline",
      "green",
    ],
    [
      "Trách nhiệm",
      "Giữ lời hứa, hoàn thành cam kết và tôn trọng thời gian chung.",
      "flag-outline",
      "pink",
    ],
  ],
  transparency: [
    [
      "Công khai thông tin",
      "Thông tin chiến dịch, mục tiêu và nhu cầu được trình bày rõ ràng.",
      "document-text-outline",
      "blue",
    ],
    [
      "Báo cáo định kỳ",
      "Tiến độ và kết quả hoạt động được cập nhật trong suốt chiến dịch.",
      "stats-chart-outline",
      "purple",
    ],
    [
      "Chứng từ rõ ràng",
      "Hóa đơn, hình ảnh và tài liệu liên quan được lưu trữ minh bạch.",
      "folder-outline",
      "orange",
    ],
    [
      "Giám sát cộng đồng",
      "Cộng đồng có thể theo dõi, đặt câu hỏi và đóng góp ý kiến.",
      "people-outline",
      "pink",
    ],
  ],
} as const;

function Badge({ icon, tone = "blue" }: { icon: Icon; tone?: Tone }) {
  return (
    <View style={[s.badge, { backgroundColor: tones[tone][0] }]}>
      <Ionicons name={icon} size={25} color={tones[tone][1]} />
    </View>
  );
}
function Surface({ children }: PropsWithChildren) {
  return <View style={s.surface}>{children}</View>;
}
function CTA({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[s.cta, { overflow: 'hidden', borderColor: 'transparent' }]}>
      {({ pressed }) => (
        <>
          {secondary ? (
            <View
              style={[[
                StyleSheet.absoluteFill,
                s.secondary,
                pressed && { opacity: 0.7 },
              ], { backgroundColor: 'transparent', borderColor: 'transparent' }]}
            />
          ) : (
            <ActionBackground pressed={pressed} radius={14} />
          )}

          <Text style={[s.ctaText, { color: buttonTheme.buttons.primaryText }]}>{title}</Text>

          <Ionicons name="arrow-forward" size={17} color={buttonTheme.buttons.primaryText} />
        </>
      )}
    </Pressable>
  );
}
function Tabs({
  values,
  selected,
  onChange,
}: {
  values: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.tabs}
    >
      {values.map((value) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: value === selected }}
          key={value}
          onPress={() => onChange(value)}
          style={s.tabHit}
        >
          <View style={[s.tab, selected === value && s.tabSelected]}>
            {selected === value && <ActionBackground radius={8} />}
            <Text style={[s.tabText, selected === value && s.tabTextSelected]}>
              {value}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
function Row({
  title,
  summary,
  icon,
  tone,
  onPress,
  numbered,
}: {
  title: string;
  summary: string;
  icon: Icon;
  tone: Tone;
  onPress: () => void;
  numbered?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. Xem nội dung đầy đủ`}
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.75 }]}
    >
      <Badge icon={icon} tone={tone} />
      {numbered ? (
        <Text style={[s.stepNumber, { color: tones[tone][1] }]}>
          {numbered}
        </Text>
      ) : null}
      <View style={s.grow}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.summary}>{summary}</Text>
      </View>
    </Pressable>
  );
}
function Decoration({ section }: { section: SectionId }) {
  return (
    <View pointerEvents="none" style={s.decoration}>
      {section === "transparency" ? (
        <>
          <Ionicons name="shield-outline" size={83} color="#B39CEA" />
          <Ionicons
            name="stats-chart"
            size={34}
            color="#9672DC"
            style={{ position: "absolute", top: 23, left: 24 }}
          />
        </>
      ) : section === "mission" ? (
        <>
          <Ionicons
            name="leaf"
            size={57}
            color="#C5E7A7"
            style={{ transform: [{ rotate: "-20deg" }] }}
          />
          <Ionicons
            name="leaf"
            size={36}
            color="#D5EDB9"
            style={{
              position: "absolute",
              left: -25,
              top: 35,
              transform: [{ rotate: "18deg" }],
            }}
          />
        </>
      ) : (
        <>
          <View style={s.petalBlue} />
          <View style={s.petalPink} />
          <Ionicons
            name="heart"
            size={17}
            color="#EBDDF9"
            style={{ position: "absolute", right: 0, top: -7 }}
          />
        </>
      )}
    </View>
  );
}
function Metrics({ intro = false }: { intro?: boolean }) {
  const entries: {
    title: string;
    value: string;
    icon: Icon;
    tone: Tone;
  }[] = intro
    ? [
        {
          title: "Đối tác tổ chức",
          value: "20+",
          icon: "people-outline",
          tone: "blue",
        },
        {
          title: "Người tham gia",
          value: "50K+",
          icon: "heart",
          tone: "pink",
        },
        {
          title: "Chiến dịch",
          value: "100+",
          icon: "globe-outline",
          tone: "blue",
        },
        {
          title: "Tỉnh thành",
          value: "30+",
          icon: "leaf",
          tone: "green",
        },
      ]
    : [
        {
          title: "Tình nguyện viên",
          value: "50K+",
          icon: "heart-outline",
          tone: "pink",
        },
        {
          title: "Chiến dịch",
          value: "120+",
          icon: "document-text-outline",
          tone: "purple",
        },
        {
          title: "Tỉnh thành",
          value: "30+",
          icon: "people-outline",
          tone: "blue",
        },
        {
          title: "Lượt thụ hưởng",
          value: "200K+",
          icon: "leaf",
          tone: "green",
        },
      ];

  return (
    <View style={s.metrics}>
      {entries.map((e) => (
        <View style={s.metric} key={e.title}>
          <Badge icon={e.icon} tone={e.tone} />

          <View style={s.grow}>
            <Text style={s.metricValue}>{e.value}</Text>
            <Text style={s.metricLabel}>{e.title}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function AboutDetailScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();

  if (section === "introduction") {
    return <IntroductionScreen />;
  }

  if (section === "mission") {
    return <MissionScreen />;
  }

  if (section === "how-it-works") return <HowItWorksScreen />;

  if (section === "organizations") {
    return <OrganizationsScreen />;
  }

  if (section === "impact") {
    return <ImpactScreen />;
  }

  if (section === "transparency") {
    return <TransparencyScreen />;
  }

  if (section === "stories") {
    return <StoriesScreen />;
  }
  
  if (section === "join" || section === "standards") return <ParticipationEditorial kind={section} />;
  return <AboutPage key={section} section={section} />;
}
export function AboutPage({ section }: { section: string }) {
  const { width } = useWindowDimensions();
  const topic = topics.find((t) => t.id === section);
  const [reading, setReading] = useState<{
    title: string;
    paragraphs: Paragraph[];
  } | null>(null);
  const [category, setCategory] = useState("Tất cả");
  const [impact, setImpact] = useState("Tổng quan");
  useAssistantContext("Về NOI", {
    page: topic?.title ?? "Không tìm thấy",
    paragraphs: topic ? (articles[topic.id] ?? []) : [],
    dataSource: "Nội dung giới thiệu và dữ liệu mẫu",
  });
  const read = (title: string, paragraphs: Paragraph[]) =>
    setReading({ title, paragraphs });
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/about");
  const categories = ["Tất cả", ...new Set(campaigns.map((c) => c.category))];

  const storyPhoto = (id: string) =>
    id === "first-day"
      ? photos.meals
      : id === "working-together"
        ? photos.seed
        : photos.books;
  const storyDate = (id: string) => {
    switch (id) {
      case "first-day":
        return "12 Thg 10, 2026";

      case "working-together":
        return "05 Thg 10, 2026";

      default:
        return "28 Thg 9, 2026";
    }
  };
  const storyRow = (story: (typeof stories)[number]) => (
    <Pressable
      accessibilityRole="button"
      key={story.id}
      onPress={() =>
        read(story.title, [
          {
            title: story.category,
            text: story.body,
          },
        ])
      }
      style={s.storyRow}
    >
      <Image
        source={storyPhoto(story.id)}
        style={s.storyThumbnail}
        resizeMode="cover"
      />

      <View style={s.storyContent}>
        <Text style={s.storyTitle} numberOfLines={2}>
          {story.title}
        </Text>

        <Text style={s.storyDate}>{storyDate(story.id)}</Text>

        <Text style={s.storySummary} numberOfLines={2}>
          {story.summary}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#333970" />
    </Pressable>
  );
  return (
    <LinearGradient
      colors={
        section === "mission"
          ? ["#F9FBFF", "#F7F9FF", "#EDF7FF"]
          : ["#FCF0FA", "#FAF8FF", "#F0F8FF"]
      }
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
            <Ionicons name="chevron-back" size={22} color="#101C58" />
          </Pressable>
          <Text style={s.headerTitle}>{topic?.title ?? "Về NOI"}</Text>
          <View style={s.back} />
        </View>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!topic ? (
            <CTA title="Về trang Về NOI" onPress={back} />
          ) : (
            <>
              {topic.id === "introduction" ? (
                <>
                  <View style={s.introTagline}>
                    <View style={s.miniMark}>
                      <View style={s.petalBlue} />
                      <View style={s.petalPink} />
                    </View>
                    <Text style={s.introTagText}>
                      Kết nối con người{"\n"}vì một cộng đồng tốt đẹp hơn
                    </Text>
                  </View>
                  <Image
                    source={photos.hands}
                    resizeMode="cover"
                    style={s.introPhoto}
                    accessibilityLabel="Ảnh minh họa bàn tay tạo hình trái tim"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Đọc câu chuyện và giá trị của NOI"
                    onPress={() => read("Về NOI", articles.introduction ?? [])}
                    style={s.introCopy}
                  >
                    <Text style={s.body}>
                      NOI là nền tảng kết nối những người muốn đóng góp vì xã
                      hội, với các tổ chức và cộng đồng đang cần sự hỗ trợ.
                    </Text>
                    <Text style={s.body}>
                      Chúng tôi tin rằng mỗi người đều có thể tạo nên thay đổi
                      tích cực, dù chỉ là một hành động nhỏ.
                    </Text>
                  </Pressable>
                  <Metrics intro />
                  <View style={s.quote}>
                    <Text style={s.quoteMark}>“</Text>
                    <Text style={s.quoteText}>
                      Cộng đồng tốt đẹp hơn{"\n"}bắt đầu từ những con người bình
                      thường,{"\n"}làm những điều phi thường.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={s.hero}>
  <Decoration section={topic.id} />

  <Text style={s.headline}>
    {titles[topic.id][0]}
  </Text>

  {titles[topic.id][1] ? (
    <Text style={s.heroDescription}>
      {titles[topic.id][1]}
    </Text>
  ) : null}
</View>

                  {topic.id === "mission" && (
                    <View style={s.missionSection}>
                      {/* Ảnh đại diện cho sứ mệnh */}
                      <Image
                        source={photos.seed}
                        resizeMode="cover"
                        style={s.missionPhoto}
                        accessibilityLabel="Ảnh minh họa bàn tay nâng mầm cây"
                      />

                      {/* Các giá trị cốt lõi */}
                      <View style={s.missionRows}>
                        <Row
                          title="Nuôi dưỡng tinh thần sẻ chia"
                          summary="Lan tỏa những giá trị tốt đẹp trong cộng đồng."
                          icon="leaf"
                          tone="green"
                          onPress={() =>
                            read(
                              "Nuôi dưỡng tinh thần sẻ chia",
                              (articles.mission ?? []).slice(0, 2),
                            )
                          }
                        />

                        <Row
                          title="Tạo cầu nối bền vững"
                          summary="Kết nối người có lòng với những nơi đang cần giúp đỡ."
                          icon="people"
                          tone="purple"
                          onPress={() =>
                            read(
                              "Tạo cầu nối bền vững",
                              (articles.mission ?? []).slice(2, 3),
                            )
                          }
                        />

                        <Row
                          title="Thúc đẩy thay đổi tích cực"
                          summary="Chung tay xây dựng một xã hội nhân ái, công bằng và phát triển bền vững."
                          icon="heart"
                          tone="pink"
                          onPress={() =>
                            read(
                              "Thúc đẩy thay đổi tích cực",
                              (articles.mission ?? []).slice(3),
                            )
                          }
                        />
                      </View>
                    </View>
                  )}
                  {(topic.id === "standards" ||
                    topic.id === "transparency") && (
                    <View style={s.rows}>
                      {concise[topic.id].map(
                        ([title, summary, icon, tone], index) => (
                          <Row
                            key={title}
                            title={title}
                            summary={summary}
                            icon={icon}
                            tone={tone}
                            onPress={() =>
                              read(
                                title,
                                [(articles[topic.id] ?? [])[index]].filter(
                                  Boolean,
                                ),
                              )
                            }
                          />
                        ),
                      )}
                    </View>
                  )}
                  {/* ④ CÁCH HOẠT ĐỘNG */}
                  {topic.id === "how-it-works" && (
                    <View style={s.howRows}>
                      {concise["how-it-works"].map(
                        ([title, summary, icon, tone], index) => (
                          <Row
                            key={title}
                            title={title}
                            summary={summary}
                            icon={icon}
                            tone={tone}
                            numbered={index + 1}
                            onPress={() =>
                              read(
                                title,
                                [
                                  (articles["how-it-works"] ?? [])[index],
                                ].filter(Boolean),
                              )
                            }
                          />
                        ),
                      )}
                    </View>
                  )}
                  {topic.id === "how-it-works" && (
                    <Image
                      source={photos.kindness}
                      style={s.kindness}
                      resizeMode="contain"
                      accessible={false}
                    />
                  )}
                  {topic.id === "transparency" && (
                    <>
                      <CTA
                        title="Xem báo cáo minh bạch"
                        onPress={() =>
                          read("Cam kết minh bạch", articles.transparency ?? [])
                        }
                      />
                    </>
                  )}
                  {topic.id === "impact" && (
                    <>
                      <Tabs
                        values={["Tổng quan", "Theo lĩnh vực", "Theo năm"]}
                        selected={impact}
                        onChange={setImpact}
                      />
                      {impact === "Tổng quan" && (
                        <>
                          <Metrics />

                          <Text style={s.sectionTitle}>
                            Câu chuyện tác động
                          </Text>
                          {stories.slice(0, 2).map(storyRow)}
                        </>
                      )}
                      {impact === "Theo lĩnh vực" && (
                        <Surface>
                          <Text style={s.rowTitle}>Phân bổ chiến dịch mẫu</Text>
                          {categories.slice(1).map((c) => (
                            <View key={c} style={s.rows}>
                              <Text style={s.body}>
                                {c} ·{" "}
                                {
                                  campaigns.filter(
                                    (item) => item.category === c,
                                  ).length
                                }
                              </Text>
                              <View style={s.track}>
                                <View
                                  style={[
                                    s.bar,
                                    {
                                      width: `${(campaigns.filter((item) => item.category === c).length / campaigns.length) * 100}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                          ))}
                        </Surface>
                      )}
                      {impact === "Theo năm" && (
                        <Surface>
                          <Text style={s.body}>
                            Chưa có báo cáo tổng hợp theo năm. Số liệu sẽ được
                            cập nhật sau khi xác nhận.
                          </Text>
                        </Surface>
                      )}
                    </>
                  )}
                  {topic.id === "join" && (
                    <>
                      <View style={s.rows}>
                        <Row
                          title="Tình nguyện viên"
                          summary="Đóng góp thời gian và trực tiếp tham gia các hoạt động cộng đồng."
                          icon="person-outline"
                          tone="blue"
                          onPress={() => router.navigate("/")}
                        />
                        <Row
                          title="Đóng góp tài chính"
                          summary="Hỗ trợ chi phí để duy trì và mở rộng các chiến dịch."
                          icon="heart-outline"
                          tone="pink"
                          onPress={() => router.navigate("/contributions")}
                        />
                        <Row
                          title="Đóng góp hiện vật"
                          summary="Quyên góp đồ dùng, sách vở, nhu yếu phẩm…"
                          icon="briefcase-outline"
                          tone="orange"
                          onPress={() =>
                            read("Đóng góp hiện vật", [
                              {
                                title: "Trao đúng điều cần thiết",
                                text: "Xem nhu cầu hiện vật của chiến dịch và trao đổi với Ban tổ chức trước khi gửi. Mobile chưa có luồng tiếp nhận hiện vật; không có đăng ký nào được gửi tại đây.",
                              },
                            ])
                          }
                        />
                        <Row
                          title="Lan tỏa thông tin"
                          summary="Chia sẻ chiến dịch để nhiều người cùng biết đến."
                          icon="paper-plane-outline"
                          tone="blue"
                          onPress={() =>
                            read("Đồng hành cùng NOI", [
                              {
                                title: "Lan tỏa có trách nhiệm",
                                text: "Chia sẻ thông tin đã được kiểm chứng; xin phép trước khi đăng hình ảnh hoặc câu chuyện của người khác. Bạn cũng có thể đóng góp chuyên môn và thời gian phù hợp.",
                              },
                            ])
                          }
                        />
                      </View>
                      <CTA
                        title="Tham gia ngay"
                        onPress={() => router.navigate("/")}
                      />
                    </>
                  )}
                  {topic.id === "stories" && (
                    <>
                      <Tabs
                        values={[
                          "Tất cả",
                          "Câu chuyện",
                          "Hoạt động",
                          "Tin tức",
                        ]}
                        selected={category}
                        onChange={setCategory}
                      />
                      <View style={s.rows}>
                        {stories
                          .filter(
                            (story) =>
                              category === "Tất cả" ||
                              story.category === category,
                          )
                          .map(storyRow)}
                      </View>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <Modal
        visible={!!reading}
        animationType="slide"
        onRequestClose={() => setReading(null)}
      >
        <SafeAreaProvider>
          <SafeAreaView style={s.reader}>
            <View style={s.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Đóng nội dung"
                onPress={() => setReading(null)}
                style={s.back}
              >
                <Ionicons name="close" size={23} color="#101C58" />
              </Pressable>
              <Text style={s.headerTitle}>{reading?.title}</Text>
              <View style={s.back} />
            </View>
            <ScrollView contentContainerStyle={s.readerContent}>
              {reading?.paragraphs.map((p) => (
                <View key={p.title} style={s.rows}>
                  <Text style={s.sectionTitle}>{p.title}</Text>
                  <Text style={s.readerBody}>{p.text}</Text>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1 },
  reader: { flex: 1, backgroundColor: "#FAFAFF" },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 4,
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
    color: "#122453",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 9,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  hero: {
    position: "relative",
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
    minHeight: 90,
  },

  headline: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    color: "#122453",
    paddingRight: 58,
    letterSpacing: -0.3,
  },

  heroDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#68738A",
    maxWidth: "94%",
  },
  decoration: {
    position: "absolute",
    right: -3,
    top: 0,
    width: 78,
    height: 80,
    opacity: 0.65,
  },
  petalBlue: {
    width: 39,
    height: 64,
    borderRadius: 28,
    backgroundColor: "#D7E9FF",
    position: "absolute",
    left: 24,
    top: 0,
    transform: [{ rotate: "32deg" }],
  },
  petalPink: {
    width: 33,
    height: 54,
    borderRadius: 24,
    backgroundColor: "#F6DAF4",
    position: "absolute",
    top: 22,
    left: 5,
    transform: [{ rotate: "-34deg" }],
  },
  grow: { flex: 1, minWidth: 0, gap: 3 },
  rows: { gap: 8 },
  howRows: {
    gap: 9,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,

    backgroundColor: "rgba(255,255,255,0.90)",

    paddingHorizontal: 14,
    paddingVertical: 13,

    borderRadius: 16,
    minHeight: 78,

    borderWidth: 1,
    borderColor: "#E8E4F0",
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: "#122453",
  },

  summary: {
    fontSize: 12,
    lineHeight: 17,
    color: "#68738A",
  },

  body: {
    fontSize: 13,
    lineHeight: 19,
    color: "#68738A",
  },

  caption: {
    fontSize: 10,
    lineHeight: 14,
    color: "#8791A7",
  },
  stepNumber: {
    width: 24,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center",
    alignSelf: "center",
  },
  surface: {
    backgroundColor: "rgba(255,255,255,0.92)",

    borderRadius: 16,

    padding: 14,
    gap: 10,

    borderWidth: 1,
    borderColor: "#E8E4F0",
  },
  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,

    padding: 10,

    backgroundColor: "rgba(255,255,255,0.92)",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E8E4F0",
  },

  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: 14,
  },
  introTagline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 55,
    gap: 14,
  },
  miniMark: { width: 70, height: 66, transform: [{ scale: 0.8 }] },
  introTagText: { fontSize: 13, lineHeight: 18, color: "#364578" },
  introPhoto: { width: "100%", height: 200, borderRadius: 18 },
  introCopy: {
    padding: 16,
    borderRadius: 18,

    backgroundColor: "rgba(255,255,255,0.94)",

    marginTop: -28,

    marginHorizontal: 10,

    gap: 8,

    borderWidth: 1,
    borderColor: "#EEEAF5",
  },
  missionSection: {
    width: "100%",
    marginTop: 2,
  },

  missionPhoto: {
    width: "100%",
    height: 180,
    borderRadius: 18,
  },

  missionRows: {
    marginTop: -18,
    paddingHorizontal: 10,
    gap: 9,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metric: {
    flexBasis: "46%",
    flexGrow: 1,

    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    backgroundColor: "rgba(255,255,255,0.90)",

    borderRadius: 16,

    padding: 12,
    minHeight: 78,

    borderWidth: 1,
    borderColor: "#E8E4F0",
  },

  metricValue: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
    color: "#122453",
  },

  metricLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: "#68738A",
  },
  dataNote: { fontSize: 10, lineHeight: 14, color: "#7A84A4" },
  quote: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#F1E9FB",
    flexDirection: "row",
    gap: 7,
    alignItems: "flex-start",
  },
  quoteMark: {
    fontSize: 33,
    lineHeight: 35,
    color: "#C3A5EC",
    fontWeight: "700",
  },
  quoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#8664B8",
  },
  kindness: {
    width: "100%",
    height: 145,
    marginTop: -2,
    marginBottom: 0,
  },
  tabs: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },

  tabHit: {
    minHeight: 40,
    justifyContent: "center",
  },

  tab: {
    backgroundColor: "#EEF1F8",

    paddingHorizontal: 14,
    paddingVertical: 9,

    borderRadius: 12,
    overflow: "hidden",
  },

  tabSelected: {
    backgroundColor: "#F3E7F8",
  },

  tabText: {
    fontSize: 11,
    lineHeight: 14,
    color: "#68738A",
  },

  tabTextSelected: {
    color: "#353959",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#111B58",
    marginTop: 5,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EBEFF9",
    overflow: "hidden",
  },
  bar: { height: 6, backgroundColor: "#ACBFFF", borderRadius: 3 },
  cta: {
    minHeight: 50,

    paddingHorizontal: 16,
    paddingVertical: 12,

    borderRadius: 14,
    overflow: "hidden",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 8,
  },

  ctaText: {
    fontSize: 14,
    lineHeight: 19,

    fontWeight: "700",

    color: "#353959",

    flexShrink: 1,
    textAlign: "center",
  },
  secondary: { backgroundColor: "#E6F2FF", borderRadius: 11 },
  textLink: {
    minHeight: 36,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: { fontSize: 11, lineHeight: 16, color: "#6960A6", flexShrink: 1 },
  readerContent: {
    padding: 22,
    gap: 24,
    paddingBottom: 50,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  readerBody: { fontSize: 16, lineHeight: 26, color: "#35445C" },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 9,

    backgroundColor: "rgba(255,255,255,0.92)",

    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4F0",
  },

  storyThumbnail: {
    width: 94,
    height: 74,
    borderRadius: 12,
  },

  storyContent: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  storyTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: "#122453",
  },

  storyDate: {
    fontSize: 9,
    lineHeight: 12,
    color: "#8791A7",
  },

  storySummary: {
    fontSize: 10,
    lineHeight: 14,
    color: "#68738A",
  },
});

