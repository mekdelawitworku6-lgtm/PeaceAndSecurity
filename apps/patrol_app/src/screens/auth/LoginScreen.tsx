import { Image, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { KeyboardSafeScreen } from "../../components/KeyboardSafeScreen";
import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { colors, radius, typography, shadows } from "../../theme";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearAuthError, login, selectAuthError } from "../../store/authSlice";

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = phoneNumber.trim().length > 0 && pin.length >= 4;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    await dispatch(login({ phoneNumber: phoneNumber.trim(), pin }));
    setLoading(false);
  };

  return (
    <KeyboardSafeScreen style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Peace &amp; Security</Text>
        <Text style={styles.appSub}>Patrol App</Text>
        <Text style={styles.tagline}>Report. Respond. Resolve.</Text>
        <Text style={styles.serving}>Serving Addis Ababa.</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppInput
          label="Phone number"
          value={phoneNumber}
          onChangeText={(t) => {
            setPhoneNumber(t);
            if (error) dispatch(clearAuthError());
          }}
          placeholder="+2519..."
          keyboardType="phone-pad"
          maxLength={15}
        />
        <AppInput
          label="PIN"
          value={pin}
          onChangeText={(t) => {
            setPin(t);
            if (error) dispatch(clearAuthError());
          }}
          placeholder="Enter your 4–6 digit PIN"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
        />
        <AppButton
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          disabled={!canSubmit}
          style={styles.button}
        />
        <Text style={styles.footnote}>
          Patrol accounts are created by your administrator. Contact your office if
          you need access.
        </Text>
      </View>
    </KeyboardSafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
  },
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.lg * 2,
    borderBottomRightRadius: radius.lg * 2,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 20,
    ...shadows.card,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  logo: {
    width: 64,
    height: 64,
  },
  appName: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
  appSub: {
    color: colors.primarySoft,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  tagline: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
  },
  serving: {
    color: colors.primarySoft,
    fontSize: 12,
    marginTop: 2,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  error: {
    backgroundColor: colors.danger + "1a",
    color: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    marginTop: 4,
  },
  footnote: {
    ...typography.small,
    textAlign: "center",
    marginTop: 18,
    paddingHorizontal: 16,
  },
});
