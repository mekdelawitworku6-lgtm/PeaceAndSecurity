import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../theme";

type Variant = "primary" | "outline" | "danger" | "ghost";

export interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_STYLES: Record<Variant, { container: ViewStyle; textColor: string }> = {
  primary: { container: { backgroundColor: colors.primary }, textColor: colors.white },
  outline: {
    container: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
    textColor: colors.primary,
  },
  danger: { container: { backgroundColor: colors.danger }, textColor: colors.white },
  ghost: { container: { backgroundColor: colors.primaryLight }, textColor: colors.primary },
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  small = false,
  fullWidth = true,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const v = VARIANT_STYLES[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.regular,
        fullWidth && styles.fullWidth,
        v.container,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <Text style={[styles.label, { color: v.textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  regular: {
    height: 52,
    paddingHorizontal: spacing.xl,
  },
  small: {
    height: 38,
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
