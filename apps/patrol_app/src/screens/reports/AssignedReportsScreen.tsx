import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { ReportCard } from "../../components/ReportCard";
import { EmptyState } from "../../components/EmptyState";
import { colors, radius, typography } from "../../theme";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchAssignedReports,
  selectAssignedReports,
  selectReportFilter,
  setFilter,
} from "../../store/reportsSlice";
import type { ReportStatus, Report } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

const FILTERS: (ReportStatus | "ALL")[] = [
  "ALL",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "ESCALATED",
];

export function AssignedReportsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const allReports = useAppSelector(selectAssignedReports);
  const filter = useAppSelector(selectReportFilter);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = filter === "ALL" ? allReports : allReports.filter((r) => r.status === filter);

  const load = useCallback(async () => {
    await dispatch(fetchAssignedReports());
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

  const renderItem = ({ item }: { item: Report }) => (
    <ReportCard
      report={item}
      onPress={() =>
        navigation.navigate("ReportDetail", { reportId: item.id, caseId: item.caseId })
      }
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppHeader title="Assigned Reports" onBack={null} />
      <View style={styles.chips}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => dispatch(setFilter(f))}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f === "ALL" ? "All" : f.replace(/_/g, " ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControlFallback refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title={filter === "ALL" ? "No assigned reports" : `No ${filter.replace(/_/g, " ").toLowerCase()} reports`}
            subtitle="Pull to refresh or check back later."
          />
        }
      />
    </SafeAreaView>
  );
}

function RefreshControlFallback({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: () => void }) {
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chips: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.label,
    fontSize: 12,
    color: colors.body,
  },
  chipTextActive: {
    color: colors.white,
  },
  list: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
});
