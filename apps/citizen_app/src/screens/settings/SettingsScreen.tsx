import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import Card from "../../components/Card";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout, selectUser } from "../../store/authSlice";
import { assetUrl } from "../../config";
import { colors, spacing, typography } from "../../theme";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"SettingsTab">;

interface RowProps {
  icon: string;
  label: string;
  sub?: string;
  danger?: boolean;
  onPress: () => void;
}

function Row({ icon, label, sub, danger, onPress }: RowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const initials = (user?.fullName || "?")
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out of the Citizen App?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  const showAbout = () => {
    Alert.alert("About", "Peace & Security · Citizen App v1.0.0\nReport. Respond. Resolve.\nServing Addis Ababa.");
  };

  return (
    <Screen scroll keyboard={false}>
      <AppHeader title="Settings" showBack={false} />
      <View style={styles.body}>
        <Card style={styles.profileCard}>
          {user?.profileImage ? (
            <Image source={{ uri: assetUrl(user.profileImage) }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.fullName}</Text>
            <Text style={styles.phone}>{user?.phoneNumber}</Text>
            <Text style={styles.code}>Citizen code: {user?.userCode}</Text>
          </View>
        </Card>

        <Card style={styles.menuCard}>
          <Row
            icon="🔒"
            label="Change PIN"
            sub="Update your login PIN"
            onPress={() => navigation.navigate("ChangePin")}
          />
          <View style={styles.divider} />
          <Row
            icon="📍"
            label="Track Case"
            sub="Check report status by case ID"
            onPress={() => navigation.navigate("TrackCase")}
          />
          <View style={styles.divider} />
          <Row icon="ℹ️" label="About" sub="App information" onPress={showAbout} />
          <View style={styles.divider} />
          <Row icon="🚪" label="Log out" danger onPress={confirmLogout} />
        </Card>

        <Text style={styles.footer}>Peace &amp; Security · Citizen App v1.0.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  initials: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.h3,
  },
  phone: {
    ...typography.body,
    marginTop: 2,
  },
  code: {
    ...typography.caption,
    marginTop: 2,
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    ...typography.bodyMedium,
  },
  rowLabelDanger: {
    color: colors.danger,
  },
  rowSub: {
    ...typography.caption,
    marginTop: 1,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.lg + 36,
  },
  footer: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
