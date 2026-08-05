import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import AppHeader from "../../components/AppHeader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearAuthError, login, selectAuthError } from "../../store/authSlice";
import { colors, spacing, typography } from "../../theme";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const doLogin = async () => {
    if (!phone.trim() || !pin.trim()) {
      Alert.alert("Missing info", "Please enter your phone number and PIN.");
      return;
    }
    setSubmitting(true);
    dispatch(clearAuthError());
    const res = await dispatch(login({ phoneNumber: phone.trim(), pin: pin.trim() }));
    setSubmitting(false);
    if (login.rejected.match(res)) {
      Alert.alert("Login failed", res.payload || "Please try again.");
    }
  };

  return (
    <Screen scroll>
      <AppHeader title="Login" />
      <View style={styles.body}>
        <Text style={typography.h2}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in with your phone number and PIN.</Text>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <AppInput
          label="Phone number"
          placeholder="+251911000031"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <AppInput
          label="PIN"
          placeholder="4-6 digit PIN"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secure
          maxLength={6}
        />

        <AppButton title="Login" onPress={doLogin} loading={submitting} />

        <Pressable style={styles.linkRow} onPress={() => navigation.navigate("Register")} hitSlop={8}>
          <Text style={styles.linkText}>
            New here? <Text style={styles.linkAccent}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: colors.danger,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    fontSize: 14,
    fontWeight: "600",
  },
  linkRow: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  linkText: {
    ...typography.body,
  },
  linkAccent: {
    color: colors.primary,
    fontWeight: "700",
  },
});
