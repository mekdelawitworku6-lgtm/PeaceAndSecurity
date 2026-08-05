import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMyReports, selectMyReports, selectReportsLoading } from "../../store/reportsSlice";
import { formatDateTime, reportTypeLabel } from "../../utils/format";
import { colors, spacing, typography } from "../../theme";
import type { Report } from "../../types";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"ReportsTab">;

export default function MyReportsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectMyReports);
  const loading = useAppSelector(selectReportsLoading);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await dispatch(fetchMyReports());
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Report }) => (
    <Pressable onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.title}>{reportTypeLabel(item.reportType || item.violationType)}</Text>
            <Text style={styles.meta}>
              {item.caseId || "—"} · {formatDateTime(item.createdAt)}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {item.address || `${item.latitude?.toFixed(4)}, ${item.longitude?.toFixed(4)}`}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        {item.isEmergency ? (
          <Text style={styles.emergency}>🚨 Emergency report</Text>
        ) : null}
      </Card>
    </Pressable>
  );

  return (
    <Screen keyboard={false}>
      <AppHeader title="My Reports" showBack={false} />
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <Text style={styles.loadingText}>Loading…</Text>
            </View>
          ) : (
            <EmptyState
              icon="📋"
              title="No reports yet"
              subtitle="Reports you submit will appear here with live status updates."
              actionLabel="Report Incident"
              onAction={() => navigation.navigate("CreateReport")}
            />
          )
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.bodyMedium,
  },
  meta: {
    ...typography.caption,
    marginTop: 2,
  },
  emergency: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontWeight: "700",
    fontSize: 13,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    color: colors.textMuted,
  },
});
