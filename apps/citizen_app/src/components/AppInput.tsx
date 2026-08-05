import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
  type TextInputProps,
} from "react-native";
import { colors, radius, spacing, typography } from "../theme";

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  secure?: boolean;
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function AppInput({
  label,
  error,
  secure = false,
  multiline = false,
  containerStyle,
  style,
  ...rest
}: AppInputProps) {
  const [hidden, setHidden] = useState(secure);
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View>
        <TextInput
          style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null, style]}
          secureTextEntry={hidden}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            style={styles.toggle}
            hitSlop={10}
          >
            <Text style={styles.toggleText}>{hidden ? "Show" : "Hide"}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs + 2,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 52,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  multiline: {
    height: 110,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: colors.danger,
  },
  toggle: {
    position: "absolute",
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  toggleText: {
    color: colors.primary,
    fontSize: typography.small.fontSize,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
});
