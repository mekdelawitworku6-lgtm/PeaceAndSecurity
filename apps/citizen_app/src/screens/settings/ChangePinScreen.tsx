import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import { useAppDispatch } from "../../store/hooks";
import { changePin } from "../../store/authSlice";
import { colors, spacing, typography } from "../../theme";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"ChangePin">;

export default function ChangePinScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!/^\d{4,6}$/.test(currentPin)) {
      setError("Enter your current 4-6 digit PIN.");
      return;
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      setError("New PIN must be 4-6 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("The new PINs do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await dispatch(changePin({ currentPin, newPin }));
    setSubmitting(false);
    if (changePin.rejected.match(res)) {
      setError(res.payload || "Failed to change PIN.");
      return;
    }
    Alert.alert("PIN updated", "Your PIN has been changed successfully.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <Screen scroll keyboard>
      <AppHeader title="Change PIN" />
      <View style={styles.body}>
        <Text style={styles.subtitle}>Your PIN is used to log in. Keep it secret.</Text>
        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <AppInput
          label="Current PIN"
          placeholder="Current PIN"
          value={currentPin}
          onChangeText={setCurrentPin}
          keyboardType="number-pad"
          secure
          maxLength={6}
        />
        <AppInput
          label="New PIN"
          placeholder="4-6 digits"
          value={newPin}
          onChangeText={setNewPin}
          keyboardType="number-pad"
          secure
          maxLength={6}
        />
        <AppInput
          label="Confirm new PIN"
          placeholder="Repeat new PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          secure
          maxLength={6}
        />

        <AppButton title="Change PIN" onPress={submit} loading={submitting} />
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
    marginBottom: spacing.lg,
    fontSize: 14,
    fontWeight: "600",
  },
});
