import { useRef, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAssistant } from "../assistant/Assistant";
import { normalizeSearch } from "../campaigns/data";
import { router, useFocusEffect } from "expo-router";
import { supportDraft } from "./session";
import { faqs } from "./model";

import {
  Action,
  Copy,
  Heading,
  Layout,
  Link,
  Panel,
  Quick,
  Sheet,
  Icon,
  s,
} from "./AccountScreenShared";

const supportQuestions = [
    {
      question: "Làm thế nào để đăng ký tham gia chiến dịch?",
      answer:
        "Mở chiến dịch bạn quan tâm, đọc thông tin và chọn đăng ký tham gia. Theo dõi phản hồi của tổ chức trong Đăng ký của tôi.",
    },
    {
      question: "Làm sao để theo dõi lịch sử đóng góp?",
      answer:
        "Vào Tài khoản và mở Lịch sử đóng góp để xem các giao dịch cùng trạng thái xác nhận.",
    },
    {
      question: "Tôi có thể hủy đăng ký tham gia không?",
      answer:
        "Mở chi tiết đăng ký để kiểm tra các thao tác hiện có. Nếu đã được xác nhận hoặc phân công, hãy liên hệ người phụ trách để được hỗ trợ.",
    },
    {
      question: "Làm thế nào để nhận điểm Phước?",
      answer:
        "Điểm Phước ghi nhận đóng góp của bạn. Hiện quy tắc cộng điểm chưa được kết nối; thao tác điểm danh không tự cộng điểm.",
    },
    {
      question: "Tôi gặp lỗi khi sử dụng ứng dụng, phải làm sao?",
      answer:
        "Ghi lại màn hình gặp lỗi và các bước đã thực hiện. Bạn có thể soạn phản hồi tại đây; ứng dụng hiện lưu bản nháp trong phiên, chưa gửi tới NOI.",
    },
    ...faqs,
  ];

export default function SupportScreen() {
  const assistant = useAssistant();
  const draft = supportDraft.useValue();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState("");
  const [all, setAll] = useState(false);
  const [sheet, setSheet] = useState<"guide" | "contact" | "feedback" | null>(
    null,
  );
  const search = useRef<TextInput>(null);
  const matched = supportQuestions.filter((f) =>
    normalizeSearch(f.question + " " + f.answer).includes(
      normalizeSearch(query),
    ),
  );
  const visible = all || query ? matched : matched.slice(0, 5);
  return (
    <Layout title="Hỗ trợ">
      <View style={s.searchPanel}>
        <View style={s.search}>
          <Icon name="search" />
          <TextInput
            ref={search}
            accessibilityLabel="Tìm câu hỏi hỗ trợ"
            placeholder="Bạn cần hỗ trợ điều gì?"
            placeholderTextColor="#7B89A8"
            value={query}
            onChangeText={setQuery}
            style={s.searchInput}
          />
          {query ? (
            <Pressable
              accessibilityLabel="Xóa tìm kiếm"
              accessibilityRole="button"
              onPress={() => setQuery("")}
              style={s.clear}
            >
              <Icon name="close" size={18} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <LinearGradient
        colors={["#F9F2FF", "#FFF7FC", "#F7DDF7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={s.heroCopy}>
          <Text style={s.heroTitle}>
            Chúng tôi luôn{"\n"}sẵn sàng hỗ trợ bạn
          </Text>
          <Copy>
            Giải đáp thắc mắc, hướng dẫn sử dụng và hỗ trợ trong quá trình tham
            gia cùng NOI.
          </Copy>
        </View>
        <Image
          source={require("../../../assets/account/support-agent.png")}
          resizeMode="contain"
          style={s.agent}
        />
      </LinearGradient>
      <Panel>
        <Heading>Chủ đề hỗ trợ nhanh</Heading>
        <View style={s.quickRow}>
          <Quick
            title="Hướng dẫn sử dụng"
            description="Tìm hiểu cách sử dụng các tính năng của app"
            icon="headset"
            onPress={() => setSheet("guide")}
          />
          <Quick
            title="Gửi phản hồi"
            description="Đóng góp ý kiến để app tốt hơn"
            icon="chatbubbles"
            color="#5897F5"
            onPress={() => setSheet("feedback")}
          />
          <Quick
            title="Câu hỏi thường gặp"
            description="Xem các thắc mắc phổ biến"
            icon="bulb"
            color="#FFAC30"
            onPress={() => {
              setAll(true);
              search.current?.focus();
            }}
          />
        </View>
      </Panel>
      <Panel>
        <View style={s.sectionHead}>
          <Heading>Câu hỏi thường gặp</Heading>
          <Link
            title={all ? "Thu gọn" : "Xem tất cả"}
            onPress={() => setAll(!all)}
          />
        </View>
        <View style={s.outline}>
          {visible.map((f, i) => (
            <View key={f.question} style={i > 0 && s.divider}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: expanded === f.question }}
                onPress={() =>
                  setExpanded(expanded === f.question ? "" : f.question)
                }
                style={s.faqRow}
              >
                <Text style={s.faqTitle}>{f.question}</Text>
                <Icon
                  name={
                    expanded === f.question ? "chevron-down" : "chevron-forward"
                  }
                  size={18}
                />
              </Pressable>
              {expanded === f.question && (
                <View style={s.answer}>
                  <Copy>{f.answer}</Copy>
                </View>
              )}
            </View>
          ))}
          {!visible.length && <Copy>Không tìm thấy câu hỏi phù hợp.</Copy>}
        </View>
      </Panel>
      <LinearGradient colors={["#FAF0FF", "#FCEDF9"]} style={s.contact}>
        <View style={s.contactCopy}>
          <Heading>Liên hệ với NOI</Heading>
          <Copy>
            Nếu bạn không tìm thấy câu trả lời phù hợp, hãy liên hệ trực tiếp
            với chúng tôi.
          </Copy>
        </View>
        <View style={s.envelope}>
          <Icon name="mail" size={83} color="#F693C6" />
          <View style={s.envelopeHeart}>
            <Icon name="heart" size={31} color="#F253A2" />
          </View>
        </View>
        <View style={s.actions}>
          <Action
            title="Liên hệ hỗ trợ"
            icon="call"
            onPress={() => setSheet("contact")}
          />
          <Action
            title="Gửi phản hồi"
            icon="chatbubble-ellipses-outline"
            onPress={() => setSheet("feedback")}
          />
        </View>
      </LinearGradient>
      <Sheet
        title={
          sheet === "guide"
            ? "Hướng dẫn sử dụng"
            : sheet === "feedback"
              ? "Gửi phản hồi"
              : "Liên hệ hỗ trợ"
        }
        visible={sheet !== null}
        close={() => setSheet(null)}
      >
        {sheet === "feedback" ? (
          <>
            <Copy>
              Soạn phản hồi của bạn. Bản nháp được giữ trong phiên này; kênh gửi
              đến NOI chưa được kết nối.
            </Copy>
            <TextInput
              accessibilityLabel="Chủ đề phản hồi"
              placeholder="Chủ đề"
              value={draft.subject}
              onChangeText={(subject) =>
                supportDraft.set((v) => ({ ...v, subject }))
              }
              style={s.input}
            />
            <TextInput
              accessibilityLabel="Nội dung phản hồi"
              placeholder="Nội dung phản hồi"
              multiline
              value={draft.message}
              onChangeText={(message) =>
                supportDraft.set((v) => ({ ...v, message }))
              }
              style={[s.input, s.message]}
            />
            <Text style={s.mutedButton}>Chưa thể gửi phản hồi</Text>
          </>
        ) : sheet === "guide" ? (
          <>
            <Heading>Bắt đầu cùng NOI</Heading>
            <Copy>1. Khám phá chiến dịch phù hợp và đăng ký tham gia.</Copy>
            <Copy>
              2. Theo dõi xác nhận, lịch trình và công việc trong Đăng ký của
              tôi.
            </Copy>
            <Copy>
              3. Mở Điểm danh trong thời gian hoạt động để chụp ảnh và xác thực
              vị trí.
            </Copy>
            <Action
              title="Xem đăng ký của tôi"
              onPress={() => {
                setSheet(null);
                router.push({
                  pathname: "/account/[section]",
                  params: { section: "registrations" },
                });
              }}
            />
          </>
        ) : (
          <>
            <Copy>
              Kênh điện thoại và email hỗ trợ chính thức chưa được cấu hình. Bạn
              có thể hỏi NOI AI hoặc soạn phản hồi để lưu lại.
            </Copy>
            <Action
              title="Hỏi NOI AI"
              icon="chatbubbles"
              onPress={() => {
                setSheet(null);
                assistant.open();
              }}
            />
            <Action
              title="Soạn phản hồi"
              onPress={() => setSheet("feedback")}
            />
          </>
        )}
      </Sheet>
    </Layout>
  );
}