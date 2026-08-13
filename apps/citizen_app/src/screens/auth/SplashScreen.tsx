import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { initLanguage, t } from "../../i18n";
import { colors, spacing, typography } from "../../theme";
import type { AuthStackParamList } from "../../navigation/types";

const logo = require("../../../assets/logo.png");

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let mounted = true;
    (async () => {
      await initLanguage();
      setTimeout(() => {
        if (mounted) {
          navigation.replace("Onboarding");
        }
      }, 1500);
    })();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>{t("addisAbabaCitizens")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  content: {
    alignItems: "center",
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    ...typography.h2,
    fontSize: 20,
    color: colors.primaryDark,
    textAlign: "center",
    maxWidth: 280,
  },
});
