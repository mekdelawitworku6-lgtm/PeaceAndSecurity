import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllRead,
  markRead,
  selectNotifications,
} from "../../store/notificationsSlice";
import { timeAgo } from "../../utils/format";
import { colors, spacing, typography } from "../../theme";
import type { AppNotification } from "../../types";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"NotificationsTab">;

const TYPE_ICON: Record<string, string> = {
  REPORT_SUBMITTED: "📨",
  REPORT_ASSIGNED: "👮",
  REPORT_STATUS_UPDATED: "🔄",
  PATROL_FOLLOW_UP: "📝",
  GENERAL: "🔔",
};

export default function NotificationsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotifications);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await Promise.all([dispatch(fetchNotifications()), dispatch(fetchUnreadCount())]);
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onPress = (item: AppNotification) => {
    if (!item.isRead) dispatch(markRead(item.id));
    const reportId = item.data?.reportId;
    if (reportId) {
      navigation.navigate("ReportDetail", { reportId, caseId: item.data?.caseId });
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Pressable onPress={() => onPress(item)}>
      <Card style={[styles.card, !item.isRead && styles.cardUnread]}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{TYPE_ICON[item.type] || "🔔"}</Text>
            {!item.isRead ? <View style={styles.dot} /> : null}
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <Screen keyboard={false}>
      <AppHeader
        title="Notifications"
        showBack={false}
        right={
          items.some((n) => !n.isRead) ? (
            <Pressable onPress={() => dispatch(markAllRead())} hitSlop={8}>
              <Text style={styles.markAll}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <EmptyState
            icon="🔕"
            title="No notifications"
            subtitle="Updates about your reports will appear here."
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
  markAll: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardUnread: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 18,
  },
  dot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
  },
  titleUnread: {
    color: colors.primary,
  },
  message: {
    ...typography.small,
    marginTop: 2,
  },
  time: {
    ...typography.caption,
    marginTop: 4,
  },
});
