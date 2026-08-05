import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { EmptyState } from "../../components/EmptyState";
import { colors, radius, typography } from "../../theme";
import { timeAgo } from "../../utils/format";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchNotifications,
  markAllRead,
  markRead,
  selectNotifications,
  selectUnreadCount,
} from "../../store/notificationsSlice";
import type { AppNotification } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

export function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await dispatch(fetchNotifications());
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

  const onPress = (n: AppNotification) => {
    if (!n.isRead) dispatch(markRead(n.id));
    const reportId = n.data?.reportId;
    if (reportId) {
      navigation.navigate("ReportDetail", {
        reportId,
        caseId: n.data?.caseId,
      });
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, !item.isRead && styles.cardUnread, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          {!item.isRead ? <View style={styles.dot} /> : null}
          <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </View>
      <Text style={styles.body} numberOfLines={2}>
        {item.message}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppHeader
        title="Notifications"
        onBack={null}
        right={
          unreadCount > 0 ? (
            <Pressable onPress={() => dispatch(markAllRead())} hitSlop={8}>
              <Text style={styles.markAll}>Mark all read</Text>
            </Pressable>
          ) : null
        }
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="❍"
            title="No notifications"
            subtitle="Updates about your reports will appear here."
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
  markAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
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
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
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
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  title: {
    ...typography.subtitle,
    fontSize: 14,
    flexShrink: 1,
  },
  titleUnread: {
    fontWeight: "800",
  },
  time: {
    ...typography.small,
    fontSize: 12,
  },
  body: {
    ...typography.body,
    fontSize: 13,
  },
});
