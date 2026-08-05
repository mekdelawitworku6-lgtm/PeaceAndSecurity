import { StyleSheet, Text, View } from "react-native";
import { radius } from "../theme";
import { statusColor, statusLabel } from "../utils/format";

export default function StatusBadge({ status }: { status?: string | null }) {
  const color = statusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1f` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{statusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
