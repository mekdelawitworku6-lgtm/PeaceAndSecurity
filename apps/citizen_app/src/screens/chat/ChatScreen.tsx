import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import AppHeader from "../../components/AppHeader";
import Loader from "../../components/Loader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/authSlice";
import {
  fetchMessages,
  markConversationRead,
  selectChatLoading,
  selectChatSending,
  sendMessage,
  setActiveConversation,
} from "../../store/chatSlice";
import { emitTyping, joinConversation, leaveConversation } from "../../socket";
import { formatTime } from "../../utils/format";
import { colors, radius, spacing, typography } from "../../theme";
import type { Message } from "../../types";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"Chat">;

export default function ChatScreen({ route }: Props) {
  const { conversationId, title } = route.params;
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const messages = useAppSelector((s) => s.chat.messagesByConv[conversationId] ?? []);
  const loading = useAppSelector(selectChatLoading);
  const sending = useAppSelector(selectChatSending);
  const typingInfo = useAppSelector((s) => s.chat.typing[conversationId]);
  const isFocused = useIsFocused();

  const [input, setInput] = useState("");
  const typingRef = useRef(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    dispatch(setActiveConversation(conversationId));
    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [dispatch, conversationId]);

  useEffect(() => {
    if (isFocused) {
      joinConversation(conversationId);
      dispatch(fetchMessages(conversationId));
      dispatch(markConversationRead(conversationId));
    }
    return () => {
      if (isFocused) leaveConversation(conversationId);
    };
  }, [isFocused, conversationId, dispatch]);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (typingRef.current === isTyping) return;
      typingRef.current = isTyping;
      emitTyping(conversationId, isTyping, user?.fullName);
    },
    [conversationId, user],
  );

  const onChangeText = (text: string) => {
    setInput(text);
    sendTyping(text.length > 0);
  };

  const send = async () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    sendTyping(false);
    await dispatch(
      sendMessage({
        convId: conversationId,
        content,
        senderType: "citizen",
        senderName: user?.fullName,
      }),
    );
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const mine = item.senderId === user?.id;
    const prev = messages[index - 1];
    const showName = !mine && (!prev || prev.senderId !== item.senderId);
    return (
      <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
        {mine ? null : showName ? (
          <Text style={styles.senderName}>{item.senderName || item.senderType}</Text>
        ) : null}
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={[styles.msgText, mine && styles.msgTextMine]}>{item.content}</Text>
          <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={title} />
      {loading && messages.length === 0 ? (
        <Loader label="Loading messages…" />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}
      {typingInfo?.isTyping ? (
        <View style={styles.typingRow}>
          <Text style={styles.typingText}>{typingInfo.senderName || "Someone"} is typing…</Text>
        </View>
      ) : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={onChangeText}
            multiline
            maxLength={1000}
          />
          <Pressable
            onPress={send}
            disabled={sending || input.trim().length === 0}
            style={[styles.sendBtn, (sending || input.trim().length === 0) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  msgRow: {
    marginBottom: spacing.md,
    maxWidth: "82%",
  },
  msgRowMine: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  msgRowOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    ...typography.caption,
    marginBottom: 4,
    color: colors.primary,
    fontWeight: "600",
  },
  bubble: {
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: "100%",
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    ...typography.body,
  },
  msgTextMine: {
    color: colors.white,
  },
  msgTime: {
    ...typography.caption,
    marginTop: 3,
    textAlign: "right",
  },
  msgTimeMine: {
    color: colors.primarySoft,
  },
  typingRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 4,
  },
  typingText: {
    ...typography.caption,
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  sendBtn: {
    width: 46,
    height: 42,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.white,
    fontSize: 18,
  },
});
