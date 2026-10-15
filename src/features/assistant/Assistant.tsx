import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { usePathname, useFocusEffect } from "expo-router";
import { Button } from "../../components/ui";

import {
  assistantTransport,
  validateReply,
  type AssistantTransport,
  type Facts,
  type Message,
  type ScreenContext,
} from "./context";
import { routeContext } from "./routeContext";

type Channel = {
  open: () => void;
  setBottomInset: (height: number) => void;
  publish: (
    id: string,
    data: { scope: string; facts: Facts; priority: number } | null,
  ) => void;
};
const ChannelContext = createContext<Channel>({
  open: () => {},
  setBottomInset: () => {},
  publish: () => {},
});
export const useAssistant = () => useContext(ChannelContext);
export function useAssistantContext(
  scope: string,
  facts: Facts,
  priority = 10,
) {
  const { publish } = useAssistant();
  const id = useId();
  const serialized = JSON.stringify(facts);
  useEffect(() => {
    publish(id, { scope, facts: JSON.parse(serialized), priority });
    return () => publish(id, null);
  }, [id, scope, serialized, priority, publish]);
}
export function Firefly({ size = 32 }: { size?: number }) {
  return <Image source={require('../../../assets/branding/noi-ai-mascot.png')} resizeMode="contain" accessible={false} style={{ width: size, height: size }} />;
}
export function withAssistant(Screen: ComponentType) {
  function ScreenWithAssistant() {
    return (
      <AssistantFrame>
        <Screen />
      </AssistantFrame>
    );
  }
  return ScreenWithAssistant;
}
function AssistantFrame({ children }: PropsWithChildren) {
  const route = usePathname();
  const [focused, setFocused] = useState(true);
  // Hiệu ứng "ánh sáng thở" cho NOI AI
  const [glowAnim] = useState(() => new Animated.Value(0));
  const [sparkleAnim] = useState(() => new Animated.Value(0));
useEffect(() => {
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
  );

  animation.start();

  return () => {
    animation.stop();
  };
}, [glowAnim]);
useEffect(() => {
  const sparkleAnimation = Animated.loop(
    Animated.sequence([
      // Nghỉ một lúc để hạt sáng không xuất hiện liên tục
      Animated.delay(4200),

      // Hạt sáng bay lên
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]),
  );

  sparkleAnimation.start();

  return () => {
    sparkleAnimation.stop();
  };
}, [sparkleAnim]);
const glowOpacity = glowAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0.15, 0.35],
});

const glowScale = glowAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0.92, 1.1],
});
const sparkleOpacity = sparkleAnim.interpolate({
  inputRange: [0, 0.12, 0.55, 1],
  outputRange: [0, 0.85, 0.65, 0],
});

const sparkleTranslateY = sparkleAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [5, -18],
});

const sparkleTranslateX = sparkleAnim.interpolate({
  inputRange: [0, 0.5, 1],
  outputRange: [0, 3, 1],
});

const sparkleScale = sparkleAnim.interpolate({
  inputRange: [0, 0.3, 0.7, 1],
  outputRange: [0.4, 1, 0.85, 0.3],
});
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [bottomInset, setBottomInset] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
        setVisible(false);
      };
    }, []),
  );
  const [keyboard, setKeyboard] = useState(false);
  const [entries, setEntries] = useState<
    Record<string, { scope: string; facts: Facts; priority: number }>
  >({});
  const publish = useCallback<Channel["publish"]>(
    (id, data) =>
      setEntries((current) => {
        const next = { ...current };
        if (data) next[id] = data;
        else delete next[id];
        return next;
      }),
    [],
  );
  const open = useCallback(() => setVisible(true), []);
  const channel = useMemo(
    () => ({ open, publish, setBottomInset }),
    [open, publish],
  );
  const base = routeContext(route);
  const extra = Object.values(entries).sort(
    (a, b) => b.priority - a.priority,
  )[0];
  const context: ScreenContext = extra
    ? { ...base, scope: extra.scope, facts: { ...base.facts, ...extra.facts } }
    : base;
  const hasTabs = [
    "/",
    "/contributions",
    "/about",
    "/store",
    "/account",
  ].includes(route);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboard(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboard(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return (
    <ChannelContext.Provider value={channel}>
      <View style={s.fill}>
        <View style={s.fill}>{children}</View>
        {focused && !keyboard && (
          <View
            pointerEvents="box-none"
            style={[
              s.dock,
              {
                bottom: Math.max(hasTabs ? 0 : insets.bottom, bottomInset) + 12,
                right: Math.max(insets.right, 12),
              },
            ]}
          >
            <Pressable
  accessibilityRole="button"
  accessibilityLabel="Mở trợ lý NOI AI"
  onPress={open}
  style={({ pressed }) => [
    s.fab,
    pressed && { opacity: 0.82 },
  ]}
>
  {/* Ánh sáng thở */}
  <Animated.View
    pointerEvents="none"
    style={[
      s.aiGlow,
      {
        opacity: glowOpacity,
        transform: [{ scale: glowScale }],
      },
    ]}
  />

  {/* Đốm sáng bay lên */}
  <Animated.View
  pointerEvents="none"
  style={[
    s.aiSparkle,
    {
      opacity: sparkleOpacity,
      transform: [
        { translateY: sparkleTranslateY },
        { translateX: sparkleTranslateX },
        { scale: sparkleScale },
      ],
    },
  ]}
/>

  {/* Mascot luôn nằm phía trước */}
  <View style={s.fireflyFront}>
    <Firefly />
  </View>
</Pressable>
          </View>
        )}
        {visible && focused && (
          <ChatSheet
            key={JSON.stringify(context)}
            context={context}
            close={() => setVisible(false)}
            transport={assistantTransport}
          />
        )}
      </View>
    </ChannelContext.Provider>
  );
}
function ChatSheet({
  context,
  close,
  transport,
}: {
  context: ScreenContext;
  close: () => void;
  transport: AssistantTransport | null;
}) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [handoff, setHandoff] = useState<
    "leader" | "noi-support" | undefined
  >();
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const scroll = useRef<ScrollView>(null);
  useEffect(
    () => () => {
      requestId.current++;
      controller.current?.abort();
    },
    [],
  );
  const send = async () => {
    if (!transport || controller.current || !draft.trim()) return;
    const id = ++requestId.current;
    const abort = new AbortController();
    controller.current = abort;
    const next: Message[] = [
      ...messages,
      { role: "user" as const, content: draft.trim() },
    ].slice(-20);
    setBusy(true);
    setError("");
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = validateReply(
        await Promise.race([
          transport.send({ context, messages: next }, abort.signal),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(() => {
              abort.abort();
              reject(Error("Timeout"));
            }, 30000);
          }),
        ]),
        context,
      );
      if (id !== requestId.current) return;
      setMessages([...next, { role: "assistant", content: result.answer }]);
      setDraft("");
      setHandoff(result.handoff);
    } catch {
      if (id === requestId.current)
        setError(
          "Không nhận được phản hồi có căn cứ. Bạn có thể thử lại hoặc liên hệ người phụ trách.",
        );
    } finally {
      clearTimeout(timeout);
      if (controller.current === abort) controller.current = null;
      if (id === requestId.current) setBusy(false);
    }
  };
  return (
    <Modal transparent animationType="slide" onRequestClose={close}>
      <SafeAreaProvider>
        <SafeAreaView style={s.overlay}>
          <Pressable
            accessibilityLabel="Đóng NOI AI"
            accessibilityRole="button"
            style={s.backdrop}
            onPress={close}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={s.keyboard}
          >
            <View style={s.sheet} accessibilityViewIsModal>
              <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: '#D0D2E5', alignSelf: 'center', marginTop: 10 }} />
              <View style={s.header}>
                <Firefly size={34} />
                <View style={s.fill}>
                  <Text style={s.title}>NOI AI</Text>
                  <Text style={s.muted}>Trợ lý AI · {context.scope}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Đóng trò chuyện"
                  onPress={close}
                  style={s.close}
                >
                  <Text style={[s.title, { fontSize: 24 }]}>×</Text>
                </Pressable>
              </View>
              <ScrollView
                ref={scroll}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={s.messages}
                onContentSizeChange={() =>
                  scroll.current?.scrollToEnd({ animated: false })
                }
              >
                <Text style={s.muted}>
                  NOI AI khác với Ban tổ chức và Trưởng nhóm. Các quyết định về
                  tham gia, đến muộn hoặc ngoại lệ cần người phụ trách xử lý.
                </Text>
                <Text style={s.muted}>
                  Trợ lý chỉ dùng dữ liệu NOI được cung cấp; không bỏ qua
                  camera, GPS, quyền truy cập hay bán kính 100 m khi điểm danh.
                </Text>
                <View style={s.contextCard}>{context.facts.campaign && typeof context.facts.campaign === 'object' && !Array.isArray(context.facts.campaign) && typeof context.facts.campaign.id === 'string' && <Image source={context.facts.campaign.id === 'trang-sach' ? require('../../../assets/campaigns/books.webp') : context.facts.campaign.id === 'mam-xanh' ? require('../../../assets/campaigns/garden.webp') : require('../../../assets/campaigns/meals.webp')} style={{ width: '100%', height: 88, borderRadius: 10 }} resizeMode="cover" accessibilityLabel="Ảnh minh họa chiến dịch" />}<Text style={s.label}>Đang xem · {context.scope}</Text><Text style={s.title}>{context.facts.campaign && typeof context.facts.campaign === 'object' && !Array.isArray(context.facts.campaign) && typeof context.facts.campaign.title === 'string' ? context.facts.campaign.title : 'Thông tin trên màn hình hiện tại'}</Text><Text style={s.muted}>Dữ liệu mẫu do ứng dụng cung cấp</Text></View>
                {!transport && (
                  <View style={s.notice}>
                    <Text style={s.title}>Chưa kết nối dịch vụ AI</Text>
                    <Text style={s.muted}>
                      Bạn có thể nhập câu hỏi, nhưng chưa thể gửi hoặc nhận câu
                      trả lời. Không có dữ liệu nào được gửi ra ngoài.
                    </Text>
                  </View>
                )}
                {messages.map((message, index) => (
                  <View key={index} style={[s.message, message.role === "user" ? s.userMessage : s.assistantMessage]}>
                    {message.role === "assistant" && <Firefly size={30} />}
                    <View style={s.fill}>
                      <Text style={s.label}>
                        {message.role === "user" ? "Bạn" : "NOI AI"}
                      </Text>
                      <Text selectable style={s.text}>
                        {message.content}
                      </Text>
                    </View>
                  </View>
                ))}
                {handoff && (
                  <View style={s.notice}>
                    <Text style={s.title}>
                      {handoff === "leader"
                        ? "Cần Trưởng nhóm / Ban tổ chức hỗ trợ"
                        : "Cần Hỗ trợ NOI kiểm tra"}
                    </Text>
                    <Text style={s.muted}>
                      Liên hệ qua kênh chính thức của người phụ trách hoặc mục
                      Tài khoản → Hỗ trợ. Đây không phải cuộc trò chuyện với
                      người thật.
                    </Text>
                  </View>
                )}
                {error ? (
                  <Text accessibilityRole="alert" style={s.error}>
                    {error}
                  </Text>
                ) : null}
              </ScrollView>
              <View style={s.composer}>
                <TextInput
                  accessibilityLabel="Câu hỏi cho NOI AI"
                  placeholder="Bạn muốn hỏi điều gì?"
                  value={draft}
                  onChangeText={setDraft}
                  maxLength={2000}
                  multiline
                  style={s.input}
                  editable={!busy}
                />
                <Button
                  title="Gửi"
                  onPress={() => void send()}
                  disabled={!transport || !draft.trim()}
                  loading={busy}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
const s = StyleSheet.create({
  contextCard: { padding: 12, gap: 5, borderRadius: 14, borderWidth: 1, borderColor: "#E6E7F2", backgroundColor: "#FFFFFF" },
  userMessage: { alignSelf: "flex-end", maxWidth: "88%", backgroundColor: "#E9EDFF", padding: 12, borderRadius: 16 },
  assistantMessage: { backgroundColor: "#F4F3FB", padding: 12, borderRadius: 16 },
  fill: { flex: 1 },
  dock: { position: "absolute", zIndex: 10, alignItems: "flex-end" },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
  
    backgroundColor: "#F8F5FC",
  
    borderWidth: 1,
    borderColor: "#E7DFF0",
  
    alignItems: "center",
    justifyContent: "center",
  
    // Quan trọng để glow có thể lan ra ngoài nút
    overflow: "visible",
  
    elevation: 3,
  
    shadowColor: "#B7D1FF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  aiGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F2B3E3",
  
    shadowColor: "#B7D1FF",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.65,
    shadowRadius: 12,
  
    elevation: 2,
  },
  
  aiSparkle: {
    position: "absolute",
    top: 7,
    right: 7,
  
    width: 7,
    height: 7,
    borderRadius: 3.5,
  
    backgroundColor: "#B7D1FF",
  
    zIndex: 3,
    elevation: 5,
  
    shadowColor: "#F2B3E3",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
  
  fireflyFront: {
    width: 48,
    height: 48,
  
    alignItems: "center",
    justifyContent: "center",
  
    zIndex: 2,
    elevation: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#14213D66",
  },
  backdrop: { ...StyleSheet.absoluteFill },
  keyboard: { height: "82%", maxHeight: "100%" },
  sheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  },
  title: { color: "#122453", fontSize: 16, fontWeight: "700" },
  label: { color: "#41466B", fontSize: 12, fontWeight: "600" },
  muted: { color: "#62708A", fontSize: 13, lineHeight: 20 },
  text: { color: "#22304A", fontSize: 15, lineHeight: 23 },
  close: {
    minWidth: 48,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  messages: { padding: 16, gap: 16 },
  notice: { backgroundColor: "#F5F7FC", borderRadius: 12, padding: 12, gap: 6 },
  message: { flexDirection: "row", gap: 8 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#D9DDED",
    borderRadius: 12,
    padding: 12,
    color: "#122453",
  },
  error: { color: "#B12E46" },
});
