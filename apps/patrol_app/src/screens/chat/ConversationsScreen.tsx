import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { EmptyState } from "../../components/EmptyState";
import { colors, radius, typography, shadows } from "../../theme";
import { timeAgo } from "../../utils/format";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchConversations,
  selectConversations,
} from "../../store/chatSlice";
import type { Conversation } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

export function ConversationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectConversations);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await dispatch(fetchConversations());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const titleFor = (conv: Conversation) =>
    conv.report?.caseId ?? conv.report?.violationType ?? conv.report?.reportType?.name ?? "Conversation";

  const renderItem = ({ item }: { item: Conversation }) => {
    const last = item.lastMessage;
    return (
      <Pressable
        onPress={() =>
          navigation.navigate("Chat", {
            conversationId: item.id,
            title: titleFor(item),
          })
        }
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {titleFor(item)}
          </Text>
          {last ? <Text style={styles.time}>{timeAgo(last.createdAt)}</Text> : null}
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.last} numberOfLines={2}>
            {last ? last.content : "No messages yet"}
          </Text>
          {item.unreadCount && item.unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppHeader title="Inbox" onBack={null} />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="✉"
            title="No conversations"
            subtitle="Chats about your reports will appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    ...typography.subtitle,
    flex: 1,
    marginRight: 8,
  },
  time: {
    ...typography.small,
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  last: {
    ...typography.body,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
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
