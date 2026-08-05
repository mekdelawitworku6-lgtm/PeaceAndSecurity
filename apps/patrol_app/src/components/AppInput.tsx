import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { useState } from "react";
import { colors, radius, typography } from "../theme";

interface AppInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  hint?: string;
}

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  multiline = false,
  keyboardType = "default",
  maxLength,
  autoCapitalize = "none",
  editable = true,
  hint,
}: AppInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          multiline={multiline}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          editable={editable}
          style={[
            styles.input,
            multiline && styles.multiline,
            error ? styles.inputError : null,
          ]}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            style={styles.toggle}
            hitSlop={8}
          >
            <Text style={styles.toggleText}>{hidden ? "Show" : "Hide"}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    ...typography.label,
    marginBottom: 6,
  },
  inputRow: {
    position: "relative",
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.heading,
  },
  inputError: {
    borderColor: colors.danger,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  toggle: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  toggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
});
