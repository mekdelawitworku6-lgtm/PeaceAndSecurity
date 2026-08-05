import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { useAppSelector } from "../../store/hooks";
import { selectAuthStatus } from "../../store/authSlice";
import { trackReportApi } from "../../api/reports";
import { handleError } from "../../api/client";
import { formatDateTime, reportTypeLabel } from "../../utils/format";
import { colors, spacing, typography } from "../../theme";
import type { Report } from "../../types";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"TrackCase">;

export default function TrackCaseScreen({ navigation }: Props) {
  const signedIn = useAppSelector(selectAuthStatus) === "signedIn";
  const [caseId, setCaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  const search = async () => {
    const query = caseId.trim();
    if (!query) {
      setError("Enter a case ID, e.g. REP-123456.");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const found = await trackReportApi(query.toUpperCase());
      setReport(found);
    } catch (e) {
      setError(handleError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <AppHeader title="Track Case" />
      <View style={styles.body}>
        <Text style={styles.subtitle}>
          Enter the case ID you received when submitting your report.
        </Text>

        <AppInput
          label="Case ID"
          placeholder="REP-123456"
          value={caseId}
          onChangeText={setCaseId}
          autoCapitalize="characters"
        />
        <AppButton title="Track case" onPress={search} loading={loading} />

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        {report ? (
          <Card style={styles.card}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.caseId}>{report.caseId}</Text>
                <Text style={styles.type}>{reportTypeLabel(report.reportType || report.violationType)}</Text>
              </View>
              <StatusBadge status={report.status} />
            </View>
            <Text style={styles.address}>{report.address || "Location not disclosed"}</Text>
            <Text style={styles.meta}>Submitted {formatDateTime(report.createdAt)}</Text>
            <Text style={styles.meta}>
              {report.isEmergency ? "🚨 Emergency · " : ""}
              {report.isOngoing ? "Ongoing · " : ""}
              {report.isAnonymous ? "Anonymous report" : "Identified reporter"}
            </Text>

            {signedIn ? (
              <AppButton
                title="Open full report"
                onPress={() =>
                  navigation.navigate("ReportDetail", { reportId: report.id, caseId: report.caseId })
                }
                style={styles.detailBtn}
              />
            ) : (
              <Text style={styles.meta}>
                Log in to chat with the response team about this case.
              </Text>
            )}
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: colors.danger,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    marginTop: spacing.xl,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  caseId: {
    ...typography.h2,
    color: colors.primary,
  },
  type: {
    ...typography.smallMedium,
    marginTop: 2,
  },
  address: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  detailBtn: {
    marginTop: spacing.lg,
  },
});
