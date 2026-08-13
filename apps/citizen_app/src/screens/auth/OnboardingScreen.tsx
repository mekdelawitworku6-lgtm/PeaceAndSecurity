import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { setGuestMode } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";
import { getCurrentLanguage, subscribeLanguageChange, t, type Language } from "../../i18n";
import { colors, radius, spacing, typography } from "../../theme";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [guestLoading, setGuestLoading] = useState(false);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    return subscribeLanguageChange((l) => setLang(l));
  }, []);

  const onGuest = async () => {
    setGuestLoading(true);
    dispatch(setGuestMode(true));
  };

  return (
    <Screen padding={false} keyboard={false} backgroundColor={colors.background} key={lang}>
      <StatusBar style="dark" />
      <View style={styles.topContainer}>
        <View style={styles.tickerCard}>
          <View style={styles.tickerHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.tickerTitle}>{t("liveTicker1")}</Text>
          </View>
          <Text style={styles.tickerSub}>Shared with Addis Ababa Police Bureau</Text>
        </View>

        <View style={[styles.tickerCard, styles.tickerCardSecondary]}>
          <View style={styles.tickerHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.tickerTitle}>{t("liveTicker2")}</Text>
          </View>
          <Text style={styles.tickerSub}>Shared with Addis Ababa Security Bureau</Text>
        </View>

        <View style={[styles.tickerCard, styles.tickerCardTertiary]}>
          <View style={styles.tickerHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.tickerTitle}>{t("liveTicker3")}</Text>
          </View>
          <Text style={styles.tickerSub}>Shared with Addis Ababa Security Bureau</Text>
        </View>
      </View>

      <View style={styles.bottomCard}>
        {/* Pagination dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.heading}>{t("onboardingTitle")}</Text>
        <Text style={styles.subheading}>{t("onboardingSub")}</Text>

        <View style={styles.actions}>
          <AppButton
            title={t("getStarted")}
            onPress={() => navigation.navigate("Welcome")}
          />
          <AppButton
            title={t("continueAsGuest")}
            variant="outline"
            onPress={onGuest}
            loading={guestLoading}
            style={styles.guestBtn}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    justifyContent: "center",
  },
  tickerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tickerCardSecondary: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  tickerCardTertiary: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  tickerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: spacing.sm,
  },
  tickerTitle: {
    ...typography.smallMedium,
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  tickerSub: {
    ...typography.caption,
    marginTop: 4,
    marginLeft: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
    borderRadius: 4,
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
  heading: {
    ...typography.h1,
    textAlign: "center",
    marginBottom: spacing.md,
    fontSize: 24,
  },
  subheading: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.xl,
    color: colors.textBody,
  },
  actions: {
    gap: spacing.md,
  },
  guestBtn: {
    marginTop: spacing.xs,
  },
});
