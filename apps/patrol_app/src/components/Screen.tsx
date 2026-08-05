import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = false,
  keyboard = false,
  refreshControl,
  contentContainerStyle,
  style,
}: ScreenProps) {
  let body: React.ReactNode;
  if (scroll) {
    body = (
      <ScrollView
        contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  } else {
    body = children;
  }

  return (
    <SafeAreaView style={[styles.safe, style]} edges={["top", "left", "right"]}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
});
