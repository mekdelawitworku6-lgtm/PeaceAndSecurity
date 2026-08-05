import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchConversations,
  selectChatNeedsRefresh,
  selectConversations,
  setNeedsRefresh,
} from "../../store/chatSlice";
import { reportTypeLabel, timeAgo } from "../../utils/format";
import { colors, spacing, typography } from "../../theme";
import type { Conversation } from "../../types";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"ChatTab">;

export default function ConversationsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectConversations);
  const needsRefresh = useAppSelector(selectChatNeedsRefresh);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) {
      load();
      if (needsRefresh) dispatch(setNeedsRefresh(false));
    }
  }, [isFocused, needsRefresh, dispatch, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const last = item.lastMessage;
    const title = item.report
      ? `${item.report.caseId || "Report"} · ${reportTypeLabel(item.report.reportType || item.report.violationType)}`
      : "Conversation";
    return (
      <Pressable
        onPress={() =>
          navigation.navigate("Chat", { conversationId: item.id, title })
        }
      >
        <Card style={[styles.card, (item.unreadCount ?? 0) > 0 && styles.cardUnread]}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>💬</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.lastMessage} numberOfLines={2}>
                {last
                  ? `${last.senderName || last.senderType}: ${last.content}`
                  : "No messages yet — start the conversation."}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.time}>{last ? timeAgo(last.createdAt) : ""}</Text>
              {(item.unreadCount ?? 0) > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {Math.min(item.unreadCount ?? 0, 9)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen keyboard={false}>
      <AppHeader title="Chat" showBack={false} />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <EmptyState
            icon="💬"
            title="No conversations yet"
            subtitle="Start chatting with the response team from any of your reports."
            actionLabel="My Reports"
            onAction={() => navigation.navigate("ReportsTab")}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardUnread: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.bodyMedium,
  },
  lastMessage: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  time: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
});
