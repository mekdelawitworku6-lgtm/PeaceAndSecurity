import { Image, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { colors, spacing, typography } from "../../theme";
import type { AuthStackParamList } from "../../navigation/types";

const logo = require("../../../assets/logo.png");

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen padding={false} keyboard={false} backgroundColor={colors.primaryDark}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Peace &amp; Security</Text>
        <Text style={styles.subApp}>Citizen App</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Report. Respond. Resolve.</Text>
        <Text style={styles.taglineSub}>Serving Addis Ababa.</Text>
      </View>
      <View style={styles.actions}>
        <AppButton title="Login" onPress={() => navigation.navigate("Login")} />
        <AppButton
          title="Create Account"
          variant="outline"
          onPress={() => navigation.navigate("Register")}
          style={styles.secondary}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  logo: {
    width: 132,
    height: 132,
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.h1,
    color: colors.white,
    fontSize: 28,
  },
  subApp: {
    ...typography.h3,
    color: colors.primarySoft,
    marginTop: spacing.xs,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginVertical: spacing.lg,
  },
  tagline: {
    ...typography.bodyMedium,
    color: colors.white,
    fontSize: 16,
  },
  taglineSub: {
    ...typography.small,
    color: colors.primarySoft,
    marginTop: spacing.xs,
  },
  actions: {
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  secondary: {
    marginTop: spacing.md,
  },
});
