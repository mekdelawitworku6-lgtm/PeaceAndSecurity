import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { colors, radius, typography, shadows } from "../../theme";
import { assetUrl } from "../../config";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout, selectUser } from "../../store/authSlice";
import type { RootStackParamList } from "../../navigation/types";

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const initials = (user?.fullName ?? "P")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatarUri = user?.profileImage ? assetUrl(user.profileImage) : "";

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  const showAbout = () => {
    Alert.alert(
      "About",
      "Patrol App\nPeace & Security — Serving Addis Ababa.\nVersion 1.0.0",
      [{ text: "OK" }],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppHeader title="Settings" onBack={null} />
      <View style={styles.content}>
        <View style={styles.profileCard}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.fullName ?? "Patrol Officer"}</Text>
            <Text style={styles.detail}>{user?.phoneNumber ?? ""}</Text>
            {user?.userCode ? <Text style={styles.detail}>Code: {user.userCode}</Text> : null}
            {user?.assignedArea ? (
              <Text style={styles.detail}>Area: {user.assignedArea}</Text>
            ) : null}
            {user?.officeAddress ? (
              <Text style={styles.detail}>{user.officeAddress}</Text>
            ) : null}
          </View>
        </View>

        <Row icon="◈" label="Change PIN" onPress={() => navigation.navigate("ChangePin")} />
        <Row icon="ⓘ" label="About" onPress={showAbout} />
        <Row icon="⏻" label="Log out" onPress={confirmLogout} danger />
      </View>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const tint = danger ? colors.danger : colors.primary;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text style={[styles.rowIcon, { color: tint }]}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
    ...shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: colors.primarySoft,
  },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 2,
  },
  detail: {
    ...typography.body,
    fontSize: 13,
    color: colors.body,
    marginTop: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  rowIcon: {
    fontSize: 18,
    fontWeight: "700",
    width: 28,
  },
  rowLabel: {
    ...typography.subtitle,
    fontSize: 15,
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    color: colors.muted,
  },
});
