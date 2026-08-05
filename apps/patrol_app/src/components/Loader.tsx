import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme";

export function Loader({ text }: { text?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

export function ListFooter({ loading, hasMore }: { loading?: boolean; hasMore?: boolean }) {
  if (!loading && !hasMore) return null;
  return (
    <View style={styles.footer}>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {!loading && hasMore ? <Text style={styles.text}>Loading more…</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  text: {
    ...typography.small,
    marginTop: 10,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
