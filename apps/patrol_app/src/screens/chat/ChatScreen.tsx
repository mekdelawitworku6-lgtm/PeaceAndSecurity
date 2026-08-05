import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { EmptyState } from "../../components/EmptyState";
import { colors, radius, typography } from "../../theme";
import { formatTime } from "../../utils/format";
import {
  getChatSocket,
  emitTyping,
  joinConversation,
  leaveConversation,
} from "../../socket/emit";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchMessages,
  markRead,
  sendMessage,
  selectMessages,
  setActiveConversation,
} from "../../store/chatSlice";
import { selectUser } from "../../store/authSlice";
import type { Message } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

type ChatRoute = RouteProp<RootStackParamList, "Chat">;

export function ChatScreen() {
  const route = useRoute<ChatRoute>();
  const { conversationId, title } = route.params;
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const messages = useAppSelector((state) => selectMessages(state, conversationId));
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const typingOn = useRef(false);

  const userName = user?.fullName ?? "Patrol Officer";

  const loadMessages = useCallback(async () => {
    setLoading(true);
    await dispatch(fetchMessages(conversationId));
    setLoading(false);
  }, [dispatch, conversationId]);

  useFocusEffect(
    useCallback(() => {
      joinConversation(conversationId);
      dispatch(setActiveConversation(conversationId));
      dispatch(markRead(conversationId));
      loadMessages();
      return () => {
        leaveConversation(conversationId);
        dispatch(setActiveConversation(null));
      };
    }, [conversationId, dispatch, loadMessages]),
  );

  useEffect(() => {
    const socket = getChatSocket();
    if (!socket) return;
    const handler = (data: {
      conversationId: string;
      isTyping: boolean;
      senderName?: string;
    }) => {
      if (data.conversationId === conversationId) {
        setTyping(data.isTyping ? (data.senderName ?? "Someone") : null);
      }
    };
    socket.on("chat:typing", handler);
    return () => {
      socket.off("chat:typing", handler);
    };
  }, [conversationId]);

  const onChangeInput = (text: string) => {
    setInput(text);
    if (text.trim().length > 0 && !typingOn.current) {
      typingOn.current = true;
      emitTyping(conversationId, true, userName);
    } else if (text.trim().length === 0 && typingOn.current) {
      typingOn.current = false;
      emitTyping(conversationId, false, userName);
    }
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    dispatch(sendMessage({ conversationId, content: text }));
    setInput("");
    if (typingOn.current) {
      typingOn.current = false;
      emitTyping(conversationId, false, userName);
    }
  };

  const isMine = (m: Message) => m.senderType === "patrol";

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.bubbleRow, isMine(item) ? styles.mineRow : styles.otherRow]}>
      <View style={[styles.bubble, isMine(item) ? styles.mine : styles.other]}>
        <Text style={[styles.bubbleText, isMine(item) ? styles.mineText : styles.otherText]}>
          {item.content}
        </Text>
        <Text style={[styles.time, isMine(item) ? styles.mineTime : styles.otherTime]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppHeader title={title ?? "Chat"} />
      {loading && messages.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          inverted
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState icon="✉" title="No messages yet" subtitle="Start the conversation below." />
          }
        />
      )}
      {typing ? <Text style={styles.typing}>{typing} is typing…</Text> : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={onChangeInput}
            placeholder="Type a message…"
            placeholderTextColor={colors.muted}
            multiline
            style={styles.input}
          />
          <Pressable onPress={send} style={[styles.send, !input.trim() && styles.sendDisabled]}>
            <Text style={styles.sendText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 14,
    paddingBottom: 8,
    flexGrow: 1,
  },
  bubbleRow: {
    marginVertical: 4,
    flexDirection: "row",
  },
  mineRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  other: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  mineText: {
    color: colors.white,
  },
  otherText: {
    color: colors.heading,
  },
  time: {
    fontSize: 10,
    marginTop: 3,
    alignSelf: "flex-end",
  },
  mineTime: {
    color: colors.primarySoft,
  },
  otherTime: {
    color: colors.muted,
  },
  typing: {
    ...typography.small,
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.heading,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
