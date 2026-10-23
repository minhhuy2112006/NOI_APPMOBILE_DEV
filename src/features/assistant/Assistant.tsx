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
  ActivityIndicator,
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/tokens';

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
export function ChatSheet({
  context,
  close,
  transport,
}: {
  context: ScreenContext;
  close: () => void;
  transport: AssistantTransport | null;
}) {
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const input = useRef<TextInput>(null);
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
    setMessages(next);
    setDraft("");
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
      setHandoff(result.handoff);
    } catch {
      if (id === requestId.current) {
        setMessages(messages);
        setDraft(next[next.length - 1].content);
        setError(
          "Chưa nhận được phản hồi. Bạn có thể gửi lại câu hỏi hoặc liên hệ người phụ trách.",
        );
      }
    } finally {
      clearTimeout(timeout);
      if (controller.current === abort) controller.current = null;
      if (id === requestId.current) setBusy(false);
    }
  };
  const suggest = (question: string) => {
    setDraft(question);
    setHistoryOpen(false);
    input.current?.focus();
  };
  return (
    <Modal transparent animationType="slide" onRequestClose={close}>
      <SafeAreaProvider>
        <SafeAreaView style={s.overlay} edges={["top", "left", "right"]}>
          <Pressable accessibilityLabel="Đóng NOI AI" accessibilityRole="button" style={s.backdrop} onPress={close} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.keyboard}>
            <LinearGradient colors={["#FCE7F4", "#F0ECFC", "#E1F2FF"]} style={chat.sheet} accessibilityViewIsModal>
              <View style={chat.handle} />
              <View style={chat.header}>
                <Firefly size={44} />
                <View style={s.fill}>
                  <Text style={chat.title}>NOI AI</Text>
                  <Text style={chat.subtitle}>Trợ lý hỏi đáp</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Lịch sử trò chuyện trong phiên" accessibilityState={{ expanded: historyOpen }} onPress={() => setHistoryOpen(!historyOpen)} style={chat.iconButton}>
                  <Ionicons name="time-outline" size={24} color="#102050" />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Đóng trò chuyện" onPress={close} style={chat.iconButton}>
                  <Ionicons name="close-outline" size={28} color="#102050" />
                </Pressable>
              </View>
              {historyOpen ? (
                <ScrollView contentContainerStyle={chat.messages} keyboardShouldPersistTaps="handled">
                  <Text style={chat.sectionTitle}>Lịch sử trong phiên</Text>
                  <Text style={chat.caption}>Các câu hỏi trong lần mở trò chuyện này.</Text>
                  {messages.filter(message => message.role === 'user').map((message, index) => (
                    <Pressable key={index} accessibilityRole="button" onPress={() => suggest(message.content)} style={chat.historyRow}>
                      <Ionicons name="chatbubble-outline" size={20} color="#7786A9" />
                      <Text style={[chat.body, s.fill]}>{message.content}</Text>
                      <Ionicons name="chevron-forward" size={18} color="#7786A9" />
                    </Pressable>
                  ))}
                  {!messages.length && <Text style={chat.body}>Bạn chưa gửi câu hỏi nào.</Text>}
                  <Pressable accessibilityRole="button" onPress={() => setHistoryOpen(false)} style={chat.chip}><Text style={chat.chipText}>Quay lại trò chuyện</Text></Pressable>
                </ScrollView>
              ) : (
                <ScrollView ref={scroll} style={s.fill} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={chat.messages} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
                  <Text style={chat.date}>Hôm nay</Text>
                  <ChatBubble message={{ role: 'assistant', content: 'Chào bạn! Mình là NOI AI. Bạn cần hỗ trợ điều gì hôm nay?' }} />
                  {!messages.length && <View style={chat.suggestions}>
                    {['Làm sao để đăng ký tham gia chiến dịch?', 'Theo dõi đăng ký của tôi ở đâu?', 'Làm thế nào để nhận điểm Phước?'].map(question => (
                      <Pressable key={question} accessibilityRole="button" disabled={busy} onPress={() => suggest(question)} style={({ pressed }) => [chat.chip, pressed && { opacity: 0.65 }]}><Text style={chat.chipText}>{question}</Text><Ionicons name="arrow-forward-outline" size={16} color="#6D74A0" /></Pressable>
                    ))}
                  </View>}
                  {messages.map((message, index) => <ChatBubble key={index} message={message} />)}
                  {busy && <View style={chat.thinking} accessibilityLiveRegion="polite"><Firefly size={28} /><ActivityIndicator size="small" color="#9B69CB" /><Text style={chat.caption}>NOI AI đang trả lời…</Text></View>}
                  {handoff && <View style={chat.notice}><Ionicons name="information-circle-outline" size={20} color="#7786A9" /><Text style={[chat.caption, s.fill]}>{handoff === 'leader' ? 'Vấn đề này cần Trưởng nhóm hoặc Ban tổ chức hỗ trợ. Hãy liên hệ người phụ trách chiến dịch.' : 'Bạn có thể liên hệ NOI tại Tài khoản → Hỗ trợ.'}</Text></View>}
                  {error ? <Text accessibilityRole="alert" style={chat.error}>{error}</Text> : null}
                </ScrollView>
              )}
              <SafeAreaView edges={["bottom"]} style={chat.footer}>
                {!transport && <View style={chat.connection}><Ionicons name="cloud-offline-outline" size={16} color="#7786A9" /><Text style={chat.connectionText}>Chưa kết nối dịch vụ AI. Tạm thời chưa thể gửi câu hỏi.</Text></View>}
                <View style={chat.composer}>
                  <TextInput ref={input} accessibilityLabel="Câu hỏi cho NOI AI" placeholder="Nhập câu hỏi của bạn..." placeholderTextColor="#8B97B6" value={draft} onChangeText={setDraft} maxLength={2000} multiline style={chat.input} editable={!busy} />
                  <Pressable accessibilityRole="button" accessibilityLabel="Gửi câu hỏi" accessibilityState={{ disabled: !transport || !draft.trim() || busy, busy }} disabled={!transport || !draft.trim() || busy} onPress={() => void send()} style={chat.send}>
                    {({ pressed }) => <LinearGradient colors={!transport || !draft.trim() || busy ? theme.buttons.disabledGradient : pressed ? theme.buttons.pressedGradient : theme.buttons.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={chat.sendFill}>{busy ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={20} color="#FFFFFF" />}</LinearGradient>}
                  </Pressable>
                </View>
                <Text style={chat.disclaimer}>NOI AI có thể nhầm lẫn. Hãy kiểm tra thông tin quan trọng.</Text>
              </SafeAreaView>
            </LinearGradient>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return <View style={[chat.messageRow, isUser && chat.userRow]}>
    {!isUser && <View style={chat.avatar}><Firefly size={30} /></View>}
    {isUser ? <LinearGradient colors={theme.buttons.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={chat.userBubble}><Text selectable style={[chat.body, { color: '#FFFFFF' }]}>{message.content}</Text></LinearGradient> : <View style={chat.assistantBubble}><Text selectable style={chat.body}>{message.content}</Text></View>}
  </View>;
}

const chat = StyleSheet.create({
  sheet: { flex: 1, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#B8B6D3', alignSelf: 'center', marginTop: 9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E1E5F2' },
  title: { fontSize: 22, fontWeight: '700', color: '#091B50' },
  subtitle: { fontSize: 13, color: '#7B88A9', marginTop: 2 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  messages: { paddingHorizontal: 14, paddingVertical: 17, gap: 20, flexGrow: 1 },
  date: { fontSize: 12, color: '#8794B2', textAlign: 'center', marginBottom: 2 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingRight: 18 },
  userRow: { justifyContent: 'flex-end', paddingRight: 0, paddingLeft: 38 },
  avatar: { marginTop: 4 },
  assistantBubble: { flexShrink: 1, padding: 13, borderRadius: 18, borderTopLeftRadius: 8, borderWidth: 1, borderColor: '#DEE3F1', backgroundColor: '#FBEAF6' },
  userBubble: { flexShrink: 1, padding: 13, borderRadius: 18, borderBottomRightRadius: 6 },
  body: { color: '#101E50', fontSize: 15, lineHeight: 23 },
  caption: { color: '#7A88A8', fontSize: 13, lineHeight: 20 },
  suggestions: { gap: 8, marginLeft: 38, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 18, borderWidth: 1, borderColor: '#C8C4E7', backgroundColor: '#FFFFFFB8', alignSelf: 'flex-start' },
  chipText: { color: '#525D87', fontSize: 13, lineHeight: 19, flexShrink: 1 },
  thinking: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  notice: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#EEF2FB', borderRadius: 14 },
  error: { color: '#B12E46', fontSize: 13, lineHeight: 20, marginLeft: 38 },
  footer: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#E9F3FF' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', borderWidth: 1, borderColor: '#BBB8E9', borderRadius: 26, padding: 5, backgroundColor: '#F6EDFA' },
  input: { flex: 1, minHeight: 42, maxHeight: 110, paddingHorizontal: 12, paddingVertical: 11, color: '#102050', fontSize: 15, lineHeight: 21 },
  send: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
  sendFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  disclaimer: { textAlign: 'center', color: '#8B96AF', fontSize: 10, lineHeight: 15, paddingTop: 6, paddingBottom: 8 },
  connection: { flexDirection: 'row', gap: 6, paddingHorizontal: 8, paddingBottom: 8, alignItems: 'center' },
  connectionText: { flex: 1, fontSize: 11, lineHeight: 16, color: '#7B88A6' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#102050' },
  historyRow: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E0E4F1' },
});

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
  keyboard: { height: "85%", maxHeight: "100%", width: "100%", maxWidth: 680, alignSelf: "center" },
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
