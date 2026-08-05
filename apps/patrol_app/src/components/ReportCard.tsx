import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, typography, shadows } from "../theme";
import { timeAgo } from "../utils/format";
import { StatusBadge } from "./StatusBadge";
import type { Report } from "../types";

interface ReportCardProps {
  report: Report;
  onPress: () => void;
}

export function ReportCard({ report, onPress }: ReportCardProps) {
  const violationType = report.reportType?.name ?? report.violationType ?? "Report";
  const reporterName = report.reporter?.fullName ?? report.reporterPhoneNumber;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.caseId}>{report.caseId ?? "—"}</Text>
        <StatusBadge status={report.status} />
      </View>
      <Text style={styles.type}>{violationType.replace(/_/g, " ")}</Text>
      <Text style={styles.address} numberOfLines={2}>
        {report.area ? `${report.area}${report.address ? " · " : ""}` : ""}
        {report.address ?? ""}
      </Text>
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>
          {report.isAnonymous ? "Anonymous report" : reporterName ?? "Unknown reporter"}
        </Text>
        <Text style={styles.meta}>{timeAgo(report.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  caseId: {
    ...typography.label,
    color: colors.primary,
    fontSize: 13,
  },
  type: {
    ...typography.subtitle,
    fontSize: 15,
    marginBottom: 4,
  },
  address: {
    ...typography.body,
    fontSize: 13,
    color: colors.body,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  meta: {
    ...typography.small,
    fontSize: 12,
  },
});
