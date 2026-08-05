import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { AppButton } from "../../components/AppButton";
import { ReportCard } from "../../components/ReportCard";
import { EmptyState } from "../../components/EmptyState";
import { Loader } from "../../components/Loader";
import { colors, radius, typography } from "../../theme";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchNearbyReports,
  selectNearbyReports,
  selectNearbyMeta,
  selectReportsLoading,
} from "../../store/reportsSlice";
import type { Report } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

export function NearbyReportsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const nearby = useAppSelector(selectNearbyReports);
  const meta = useAppSelector(selectNearbyMeta);
  const loading = useAppSelector(selectReportsLoading);
  const [radius, setRadius] = useState("10");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (radiusKm: number) => {
      await dispatch(fetchNearbyReports(radiusKm));
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      const parsed = parseFloat(radius);
      load(isNaN(parsed) || parsed <= 0 ? 10 : parsed);
    }, [load, radius]),
  );

  const onRefresh = async () => {
    const parsed = parseFloat(radius);
    setRefreshing(true);
    await load(isNaN(parsed) || parsed <= 0 ? 10 : parsed);
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
      <AppHeader title="Nearby Reports" />
      <View style={styles.controls}>
        <TextInput
          value={radius}
          onChangeText={setRadius}
          keyboardType="number-pad"
          placeholder="Radius (km)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={4}
        />
        <AppButton title="Refresh" onPress={onRefresh} style={styles.refreshBtn} />
      </View>
      {meta?.patrolOfficeLocation?.address ? (
        <Text style={styles.metaText}>
          {meta.total ?? nearby.length} report(s) within {meta.radiusKm ?? radius} km of{" "}
          {meta.patrolOfficeLocation.address}
        </Text>
      ) : null}
      {loading && nearby.length === 0 ? (
        <Loader text="Finding nearby reports…" />
      ) : (
        <FlatList
          data={nearby}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No nearby reports"
              subtitle="No reports found within the selected radius."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.heading,
    marginRight: 10,
  },
  refreshBtn: {
    height: 48,
    paddingHorizontal: 20,
  },
  metaText: {
    ...typography.small,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
});
