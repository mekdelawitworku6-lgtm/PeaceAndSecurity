import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, typography } from "../theme";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  onBack?: () => void;
}

export default function AppHeader({ title, subtitle, showBack = true, right, onBack }: AppHeaderProps) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  return (
    <View style={styles.header}>
      {showBack && canGoBack ? (
        <Pressable
          onPress={() => (onBack ? onBack() : navigation.goBack())}
          style={styles.side}
          hitSlop={12}
          accessibilityRole="button"
        >
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      <View style={styles.center}>
        <Text style={typography.h3} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  backGlyph: {
    fontSize: 34,
    lineHeight: 36,
    color: colors.primary,
    fontWeight: "700",
  },
});
