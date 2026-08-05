import { Alert, StyleSheet, Text } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { KeyboardSafeScreen } from "../../components/KeyboardSafeScreen";
import { AppHeader } from "../../components/AppHeader";
import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { colors, radius, typography } from "../../theme";
import { useAppDispatch, useAppSelector } from "../../store";
import { changePin, clearAuthError, selectAuthError } from "../../store/authSlice";

export function ChangePinScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validNewPin = /^\d{4,6}$/.test(newPin);
  const canSubmit =
    currentPin.length >= 4 && validNewPin && newPin === confirmPin && !loading;

  const submit = async () => {
    if (newPin !== confirmPin) {
      setLocalError("New PIN and confirmation do not match.");
      return;
    }
    if (!validNewPin) {
      setLocalError("New PIN must be 4–6 digits.");
      return;
    }
    setLoading(true);
    const res = await dispatch(changePin({ currentPin, newPin }));
    setLoading(false);
    const r = res as { meta?: { requestStatus?: string } };
    if (r.meta?.requestStatus === "fulfilled") {
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      Alert.alert("PIN changed", "Your PIN has been updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <KeyboardSafeScreen>
      <AppHeader title="Change PIN" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {localError ? <Text style={styles.error}>{localError}</Text> : null}
      <Text style={styles.body}>
        Your PIN is used to sign in to the Patrol App. Keep it private.
      </Text>
      <AppInput
        label="Current PIN"
        value={currentPin}
        onChangeText={(t) => {
          setCurrentPin(t);
          setLocalError(null);
          dispatch(clearAuthError());
        }}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
      />
      <AppInput
        label="New PIN (4–6 digits)"
        value={newPin}
        onChangeText={(t) => {
          setNewPin(t);
          setLocalError(null);
          dispatch(clearAuthError());
        }}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
      />
      <AppInput
        label="Confirm new PIN"
        value={confirmPin}
        onChangeText={(t) => {
          setConfirmPin(t);
          setLocalError(null);
          dispatch(clearAuthError());
        }}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
      />
      <AppButton
        title="Update PIN"
        onPress={submit}
        loading={loading}
        disabled={!canSubmit}
      />
    </KeyboardSafeScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: colors.danger + "1a",
    color: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    ...typography.body,
    marginBottom: 14,
  },
});
