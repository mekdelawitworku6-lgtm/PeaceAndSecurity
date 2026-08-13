import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Screen from "../../components/Screen";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import AppButton from "../../components/AppButton";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchNearbyReports, selectNearbyReports } from "../../store/reportsSlice";
import { getCurrentLanguage, subscribeLanguageChange, t, type Language } from "../../i18n";
import { formatDateTime, reportTypeLabel } from "../../utils/format";
import type { Report } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"MapTab">;

const FILTERS = [
  { id: "ALL", label: "filterAll", dot: null },
  { id: "CRIME", label: "filterCrime", dot: "#dc2626" },
  { id: "ILLEGAL", label: "filterIllegal", dot: "#f59e0b" },
  { id: "THREAT", label: "filterThreat", dot: "#2563eb" },
];

const MOCK_PINS = [
  { id: "p1", caseId: "PSB-2026-0101", type: "CRIME", title: "Robbery / Theft", location: "Meskel Square, Ring Road", status: "IN_PROGRESS", lat: 9.0107, lng: 38.7612, x: 50, y: 45 },
  { id: "p2", caseId: "PSB-2026-0102", type: "ILLEGAL", title: "Illegal Weapons", location: "Bole Road, near Airport", status: "UNDER_REVIEW", lat: 8.9892, lng: 38.7865, x: 75, y: 35 },
  { id: "p3", caseId: "PSB-2026-0103", type: "THREAT", title: "Security Threat", location: "Mexico Square", status: "ASSIGNED", lat: 9.0125, lng: 38.7450, x: 30, y: 60 },
  { id: "p4", caseId: "PSB-2026-0104", type: "CRIME", title: "Unlit Area / Vandalism", location: "Churchill Ave, 1202", status: "RESOLVED", lat: 9.0200, lng: 38.7500, x: 40, y: 30 },
  { id: "p5", caseId: "PSB-2026-0105", type: "ILLEGAL", title: "Illegal Dumping", location: "Piassa Market", status: "SUBMITTED", lat: 9.0350, lng: 38.7520, x: 45, y: 18 },
];

export default function MapScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const nearby = useAppSelector(selectNearbyReports);
  const isFocused = useIsFocused();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | typeof MOCK_PINS[0] | null>(null);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    return subscribeLanguageChange((l) => setLang(l));
  }, []);

  const loadMap = useCallback(async () => {
    setLoading(true);
    await dispatch(fetchNearbyReports());
    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) loadMap();
  }, [isFocused, loadMap]);

  const itemsToDisplay = nearby.length > 0 ? nearby : MOCK_PINS;
  const filtered = itemsToDisplay.filter((item: any) => {
    const typeStr = (item.violationType || item.reportType?.name || item.type || "").toUpperCase();
    if (activeFilter === "CRIME") return typeStr.includes("CRIME") || typeStr.includes("ROBBERY") || item.isEmergency;
    if (activeFilter === "ILLEGAL") return typeStr.includes("ILLEGAL") || typeStr.includes("VANDALISM");
    if (activeFilter === "THREAT") return typeStr.includes("THREAT") || typeStr.includes("WEAPON");
    return true;
  });

  return (
    <Screen keyboard={false} padding={false} key={lang}>
      {/* Header Title */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t("viewIncidentMap")}</Text>
      </View>

      {/* Search Bar + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchLocation")}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.filterBtn} hitSlop={4}>
          <Text style={styles.filterBtnIcon}>⚙</Text>
        </Pressable>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <Pressable
                key={f.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(f.id)}
              >
                {f.dot ? (
                  <View style={[styles.chipDot, { backgroundColor: active ? colors.white : f.dot }]} />
                ) : null}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t(f.label as any)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Map View Area (Google Maps Embed on Web) */}
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <View style={styles.webMapWrap}>
            {/* Google Maps Iframe Embed for Addis Ababa */}
            <iframe
              title="Addis Ababa Safety Map"
              src="https://maps.google.com/maps?q=9.0107,38.7612&z=13&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, width: "100%", height: "100%" }}
            />
            {/* Incident Pins Overlaid on the Map */}
            {filtered.map((item: any, idx) => {
              const posX = item.x ?? (20 + (idx * 25) % 65);
              const posY = item.y ?? (25 + (idx * 30) % 55);
              const isSelected = selectedReport && selectedReport.id === item.id;
              const isEmergency = item.isEmergency || item.type === "CRIME";
              const isIllegal = item.type === "ILLEGAL";
              const pinColor = isEmergency ? "#dc2626" : isIllegal ? "#f59e0b" : "#2563eb";

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.marker,
                    { left: `${posX}%`, top: `${posY}%`, backgroundColor: pinColor },
                    isSelected && styles.markerSelected,
                  ]}
                  onPress={() => setSelectedReport(item)}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.mapCanvas}>
            <View style={styles.road1} />
            <View style={styles.road2} />
            <View style={styles.road3} />
            <View style={styles.road4} />

            <Text style={[styles.streetLabel, { top: "20%", left: "10%" }]}>Legedadi Condominium</Text>
            <Text style={[styles.streetLabel, { top: "55%", left: "50%" }]}>Hotel Mexico</Text>

            {filtered.map((item: any, idx) => {
              const posX = item.x ?? (20 + (idx * 25) % 65);
              const posY = item.y ?? (25 + (idx * 30) % 55);
              const isSelected = selectedReport && selectedReport.id === item.id;
              const isEmergency = item.isEmergency || item.type === "CRIME";
              const isIllegal = item.type === "ILLEGAL";
              const pinColor = isEmergency ? "#dc2626" : isIllegal ? "#f59e0b" : "#2563eb";

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.marker,
                    { left: `${posX}%`, top: `${posY}%`, backgroundColor: pinColor },
                    isSelected && styles.markerSelected,
                  ]}
                  onPress={() => setSelectedReport(item)}
                />
              );
            })}
          </View>
        )}

        {/* Bottom Stats Overlay Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <Text style={styles.statsCount}>{itemsToDisplay.length}</Text>
            <Text style={styles.statsLabel}>{t("activeIncidentsCount")}</Text>
          </View>
          <View style={styles.statsLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
              <Text style={styles.legendText}>Crime</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
              <Text style={styles.legendText}>Illegal Activity</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#2563eb" }]} />
              <Text style={styles.legendText}>Event / Threat</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Selected Report Modal */}
      <Modal
        visible={!!selectedReport}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalCaseId}>
                  {(selectedReport as any)?.caseId || (selectedReport as any)?.id || "PSB-2026-REPORT"}
                </Text>
                <Text style={styles.modalType}>
                  {reportTypeLabel((selectedReport as any)?.reportType?.name || (selectedReport as any)?.violationType || (selectedReport as any)?.title)}
                </Text>
              </View>
              <StatusBadge status={(selectedReport as any)?.status || "SUBMITTED"} />
            </View>

            <Text style={styles.modalLocation}>
              📍 {(selectedReport as any)?.address || (selectedReport as any)?.location || "Addis Ababa, Ethiopia"}
            </Text>

            <View style={styles.modalActions}>
              <AppButton
                title={t("trackCase")}
                onPress={() => {
                  const rep = selectedReport as any;
                  setSelectedReport(null);
                  if (rep?.id && !rep.id.startsWith("p")) {
                    navigation.navigate("ReportDetail", { reportId: rep.id, caseId: rep.caseId });
                  } else {
                    navigation.navigate("TrackCase");
                  }
                }}
              />
              <AppButton
                title={t("close")}
                variant="ghost"
                onPress={() => setSelectedReport(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnIcon: {
    fontSize: 18,
    color: colors.textMuted,
  },
  filtersRow: {
    marginVertical: spacing.md,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.chip,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  chipText: {
    ...typography.smallMedium,
    color: colors.textBody,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.white,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  webMapWrap: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: "#dde5d6",
    position: "relative",
  },
  road1: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#c0c8b8",
  },
  road2: {
    position: "absolute",
    top: "65%",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#c0c8b8",
  },
  road3: {
    position: "absolute",
    left: "30%",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#c0c8b8",
  },
  road4: {
    position: "absolute",
    left: "65%",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#c0c8b8",
  },
  streetLabel: {
    position: "absolute",
    fontSize: 9,
    color: "#7a8a70",
    fontWeight: "500",
  },
  marker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 10,
  },
  markerSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    zIndex: 20,
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  statsCard: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 30,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  statsLeft: {
    marginRight: spacing.lg,
  },
  statsLabel: {
    ...typography.caption,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsCount: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primary,
  },
  statsLegend: {
    flex: 1,
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textBody,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(8,26,77,0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalCaseId: {
    ...typography.h2,
    color: colors.primary,
  },
  modalType: {
    ...typography.bodyMedium,
    marginTop: 2,
  },
  modalLocation: {
    ...typography.body,
    color: colors.textBody,
  },
  modalActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
