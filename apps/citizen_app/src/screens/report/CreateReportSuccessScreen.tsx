import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import Card from "../../components/Card";
import { formatDateTime } from "../../utils/format";
import { t } from "../../i18n";
import { colors, radius, spacing, typography } from "../../theme";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"CreateReportSuccess">;

export default function CreateReportSuccessScreen({ navigation, route }: Props) {
  const { reportId, caseId, status } = route.params;

  const onShare = async () => {
    try {
      await Share.share({
        message: `I submitted a safety report on Addis Ababa Peace & Security. Case ID: ${caseId}`,
      });
    } catch {}
  };

  const onClose = () => {
    navigation.navigate("MainTabs", { screen: "HomeTab" });
  };

  return (
    <Screen keyboard={false}>
      <View style={styles.container}>
        {/* Close (X) button top-right */}
        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>

        {/* Checkmark circle with celebration */}
        <View style={styles.checkWrap}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.celebration}>🎉</Text>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>{t("reportSubmitted")}</Text>
        <Text style={styles.subtitle}>{t("thankYouHelp")}</Text>

        {/* Case ID Details Card */}
        <Card style={styles.caseCard}>
          {/* Header row: REPORT ID + Submitted badge */}
          <View style={styles.caseHeader}>
            <Text style={styles.caseLabel}>{t("reportId")}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Submitted</Text>
            </View>
          </View>

          {/* Case ID */}
          <Text style={styles.caseId}>{caseId}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Meta details with bullet dots */}
          <View style={styles.metaRow}>
            <View style={[styles.metaDot, { backgroundColor: colors.textMuted }]} />
            <Text style={styles.metaText}>Bole Sub-City, Addis Ababa, Ethiopia</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.metaDot, { backgroundColor: colors.textMuted }]} />
            <Text style={styles.metaText}>
              {t("submittedOn")} {formatDateTime(new Date().toISOString())}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.metaDot, { backgroundColor: colors.textMuted }]} />
            <Text style={styles.metaText}>
              {t("assignedTo")} Bole Sub-City Security Unit
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Share Report – primary */}
          <Pressable style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.shareBtnIcon}>↗</Text>
            <Text style={styles.shareBtnText}>{t("shareReport")}</Text>
          </Pressable>

          {/* View on Map – outline */}
          <Pressable
            style={styles.mapBtn}
            onPress={() => navigation.navigate("MainTabs", { screen: "MapTab" })}
          >
            <Text style={styles.mapBtnIcon}>🗺</Text>
            <Text style={styles.mapBtnText}>{t("viewOnMap")}</Text>
          </Pressable>

          {/* Return to Home – text link */}
          <Pressable
            onPress={() => navigation.navigate("MainTabs", { screen: "HomeTab" })}
            hitSlop={8}
          >
            <Text style={styles.returnLink}>{t("returnToHome")}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Close Button ───────────────────────────────── */
  closeBtn: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.xl,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.text,
    fontWeight: "300",
  },

  /* ── Checkmark Circle ───────────────────────────── */
  checkWrap: {
    marginBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  checkIcon: {
    color: colors.white,
    fontSize: 42,
    fontWeight: "700",
  },
  celebration: {
    position: "absolute",
    top: -4,
    right: -8,
    fontSize: 22,
  },

  /* ── Title ──────────────────────────────────────── */
  title: {
    ...typography.h1,
    fontSize: 26,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    color: colors.textBody,
    marginBottom: spacing.xl,
    maxWidth: 260,
    lineHeight: 22,
  },

  /* ── Case Card ──────────────────────────────────── */
  caseCard: {
    width: "100%",
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.card,
  },
  caseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  caseLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusBadge: {
    backgroundColor: "#eef1fb",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.chip,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  caseId: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  metaText: {
    ...typography.small,
    flex: 1,
    color: colors.textBody,
    lineHeight: 18,
  },

  /* ── Action Buttons ─────────────────────────────── */
  actions: {
    width: "100%",
    alignItems: "center",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 52,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  shareBtnIcon: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 52,
    borderRadius: radius.button,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  mapBtnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  mapBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  returnLink: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    paddingVertical: spacing.sm,
  },
});
