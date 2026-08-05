import { StyleSheet, Text, View } from "react-native";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import StatusBadge from "../../components/StatusBadge";
import { colors, spacing, typography } from "../../theme";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"CreateReportSuccess">;

export default function CreateReportSuccessScreen({ navigation, route }: Props) {
  const { reportId, caseId, status } = route.params;
  return (
    <Screen keyboard={false}>
      <View style={styles.container}>
        <Text style={styles.check}>✅</Text>
        <Text style={styles.title}>Report submitted</Text>
        <Text style={styles.subtitle}>
          Your report has been received and will be reviewed by the appropriate team.
        </Text>

        <View style={styles.caseCard}>
          <Text style={styles.caseLabel}>Case ID</Text>
          <Text style={styles.caseId}>{caseId || "—"}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.caseLabel}>Status</Text>
            <StatusBadge status={status} />
          </View>
        </View>

        <AppButton
          title="View report"
          onPress={() => navigation.replace("ReportDetail", { reportId, caseId })}
        />
        <AppButton
          title="Done"
          variant="ghost"
          onPress={() => navigation.navigate("MainTabs")}
          style={styles.secondary}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  check: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  caseCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  caseLabel: {
    ...typography.caption,
    textTransform: "uppercase",
  },
  caseId: {
    ...typography.h2,
    color: colors.primary,
    marginVertical: spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondary: {
    marginTop: spacing.md,
  },
});
