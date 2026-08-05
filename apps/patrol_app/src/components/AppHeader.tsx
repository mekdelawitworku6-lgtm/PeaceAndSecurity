import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, typography } from "../theme";

interface AppHeaderProps {
  title: string;
  onBack?: (() => void) | null;
  right?: React.ReactNode;
}

export function AppHeader({ title, onBack, right }: AppHeaderProps) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        {onBack !== null && (
          <Pressable onPress={handleBack} hitSlop={10} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  side: {
    width: 60,
  },
  right: {
    alignItems: "flex-end",
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    fontSize: 26,
    lineHeight: 28,
    color: colors.primary,
    fontWeight: "600",
    marginTop: -4,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    flex: 1,
    textAlign: "center",
  },
});
