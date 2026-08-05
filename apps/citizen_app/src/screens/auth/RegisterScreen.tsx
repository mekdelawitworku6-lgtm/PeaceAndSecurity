import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import AppHeader from "../../components/AppHeader";
import { useAppDispatch } from "../../store/hooks";
import { clearAuthError, register } from "../../store/authSlice";
import { pickImages } from "../../utils/media";
import type { PickedMedia } from "../../types";
import { colors, spacing, typography } from "../../theme";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [profileImage, setProfileImage] = useState<PickedMedia | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const choosePhoto = async () => {
    const picked = await pickImages(1);
    if (picked.length > 0) setProfileImage(picked[0]);
  };

  const doRegister = async () => {
    const normalized = phoneNumber.trim().startsWith("+")
      ? phoneNumber.trim()
      : `+251${phoneNumber.replace(/\D/g, "").replace(/^251/, "")}`;

    if (fullName.trim().length < 3) {
      Alert.alert("Missing info", "Please enter your full name.");
      return;
    }
    if (!/^\+?[0-9]{9,15}$/.test(phoneNumber.trim())) {
      Alert.alert("Invalid phone", "Enter a valid phone number, e.g. +251911000031.");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      Alert.alert("Invalid PIN", "PIN must be 4-6 digits.");
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert("PIN mismatch", "The two PINs do not match.");
      return;
    }

    setSubmitting(true);
    dispatch(clearAuthError());
    const res = await dispatch(
      register({
        fullName: fullName.trim(),
        phoneNumber: normalized,
        profileImage,
      }),
    );
    setSubmitting(false);
    if (register.rejected.match(res)) {
      Alert.alert("Registration failed", res.payload || "Please try again.");
      return;
    }

    const token = res.payload?.registrationToken;
    if (!token) {
      Alert.alert("Registration failed", "No verification token returned. Please try again.");
      return;
    }
    navigation.navigate("VerifyOtp", {
      registrationToken: token,
      phoneNumber: normalized,
      pin,
    });
  };

  return (
    <Screen scroll>
      <AppHeader title="Create Account" />
      <View style={styles.body}>
        <Text style={styles.subtitle}>Register as a citizen of the Peace &amp; Security system.</Text>

        <Pressable onPress={choosePhoto} style={styles.avatarRow} hitSlop={8}>
          {profileImage ? (
            <Image source={{ uri: profileImage.uri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>📷</Text>
            </View>
          )}
          <Text style={styles.avatarLabel}>
            {profileImage ? "Change photo" : "Add profile photo (optional)"}
          </Text>
        </Pressable>

        <AppInput
          label="Full name"
          placeholder="Abebe Kebede"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <AppInput
          label="Phone number"
          placeholder="+251911000031"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <AppInput
          label="PIN (4-6 digits)"
          placeholder="Enter a PIN"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secure
          maxLength={6}
        />
        <AppInput
          label="Confirm PIN"
          placeholder="Repeat your PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          secure
          maxLength={6}
        />

        <AppButton title="Register" onPress={doRegister} loading={submitting} />

        <Pressable style={styles.linkRow} onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkAccent}>Log in</Text>
          </Text>
        </Pressable>
        <Text style={styles.hint}>
          A verification code will be sent to your phone. For local dev it appears in the backend
          console.
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 26,
  },
  avatarLabel: {
    marginLeft: spacing.lg,
    color: colors.primary,
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
  hint: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
