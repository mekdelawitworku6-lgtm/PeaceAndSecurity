import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import AppHeader from "../../components/AppHeader";
import { useAppDispatch } from "../../store/hooks";
import { clearAuthError, resendOtp, verifyRegistration } from "../../store/authSlice";
import { colors, spacing, typography } from "../../theme";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyOtp">;

export default function VerifyOtpScreen({ route }: Props) {
  const { registrationToken, phoneNumber, pin } = route.params;
  const dispatch = useAppDispatch();
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const doVerify = async () => {
    if (!/^\d{4,6}$/.test(otpCode.trim())) {
      Alert.alert("Invalid code", "Enter the 4-6 digit verification code.");
      return;
    }
    setSubmitting(true);
    dispatch(clearAuthError());
    const res = await dispatch(
      verifyRegistration({ registrationToken, otpCode: otpCode.trim(), pin }),
    );
    setSubmitting(false);
    if (verifyRegistration.rejected.match(res)) {
      Alert.alert("Verification failed", res.payload || "Please check your code and try again.");
    }
  };

  const doResend = async () => {
    setSubmitting(true);
    dispatch(clearAuthError());
    const res = await dispatch(resendOtp({ registrationToken }));
    setSubmitting(false);
    if (resendOtp.rejected.match(res)) {
      Alert.alert("Resend failed", res.payload || "Please try again.");
    } else {
      Alert.alert("Code sent", "A new verification code has been sent to your phone.");
    }
  };

  return (
    <Screen scroll>
      <AppHeader title="Verify Phone" />
      <View style={styles.body}>
        <Text style={styles.subtitle}>
          Enter the verification code sent to <Text style={styles.phone}>{phoneNumber}</Text>.
          For local development, the code is printed in the backend console.
        </Text>

        <AppInput
          label="Verification code"
          placeholder="123456"
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />

        <AppButton title="Verify & Continue" onPress={doVerify} loading={submitting} />

        <AppButton
          title="Resend code"
          variant="outline"
          onPress={doResend}
          loading={false}
          style={styles.resendBtn}
        />

        <Text style={styles.hint}>
          After verification your account is activated and you will be logged in with the PIN
          you chose.
        </Text>
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
    marginBottom: spacing.xl,
  },
  phone: {
    fontWeight: "700",
    color: colors.primary,
  },
  resendBtn: {
    marginTop: spacing.md,
  },
  hint: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
